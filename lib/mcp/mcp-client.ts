import { z } from 'zod';
import { Client as MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { OAuthClientMetadata } from '@modelcontextprotocol/sdk/shared/auth.js';
import { DatabaseOAuthClientProvider } from '@/lib/mcp/oauth-provider';
import { jsonSchema, type Schema, tool, type ToolSet } from 'ai';

type CallToolResult = any;

export type inferParameters<PARAMETERS extends ToolParameters> =
  PARAMETERS extends Schema<any>
    ? PARAMETERS['_type']
    : PARAMETERS extends z.ZodTypeAny
      ? z.infer<PARAMETERS>
      : never;

export type ToolParameters = z.ZodTypeAny | Schema<any>;

type ToolResultContent = Array<
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'image';
      data: string; // base64 encoded png image, e.g. screenshot
      mimeType?: string; // e.g. 'image/png';
    }
>;

interface ToolExecutionOptions {
  timeout?: number;
  abortSignal?: AbortSignal;
  // Add any other options that might be needed
}

/**
A tool contains the description and the schema of the input that the tool expects.
This enables the language model to generate the input.

The tool can also contain an optional execute function for the actual execution function of the tool.
 */
export type Tool<PARAMETERS extends ToolParameters = any, RESULT = any> = {
  /**
The schema of the input that the tool expects. The language model will use this to generate the input.
It is also used to validate the output of the language model.
Use descriptions to make the input understandable for the language model.
   */
  parameters: PARAMETERS;

  /**
An optional description of what the tool does.
Will be used by the language model to decide whether to use the tool.
Not used for provider-defined tools.
   */
  description?: string;

  /**
Optional conversion function that maps the tool result to multi-part tool content for LLMs.
   */
  experimental_toToolResultContent?: (result: RESULT) => ToolResultContent;

  /**
An async function that is called with the arguments from the tool call and produces a result.
If not provided, the tool will not be executed automatically.

@args is the input of the tool call.
@options.abortSignal is a signal that can be used to abort the tool call.
   */
  execute?: (
    args: inferParameters<PARAMETERS>,
    options: ToolExecutionOptions,
  ) => PromiseLike<RESULT>;
} & (
  | {
      /**
Function tool.
       */
      type?: undefined | 'function';
    }
  | {
      /**
Provider-defined tool.
       */
      type: 'provider-defined';

      /**
The ID of the tool. Should follow the format `<provider-name>.<tool-name>`.
       */
      id: `${string}.${string}`;

      /**
The arguments for configuring the tool. Must match the expected arguments defined by the provider for this tool.
       */
      args: Record<string, unknown>;
    }
);

// export const webSearch = tool({
//   description: 'Search the web for up-to-date information',
//   inputSchema: z.object({
//     query: z.string().min(1).max(100).describe('The search query'),
//   }),
//   execute: async ({ query }) => {
//     const exa = new Exa(process.env.EXA_API_KEY);
//     const { results } = await exa.searchAndContents(query, {
//       livecrawl: 'always',
//       numResults: 3,
//     });
//     return results.map((result) => ({
//       title: result.title,
//       url: result.url,
//       content: result.text.slice(0, 1000), // take just the first 1000 characters — optimize this
//       publishedDate: result.publishedDate,
//     }));
//   },
// });

class MCPSessionManager {
  private serverUrl: string;
  private client: MCPClient | null = null;
  private toolsCache: ToolSet | null = null;
  private connectionPromise: Promise<void> | null = null;
  private sessionId: string | undefined;
  private chatId: string;
  private userId: string;
  private keepalive: NodeJS.Timeout | null = null;

  constructor(
    mcpBaseUrl: string,
    userId: string,
    chatId: string,
    sessionId: string | undefined,
  ) {
    // console.log(`Using ${mcpBaseUrl} as the MCP Server.`);
    this.serverUrl = `${mcpBaseUrl}`;
    this.sessionId = sessionId;
    this.chatId = chatId;
    this.userId = userId;

    // console.log(
    //   `Creating MCP Session: ${this.serverUrl} chatId=${this.chatId} sessionId=${this.sessionId}`,
    // );
  }

