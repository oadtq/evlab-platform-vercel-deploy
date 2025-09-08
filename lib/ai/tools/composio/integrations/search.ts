import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { z } from 'zod';

// Google Search Tool
export const composioSearch = createComposioTool({
  name: 'composioSearch',
  description: 'Perform a Google search using the Composio Google Search API.',
  inputSchema: z.object({
    query: z
      .string()
      .describe('The search query for the Composio Google Search API.'),
  }),
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_SEARCH',
  execute: async ({ query }, composioTool, userId) => {
    const result = await composioTool.execute({
      query,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Search completed successfully'
        : result.error,
      data: result.data,
      query,
    };
  },
});

// Tavily LLM Search Tool
export const composioTavilySearch = createComposioTool({
  name: 'composioTavilySearch',
  description:
    'Perform an advanced LLM-powered search using Tavily API with filtering options.',
  inputSchema: z.object({
    query: z.string().describe('The primary text used to perform the search.'),
    max_results: z
      .number()
      .optional()
      .default(5)
      .describe(
        'The maximum number of search results that the API should return.',
      ),
    search_depth: z
      .enum(['basic', 'advanced'])
      .optional()
      .default('basic')
      .describe('Determines the thoroughness of the search.'),
    include_answer: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Specifies whether to include direct answers to the query in the search results.',
      ),
    include_images: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'A flag indicating whether to include images in the search results.',
      ),
    include_raw_content: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'If set to true, the search results will include the raw content from the search index.',
      ),
    include_domains: z
      .array(z.string())
      .optional()
      .describe('A list of domain names to include in the search results.'),
    exclude_domains: z
      .array(z.string())
      .optional()
      .describe('A list of domain names to exclude from the search results.'),
  }),
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_TAVILY_SEARCH',
  execute: async (params, composioTool, userId) => {
    const result = await composioTool.execute(params);
    return {
      success: result.successful,
      message: result.successful
        ? 'Tavily search completed successfully'
        : result.error,
      data: result.data,
      query: params.query,
    };
  },
});

// Exa Similar Links Search Tool
export const composioExaSimilarLink = createComposioTool({
  name: 'composioExaSimilarLink',
  description:
    'Perform a search to find similar links and retrieve a list of relevant results.',
  inputSchema: z.object({
    url: z
      .string()
      .describe('The url for which you would like to find similar links.'),
    numResults: z
      .number()
      .optional()
      .describe('Number of search results to return.'),
    category: z
      .string()
      .optional()
      .describe(
        'A data category to focus on, with higher comprehensivity and data cleanliness.',
      ),
    type: z
      .string()
      .optional()
      .describe('The type of search: keyword, neural, or magic.'),
    useAutoprompt: z
      .boolean()
      .optional()
      .describe(
        'If true, your query will be converted to an Composio Similarlinks query.',
      ),
    includeDomains: z
      .array(z.string())
      .optional()
      .describe('List of domains to include in the search.'),
    excludeDomains: z
      .array(z.string())
      .optional()
      .describe('List of domains to exclude in the search.'),
    startPublishedDate: z
      .string()
      .optional()
      .describe('Only links published after this date will be returned.'),
    endPublishedDate: z
      .string()
      .optional()
      .describe('Only links published before this date will be returned.'),
    startCrawlDate: z
      .string()
      .optional()
      .describe('Results will include links crawled after this date.'),
    endCrawlDate: z
      .string()
      .optional()
      .describe('Results will include links crawled before this date.'),
  }),
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_EXA_SIMILARLINK',
  execute: async (params, composioTool, userId) => {
    const result = await composioTool.execute(params);
    return {
      success: result.successful,
      message: result.successful
        ? 'Similar links search completed successfully'
        : result.error,
      data: result.data,
      url: params.url,
    };
  },
});

// Image Search Tool
export const composioImageSearch = createComposioTool({
  name: 'composioImageSearch',
  description: 'Perform an image search using the Composio Image Search API.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'The search query for the Composio Image Search API, specifying the image topic.',
      ),
  }),
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_IMAGE_SEARCH',
  execute: async ({ query }, composioTool, userId) => {
    const result = await composioTool.execute({
      query,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Image search completed successfully'
        : result.error,
      data: result.data,
      query,
    };
  },
});

// Trends Search Tool
export const composioTrendsSearch = createComposioTool({
  name: 'composioTrendsSearch',
  description: 'Perform a trend search using the Google Trends Search API.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'The search query for the Google Trends Search API, specifying the trend topic.',
      ),
    data_type: z
      .string()
      .optional()
      .default('TIMESERIES')
      .describe('Parameter defines the type of search you want to do.'),
  }),
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_TRENDS_SEARCH',
  execute: async ({ query, data_type }, composioTool, userId) => {
    const result = await composioTool.execute({
      query,
      data_type,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Trends search completed successfully'
        : result.error,
      data: result.data,
      query,
    };
  },
});

// Register all tools
registerComposioTool({
  name: 'Search',
  tool: composioSearch,
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_SEARCH',
});

registerComposioTool({
  name: 'TavilySearch',
  tool: composioTavilySearch,
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_TAVILY_SEARCH',
});

registerComposioTool({
  name: 'ExaSimilarLink',
  tool: composioExaSimilarLink,
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_EXA_SIMILARLINK',
});

registerComposioTool({
  name: 'ImageSearch',
  tool: composioImageSearch,
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_IMAGE_SEARCH',
});

registerComposioTool({
  name: 'TrendsSearch',
  tool: composioTrendsSearch,
  integrationName: 'Composio Search',
  composioToolName: 'COMPOSIO_SEARCH_TRENDS_SEARCH',
});
