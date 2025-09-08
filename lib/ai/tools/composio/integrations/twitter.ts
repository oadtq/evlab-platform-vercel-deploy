import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Create a New DM Conversation
export const twitterCreateNewDmConversation = createComposioTool({
  name: 'twitterCreateNewDmConversation',
  description:
    'Creates a new group direct message (dm) conversation on twitter with specified participant ids and an initial message, which can include text and media attachments',
  inputSchema: z.object({
    conversation_type: z
      .string()
      .describe(
        "Specifies the type of conversation to be created. Must be 'Group' for this action.",
      )
      .refine((val) => val === 'Group', {
        message: 'conversation_type must be "Group"',
      }),
    message: z
      .object({})
      .passthrough()
      .describe(
        'A JSON object representing the initial message for the DM conversation. It must contain a \'text\' field for the message content, and can optionally include an \'attachments\' field for media (e.g., `attachments: [{"media_id": "media_id_string"}]`).',
      ),
    participant_ids: z
      .array(z.string())
      .describe(
        'A list of Twitter User IDs for the participants to be included in the group DM conversation. The authenticated user is implicitly included.',
      ),
  }),
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_CREATE_A_NEW_DM_CONVERSATION',
  execute: async (
    { conversation_type, message, participant_ids },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      conversation_type,
      message,
      participant_ids,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'DM conversation created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Creation of a Post (Tweet)
export const twitterCreationOfAPost = createComposioTool({
  name: 'twitterCreationOfAPost',
  description:
    'Creates a tweet on twitter; `text` is required unless `card uri`, `media media ids`, `poll options`, or `quote tweet id` is provided',
  inputSchema: z.object({
    card_uri: z
      .string()
      .optional()
      .describe(
        'URI of a card to attach. Mutually exclusive with `quote_tweet_id`, `poll` parameters, `media` parameters, and `direct_message_deep_link`.',
      ),
    direct_message_deep_link: z
      .string()
      .optional()
      .describe(
        'Deep link to a private Direct Message conversation. Mutually exclusive with `card_uri`.',
      ),
    for_super_followers_only: z
      .boolean()
      .default(false)
      .optional()
      .describe("Restricts Tweet visibility to the author's Super Followers."),
    geo__place__id: z
      .string()
      .optional()
      .describe('Twitter Place ID to associate with the Tweet.'),
    media__media__ids: z
      .array(z.string())
      .optional()
      .describe(
        'Up to 4 Media IDs obtained from prior uploads. Mutually exclusive with `card_uri`.',
      ),
    media__tagged__user__ids: z
      .array(z.string())
      .optional()
      .describe(
        'User IDs to tag in media; tagged users must have enabled photo tagging. Mutually exclusive with `card_uri`.',
      ),
    nullcast: z
      .boolean()
      .default(false)
      .optional()
      .describe(
        'Marks the Tweet as a promoted-only post, not appearing in public timelines or served to followers.',
      ),
    poll__duration__minutes: z
      .number()
      .optional()
      .describe(
        'Poll duration in minutes (5-10080). Required if `poll_options` are provided. Mutually exclusive with `card_uri`.',
      ),
    poll__options: z
      .array(z.string())
      .optional()
      .describe(
        'List of 2 to 4 poll options (max 25 characters each). Required if creating a poll. Mutually exclusive with `card_uri`.',
      ),
    poll__reply__settings: z
      .string()
      .optional()
      .refine((val) => !val || ['following', 'mentionedUsers'].includes(val), {
        message:
          'poll__reply__settings must be one of: following, mentionedUsers',
      })
      .describe(
        "Specifies who can reply to the poll Tweet: 'following' or 'mentionedUsers'. Mutually exclusive with `card_uri`.",
      ),
    quote_tweet_id: z
      .string()
      .regex(/^[0-9]{1,19}$/)
      .optional()
      .describe(
        'ID of the Tweet to quote. Mutually exclusive with `card_uri`, `poll` parameters, and `direct_message_deep_link`.',
      ),
    reply__exclude__reply__user__ids: z
      .array(z.string())
      .optional()
      .describe(
        'User IDs to exclude from @mentioning in the reply; these users will not be notified. Used when `reply_in_reply_to_tweet_id` is set.',
      ),
    reply__in__reply__to__tweet__id: z
      .string()
      .regex(/^[0-9]{1,19}$/)
      .optional()
      .describe(
        'ID of the Tweet to which this is a reply. Required if creating a reply.',
      ),
    reply_settings: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val || ['following', 'mentionedUsers', 'subscribers'].includes(val),
        {
          message:
            'reply_settings must be one of: following, mentionedUsers, subscribers',
        },
      )
      .describe(
        "Specifies who can reply to this Tweet: 'following', 'mentionedUsers', or 'subscribers' (X Premium subscribers).",
      ),
    text: z
      .string()
      .optional()
      .describe(
        'Text content of the Tweet (max 280 characters). Required unless `card_uri`, `media_media_ids`, `poll_options`, or `quote_tweet_id` are provided.',
      ),
  }),
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_CREATION_OF_A_POST',
  execute: async (
    {
      card_uri,
      direct_message_deep_link,
      for_super_followers_only,
      geo__place__id,
      media__media__ids,
      media__tagged__user__ids,
      nullcast,
      poll__duration__minutes,
      poll__options,
      poll__reply__settings,
      quote_tweet_id,
      reply__exclude__reply__user__ids,
      reply__in__reply__to__tweet__id,
      reply_settings,
      text,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      card_uri,
      direct_message_deep_link,
      for_super_followers_only,
      geo__place__id,
      media__media__ids,
      media__tagged__user__ids,
      nullcast,
      poll__duration__minutes,
      poll__options,
      poll__reply__settings,
      quote_tweet_id,
      reply__exclude__reply__user__ids,
      reply__in__reply__to__tweet__id,
      reply_settings,
      text,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Tweet created successfully' : result.error,
      data: result.data,
    };
  },
});

// Delete DM
export const twitterDeleteDm = createComposioTool({
  name: 'twitterDeleteDm',
  description:
    'Permanently deletes a specific twitter direct message (dm) event using its `event id` if the authenticated user sent it; this action is irreversible and does not delete entire conversations',
  inputSchema: z.object({
    event_id: z
      .string()
      .describe(
        'The unique identifier of the Direct Message event to be deleted.',
      ),
  }),
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_DELETE_DM',
  execute: async ({ event_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      event_id,
    });
    return {
      success: result.successful,
      message: result.successful ? 'DM deleted successfully' : result.error,
      data: result.data,
    };
  },
});

// Full Archive Search
export const twitterFullArchiveSearch = createComposioTool({
  name: 'twitterFullArchiveSearch',
  description:
    "Searches the full archive of public tweets from march 2006 onwards; use 'start time' and 'end time' together for a defined time window.",
  inputSchema: z.object({
    end_time: z
      .string()
      .optional()
      .describe(
        "The newest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ) to which Tweets will be provided. Exclusive. Example: '2021-01-31T23:59:59Z'.",
      ),
    expansions: z
      .array(z.string())
      .optional()
      .describe(
        'Specifies which objects to expand in the response for more details.',
      ),
    max_results: z
      .number()
      .default(10)
      .optional()
      .describe(
        'The maximum number of search results to return per request. Values can be between 10 and the limit defined by the API (typically 100 or 500).',
      ),
    media__fields: z
      .array(z.string())
      .optional()
      .describe(
        "Specifies which media fields to include if 'attachments.media_keys' is expanded.",
      ),
    next_token: z
      .string()
      .optional()
      .describe(
        'A token obtained from a previous response to retrieve the next page of results. Do not modify this value.',
      ),
    pagination_token: z
      .string()
      .optional()
      .describe(
        "Alternative to 'next_token' for paginating through results. Token from a previous response for the next page. Do not modify.",
      ),
    place__fields: z
      .array(z.string())
      .optional()
      .describe(
        "Specifies which place fields to include if 'geo.place_id' is expanded.",
      ),
    poll__fields: z
      .array(z.string())
      .optional()
      .describe(
        "Specifies which poll fields to include if 'attachments.poll_ids' is expanded.",
      ),
    query: z
      .string()
      .describe(
        'The search query or rule to match Tweets. Maximum length varies; refer to Twitter API documentation for details (e.g., https://t.co/rulelength).',
      ),
    since_id: z
      .string()
      .optional()
      .describe(
        'Returns results with a Tweet ID numerically greater (more recent) than the specified ID.',
      ),
    sort_order: z
      .string()
      .optional()
      .refine((val) => !val || ['recency', 'relevancy'].includes(val), {
        message: 'sort_order must be one of: recency, relevancy',
      })
      .describe(
        "Specifies the order in which to return results. 'recency' returns the most recent Tweets first, 'relevancy' returns Tweets based on relevance.",
      ),
    start_time: z
      .string()
      .optional()
      .describe(
        "The oldest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ) from which Tweets will be provided. Inclusive. Example: '2021-01-01T00:00:00Z'.",
      ),
    tweet__fields: z
      .array(z.string())
      .optional()
      .describe('Specifies which Tweet fields to include in the response.'),
    until_id: z
      .string()
      .optional()
      .describe(
        'Returns results with a Tweet ID numerically less (older) than the specified ID.',
      ),
    user__fields: z
      .array(z.string())
      .optional()
      .describe(
        "Specifies which user fields to include if 'author_id' or other user-related expansions are used.",
      ),
  }),
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_FULL_ARCHIVE_SEARCH',
  execute: async (
    {
      end_time,
      expansions,
      max_results,
      media__fields,
      next_token,
      pagination_token,
      place__fields,
      poll__fields,
      query,
      since_id,
      sort_order,
      start_time,
      tweet__fields,
      until_id,
      user__fields,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      end_time,
      expansions,
      max_results,
      media__fields,
      next_token,
      pagination_token,
      place__fields,
      poll__fields,
      query,
      since_id,
      sort_order,
      start_time,
      tweet__fields,
      until_id,
      user__fields,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Full archive search completed successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Full Archive Search Counts
export const twitterFullArchiveSearchCounts = createComposioTool({
  name: 'twitterFullArchiveSearchCounts',
  description:
    'Returns a count of tweets from the full archive that match a specified query, aggregated by day, hour, or minute; `start time` must be before `end time` if both are provided, and `since id`/`until id` cannot be used with `start time`/`end time`.',
  inputSchema: z.object({
    end_time: z
      .string()
      .optional()
      .describe(
        'Newest UTC timestamp (exclusive, YYYY-MM-DDTHH:mm:ssZ) to count Tweets up to. If specified, `start_time` is also required and `end_time` must be later.',
      ),
    granularity: z
      .string()
      .default('hour')
      .optional()
      .refine((val) => !val || ['day', 'hour', 'minute'].includes(val), {
        message: 'granularity must be one of: day, hour, minute',
      })
      .describe(
        'Time period granularity for aggregating search count results.',
      ),
    next_token: z
      .string()
      .optional()
      .describe(
        'Token from a previous response to fetch the next page of results. Use as-is.',
      ),
    pagination_token: z
      .string()
      .optional()
      .describe(
        'Pagination token, typically `next_token` in Twitter API v2. Use as-is.',
      ),
    query: z
      .string()
      .describe(
        "Search query for matching Tweets using Twitter's V2 filtering syntax (see official Twitter API documentation for syntax and length).",
      ),
    search__count__fields: z
      .array(z.string())
      .optional()
      .describe(
        'Specifies which fields to return for each search count object; default fields are returned if unspecified.',
      ),
    since_id: z
      .string()
      .optional()
      .describe(
        'Count Tweets more recent than this ID. Cannot be used with `start_time` or `end_time`.',
      ),
    start_time: z
      .string()
      .optional()
      .describe(
        'Oldest UTC timestamp (inclusive, YYYY-MM-DDTHH:mm:ssZ) to count Tweets from. If specified, `end_time` is also required and `start_time` must be earlier.',
      ),
    until_id: z
      .string()
      .optional()
      .describe(
        'Count Tweets older than this ID. Cannot be used with `start_time` or `end_time`.',
      ),
  }),
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_FULL_ARCHIVE_SEARCH_COUNTS',
  execute: async (
    {
      end_time,
      granularity,
      next_token,
      pagination_token,
      query,
      search__count__fields,
      since_id,
      start_time,
      until_id,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      end_time,
      granularity,
      next_token,
      pagination_token,
      query,
      search__count__fields,
      since_id,
      start_time,
      until_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Full archive search counts completed successfully'
        : result.error,
      data: result.data,
    };
  },
});

// User Lookup Me
export const twitterUserLookupMe = createComposioTool({
  name: 'twitterUserLookupMe',
  description:
    'Returns profile information for the currently authenticated x user, customizable via request fields',
  inputSchema: z.object({
    expansions: z
      .array(z.string())
      .optional()
      .describe(
        'A comma-separated list of fields to expand for related entities (e.g., pinned tweet, affiliated user).',
      ),
    tweet__fields: z
      .array(z.string())
      .optional()
      .describe(
        "A comma-separated list of tweet-specific information for expanded tweets (e.g., if 'pinned_tweet_id' is in expansions).",
      ),
    user__fields: z
      .array(z.string())
      .optional()
      .describe(
        'A comma-separated list of user-specific information to include in the response.',
      ),
  }),
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_USER_LOOKUP_ME',
  execute: async (
    { expansions, tweet__fields, user__fields },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      expansions,
      tweet__fields,
      user__fields,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'User profile retrieved successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Twitter
export const authenticateTwitter = createComposioTool({
  name: 'authenticateTwitter',
  description:
    'Initiate authentication with Twitter to enable social media functionality',
  inputSchema: z.object({}),
  integrationName: 'X (Twitter)',
  composioToolName: 'TWITTER_USER_LOOKUP_ME',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'X (Twitter)',
      );

      return {
        success: true,
        message: `🔗 **Twitter Authentication Required**

To use Twitter features, you need to authenticate with your Twitter account first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Twitter account. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'X (Twitter)',
          authToolName: 'authenticateTwitter',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Twitter:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Twitter authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register the tools
registerComposioTool({
  name: 'twitterCreateNewDmConversation',
  tool: twitterCreateNewDmConversation,
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_CREATE_A_NEW_DM_CONVERSATION',
});

registerComposioTool({
  name: 'twitterCreationOfAPost',
  tool: twitterCreationOfAPost,
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_CREATION_OF_A_POST',
});

registerComposioTool({
  name: 'twitterDeleteDm',
  tool: twitterDeleteDm,
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_DELETE_DM',
});

registerComposioTool({
  name: 'twitterFullArchiveSearch',
  tool: twitterFullArchiveSearch,
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_FULL_ARCHIVE_SEARCH',
});

registerComposioTool({
  name: 'twitterFullArchiveSearchCounts',
  tool: twitterFullArchiveSearchCounts,
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_FULL_ARCHIVE_SEARCH_COUNTS',
});

registerComposioTool({
  name: 'twitterUserLookupMe',
  tool: twitterUserLookupMe,
  integrationName: 'Twitter',
  composioToolName: 'TWITTER_USER_LOOKUP_ME',
});

registerComposioTool({
  name: 'authenticateTwitter',
  tool: authenticateTwitter,
  integrationName: 'X (Twitter)',
  composioToolName: 'TWITTER_CREATION_OF_A_POST',
});