  /**
   * Connects to the MCP SSE endpoint and initializes the session
   */
  public async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        // OAuth-aware transport with DB-backed token provider
        const metadata: OAuthClientMetadata = {
          client_name: 'EvLab MCP Client',
          redirect_uris: [
            // Not used during chat; required by type. Keep placeholder.
            'http://localhost/unused',
          ],
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_post',
          scope: 'mcp:tools',
        };
        const oauthProvider = await DatabaseOAuthClientProvider.create(
          this.userId,
          'rube',
          'http://localhost/unused',
          metadata,
        );
        const transport = new StreamableHTTPClientTransport(
          new URL(this.serverUrl),
          {
            authProvider: oauthProvider,
          },
        );

        this.client = new MCPClient(
          {
            name: 'Rube MCP',
            version: '0.0.1',
          },
          {
            capabilities: {},
          },
        );

        // Initialize the connection
        await this.client.connect(transport);
        this.sessionId = transport.sessionId;
        console.log('MCP connection established');
        resolve();
      } catch (error) {
        console.error('MCP connection error:', error);
        this.close();
        reject(
          new Error(
            'Failed to establish MCP connection (check Rube MCP linking)',
          ),
        );
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnects from the MCP endpoint
   */
  public close(): void {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this.connectionPromise = null;
    this.toolsCache = null;

    if (this.keepalive) {
      clearInterval(this.keepalive);
    }
  }

  /**
   * Fetches the available tools from the MCP server
   * @returns A record of tool objects with execute methods
   */
  public async tools({ useCache }: { useCache: boolean }): Promise<ToolSet> {
    // Ensure we're connected first
    await this.connect();

    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    if (useCache && this.toolsCache) {
      return this.toolsCache;
    }
    const mcpTools = await this.client.listTools();
    const executableTools = this.convertTools(mcpTools.tools);
    this.toolsCache = executableTools;

    return executableTools;
  }

  /**
   * Converts MCP SDK tools to the expected format with execute methods
   */
  private convertTools(
    mcpTools: Awaited<
      ReturnType<NonNullable<MCPSessionManager['client']>['listTools']>
    >['tools'],
  ): ToolSet {
    const tools: ToolSet = {};

    for (const mcpTool of Object.values(mcpTools)) {
      tools[mcpTool.name] = tool({
        description: mcpTool.description || '',
        inputSchema: jsonSchema(mcpTool.inputSchema),
        execute: async (args: unknown, options: ToolExecutionOptions) => {
          console.log(`>> Executing MCP tool: ${mcpTool.name}`);
          console.log(`>> Tool args:`, JSON.stringify(args, null, 2));

          const result = await this.executeTool(mcpTool.name, args, {
            timeout: 180_000, // 3 minutes
            ...options,
          });

          console.log(`>> Tool result:`, JSON.stringify(result, null, 2));

          // Try different return formats for v5 compatibility
          if (result && result.content && Array.isArray(result.content)) {
            const textContent = result.content
              .filter((item: any) => item.type === 'text')
              .map((item: any) => item.text)
              .join('\n');

            if (textContent) {
              console.log(`>> Returning extracted text:`, textContent);

              // Return just the text content for v5 compatibility
              return textContent;
            }
          }

          return result;
        },
      });
    }

    // tools['Web_Search'] = webSearch;

    console.log('Tools:\n', Object.keys(tools).join(',\n'), '\n\n');

    return tools;
  }

  /**
   * Executes a tool with the given arguments
   */
  private async executeTool(
    name: string,
    args: unknown,
    options: ToolExecutionOptions,
  ): Promise<CallToolResult> {
    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    const abortController = options.abortSignal
      ? new AbortController()
      : new AbortController();

    // Link the provided abort signal to our controller if one was provided
    if (options.abortSignal) {
      options.abortSignal.addEventListener('abort', () => {
        abortController.abort();
      });
    }

    // Set up timeout if specified
    let timeoutId: NodeJS.Timeout | null = null;
    if (options.timeout) {
      timeoutId = setTimeout(() => {
        abortController.abort();
      }, options.timeout);
    }

    try {
      // Execute the tool using the SDK
      const result = await this.client.callTool({
        name,
        arguments: args as Record<string, unknown>,
      });

      // Clear timeout if it was set
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      return result;
    } catch (error) {
      if (abortController.signal.aborted) {
        throw new Error('Tool execution aborted or timed out');
      }
      throw error;
    }
  }
}

export { MCPSessionManager, type ToolExecutionOptions, type CallToolResult };
