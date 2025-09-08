import { getComposioClient } from '@/lib/composio/client';
import { tool, type UIMessageStreamWriter } from 'ai';
import type { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';

interface ComposioToolProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

// Helper function to create Composio tools
export const createComposioTool =
  ({
    name,
    description,
    inputSchema,
    integrationName,
    composioToolName,
    execute: customExecute,
  }: {
    name: string;
    description: string;
    inputSchema: z.ZodSchema;
    integrationName: string;
    composioToolName: string;
    execute: (params: any, composioTool: any, userId: string) => Promise<any>;
  }) =>
  ({ session, dataStream }: ComposioToolProps) =>
    tool({
      description,
      inputSchema,
      execute: async (params) => {
        const userId = session.user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          const composio = getComposioClient();

          // Debug: Note about available tools check
          // console.log(`🔍 Debug: Checking for tool: ${composioToolName}`);

          const tools = await composio.tools.get(userId, composioToolName);

          // console.log(
          //   `🔍 Debug: Got ${tools?.length || 0} tools for ${composioToolName}, userId: ${userId}`,
          // );
          // console.log(`🔍 Debug: Tools array:`, tools);
          // console.log(`🔍 Debug: Type of tools:`, typeof tools);

          // Handle both array and object responses from Composio
          let toolToExecute: any;
          if (Array.isArray(tools)) {
            // Legacy array format
            if (tools.length === 0) {
              throw new Error(
                `Tool ${composioToolName} not found. No tools returned from Composio.`,
              );
            }
            toolToExecute = tools[0];
          } else if (tools && typeof tools === 'object') {
            // Object format with tool name as key
            toolToExecute = tools[composioToolName];
            if (!toolToExecute) {
              console.error(
                `❌ Error: Tool ${composioToolName} not found in object:`,
                Object.keys(tools),
              );
              throw new Error(
                `Tool ${composioToolName} not found in returned tools object. Available tools: ${Object.keys(tools).join(', ')}`,
              );
            }
          } else {
            throw new Error(
              `Unexpected response format from Composio tools.get(). Expected array or object, got ${typeof tools}: ${JSON.stringify(tools)}`,
            );
          }

          if (!toolToExecute) {
            throw new Error(
              `Tool ${composioToolName} is null/undefined. This indicates a problem with the Composio integration.`,
            );
          }

          if (!toolToExecute.execute) {
            console.error(`❌ Error: Tool does not have execute method!`);
            console.error(
              `❌ Error: Tool properties:`,
              Object.keys(toolToExecute),
            );
            throw new Error(
              `Tool ${composioToolName} does not have execute method. Tool properties: ${Object.keys(toolToExecute).join(', ')}`,
            );
          }

          console.log(
            `✅ Debug: About to call customExecute with tool:`,
            toolToExecute,
          );
          const result = await customExecute(params, toolToExecute, userId);

          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          console.error(`❌ Full error details:`, error);

          // Provide specific guidance for common errors
          let userFriendlyMessage = errorMessage;
          if (errorMessage.includes('COMPOSIO_API_KEY')) {
            userFriendlyMessage =
              'Composio API key is not configured. Please set the COMPOSIO_API_KEY environment variable to enable integrations.';
          } else if (
            errorMessage.includes('Tool') &&
            errorMessage.includes('not found')
          ) {
            userFriendlyMessage = `${errorMessage}\n\nThis might indicate:\n• The integration is not properly connected\n• The tool name is incorrect\n• You need to authenticate with the service first`;
          } else if (
            errorMessage.includes('returned undefined') ||
            errorMessage.includes('does not have execute method')
          ) {
            userFriendlyMessage = `${errorMessage}\n\nThis indicates a problem with the Composio integration setup. The tool exists but is malformed. Check your API key and integration configuration.`;
          }

          return {
            success: false,
            error: errorMessage,
            message: `❌ **Error**\n\n${userFriendlyMessage}`,
          };
        }
      },
    });
