import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Add Remote File from Service
export const slackAddRemoteFile = createComposioTool({
  name: 'slackAddRemoteFile',
  description:
    'Adds a reference to an external file (e.g., google drive, dropbox) to slack for discovery and sharing, requiring a unique external id and an external url accessible by slack',
  inputSchema: z.object({
    external_id: z
      .string()
      .describe(
        'Unique identifier for the file, defined by the calling application, used for future API references (e.g., updating, deleting).',
      ),
    external_url: z
      .string()
      .describe(
        'Publicly accessible or permissioned URL of the remote file, used by Slack to access its content or metadata.',
      ),
    filetype: z
      .string()
      .optional()
      .describe(
        'File type (e.g., "pdf", "docx", "png") to help Slack display appropriate icons or previews.',
      ),
    indexable_file_contents: z
      .string()
      .optional()
      .describe('Plain text content of the file, indexed by Slack for search.'),
    preview_image: z
      .string()
      .optional()
      .describe(
        "Base64-encoded image (e.g., PNG, JPEG) used as the file's preview in Slack.",
      ),
    title: z
      .string()
      .optional()
      .describe('Title of the remote file to be displayed in Slack.'),
    token: z
      .string()
      .optional()
      .describe(
        'Slack authentication token, required to authorize adding the remote file.',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_ADD_A_REMOTE_FILE_FROM_A_SERVICE',
  execute: async (
    {
      external_id,
      external_url,
      filetype,
      indexable_file_contents,
      preview_image,
      title,
      token,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      external_id,
      external_url,
      filetype,
      indexable_file_contents,
      preview_image,
      title,
      token,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Remote file added to Slack successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Create User Group
export const slackCreateUserGroup = createComposioTool({
  name: 'slackCreateUserGroup',
  description:
    'Creates a new user group (often referred to as a subteam) in a slack workspace',
  inputSchema: z.object({
    channels: z
      .string()
      .optional()
      .describe(
        'Comma-separated encoded channel IDs for default channels, suggested when mentioning or inviting the group.',
      ),
    description: z
      .string()
      .optional()
      .describe('Short description for the User Group.'),
    handle: z
      .string()
      .optional()
      .describe(
        'Unique mention handle. Must be unique across channels, users, and other User Groups. Max 21 chars; lowercase letters, numbers, hyphens, underscores only.',
      ),
    include_count: z
      .boolean()
      .optional()
      .describe(
        "Include the User Group's user count in the response. Server defaults to false if omitted.",
      ),
    name: z
      .string()
      .describe(
        'Unique name for the User Group. Must be unique among all User Groups in the workspace.',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_CREATE_A_SLACK_USER_GROUP',
  execute: async (
    { channels, description, handle, include_count, name },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      channels,
      description,
      handle,
      include_count,
      name,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'User group created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Create Channel
export const slackCreateChannel = createComposioTool({
  name: 'slackCreateChannel',
  description: 'Initiates a public or private channel-based conversation',
  inputSchema: z.object({
    is_private: z
      .boolean()
      .optional()
      .describe('Create a private channel instead of a public one'),
    name: z
      .string()
      .describe('Name of the public or private channel to create'),
    team_id: z
      .string()
      .optional()
      .describe(
        'encoded team id to create the channel in, required if org token is used',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_CREATE_CHANNEL',
  execute: async ({ is_private, name, team_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      is_private,
      name,
      team_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Channel created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Create Channel Based Conversation
export const slackCreateChannelConversation = createComposioTool({
  name: 'slackCreateChannelConversation',
  description:
    'Creates a new public or private slack channel with a unique name; the channel can be org-wide, or team-specific if team id is given (required if org wide is false or not provided)',
  inputSchema: z.object({
    description: z
      .string()
      .optional()
      .describe(
        'Optional description for the channel (e.g., "Discussion about Q4 marketing strategies").',
      ),
    is_private: z
      .boolean()
      .optional()
      .describe(
        'Set to true to make the channel private, or false for public.',
      ),
    name: z
      .string()
      .describe(
        'Name for the new channel. Must be unique, 80 characters or fewer, lowercase, without spaces or periods, and may contain letters, numbers, and hyphens.',
      ),
    org_wide: z
      .boolean()
      .optional()
      .describe(
        'Set to true to make the channel available org-wide. If false or not set, team_id is required.',
      ),
    team_id: z
      .string()
      .optional()
      .describe(
        'Workspace (team) ID for channel creation (e.g., T123ABCDEFG). Required if org_wide is false or not set.',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_CREATE_CHANNEL_BASED_CONVERSATION',
  execute: async (
    { description, is_private, name, org_wide, team_id },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      description,
      is_private,
      name,
      org_wide,
      team_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Channel conversation created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Delete Scheduled Message
export const slackDeleteScheduledMessage = createComposioTool({
  name: 'slackDeleteScheduledMessage',
  description:
    'Deletes a pending, unsent scheduled message from the specified slack channel, identified by its scheduled message id.',
  inputSchema: z.object({
    as_user: z
      .boolean()
      .optional()
      .describe(
        'Pass true to delete the message as the authenticated user (bots are considered authed users here, uses chat:write:user scope); if false or omitted, deletes as a bot (uses chat:write:bot scope).',
      ),
    channel: z
      .string()
      .describe(
        'ID of the channel, private group, or DM conversation where the message is scheduled.',
      ),
    scheduled_message_id: z
      .string()
      .describe(
        'Unique ID (scheduled_message_id) of the message to be deleted; obtained from chat.scheduleMessage response.',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_DELETE_A_SCHEDULED_MESSAGE_IN_A_CHAT',
  execute: async (
    { as_user, channel, scheduled_message_id },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      as_user,
      channel,
      scheduled_message_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Scheduled message deleted successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Delete Message
export const slackDeleteMessage = createComposioTool({
  name: 'slackDeleteMessage',
  description:
    'Deletes a message, identified by its channel id and timestamp, from a slack channel, private group, or direct message conversation; the authenticated user or bot must be the original poster',
  inputSchema: z.object({
    as_user: z
      .boolean()
      .optional()
      .describe(
        'If True, deletes the message as the authenticated user using the chat:write:user scope. Bot users are considered authenticated users. If False or omitted, the message is deleted using the chat:write:bot scope.',
      ),
    channel: z
      .string()
      .describe(
        'The ID of the channel, private group, or direct message conversation containing the message to be deleted.',
      ),
    ts: z
      .string()
      .describe(
        'Timestamp of the message to be deleted. Must be the exact Slack message timestamp string with fractional precision, e.g., "1234567890.123456".',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_DELETES_A_MESSAGE_FROM_A_CHAT',
  execute: async ({ as_user, channel, ts }, composioTool, userId) => {
    const result = await composioTool.execute({
      as_user,
      channel,
      ts,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Message deleted successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Fetch Conversation History
export const slackFetchConversationHistory = createComposioTool({
  name: 'slackFetchConversationHistory',
  description:
    'Fetches a chronological list of messages and events from a specified slack conversation, accessible by the authenticated user/bot, with options for pagination and time range filtering',
  inputSchema: z.object({
    channel: z
      .string()
      .describe(
        'The ID of the public channel, private channel, direct message, or multi-person direct message to fetch history from.',
      ),
    cursor: z
      .string()
      .optional()
      .describe(
        "Pagination cursor from next_cursor of a previous response to fetch subsequent pages. See Slack's pagination documentation for details.",
      ),
    inclusive: z
      .boolean()
      .optional()
      .describe(
        'Include messages with latest or oldest timestamps in the results; applies only when latest or oldest is specified.',
      ),
    latest: z
      .string()
      .optional()
      .describe(
        'End of the time range of messages to include in results. Accepts a Unix timestamp or a Slack timestamp (e.g., "1234567890.000000").',
      ),
    limit: z
      .number()
      .optional()
      .describe(
        'Maximum number of messages to return per page (1-1000). Fewer may be returned if at the end of history or channel has fewer messages.',
      ),
    oldest: z
      .string()
      .optional()
      .describe(
        'Start of the time range of messages to include in results. Accepts a Unix timestamp or a Slack timestamp (e.g., "1234567890.000000").',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_FETCH_CONVERSATION_HISTORY',
  execute: async (
    { channel, cursor, inclusive, latest, limit, oldest },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      channel,
      cursor,
      inclusive,
      latest,
      limit,
      oldest,
    });
    return {
      success: result.successful,
      message: result.successful
        ? `Fetched conversation history successfully`
        : result.error,
      data: result.data,
    };
  },
});

// Find Channels
export const slackFindChannels = createComposioTool({
  name: 'slackFindChannels',
  description:
    'Find channels in a slack workspace by any criteria - name, topic, purpose, or description',
  inputSchema: z.object({
    exact_match: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Use exact matching instead of partial matching. Defaults to false.',
      ),
    exclude_archived: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'Exclude archived channels from search results. Defaults to true.',
      ),
    limit: z
      .number()
      .optional()
      .default(50)
      .describe(
        'Maximum number of channels to return (1 to 200). Defaults to 50.',
      ),
    member_only: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Only return channels the user is a member of. Defaults to false.',
      ),
    search_query: z
      .string()
      .describe(
        'Search query to find channels. Searches across channel name, topic, purpose, and description (case-insensitive partial matching).',
      ),
    types: z
      .string()
      .optional()
      .default('public_channel,private_channel')
      .describe(
        'Comma-separated list of channel types to include: public_channel, private_channel, mpim (multi-person direct message), im (direct message). Defaults to public and private channels.',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_FIND_CHANNELS',
  execute: async (
    { exact_match, exclude_archived, limit, member_only, search_query, types },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      exact_match,
      exclude_archived,
      limit,
      member_only,
      search_query,
      types,
    });
    return {
      success: result.successful,
      message: result.successful
        ? `Found ${result.data?.channels?.length || 0} channels`
        : result.error,
      data: result.data,
    };
  },
});

// List All Channels
export const slackListAllChannels = createComposioTool({
  name: 'slackListAllChannels',
  description:
    'Lists conversations available to the user with various filters and search options.',
  inputSchema: z.object({
    channel_name: z
      .string()
      .optional()
      .describe(
        'Filter channels by name (case-insensitive substring match). This is a client-side filter applied after fetching from the API.',
      ),
    cursor: z
      .string()
      .optional()
      .describe(
        "Pagination cursor (from a previous response's next_cursor) for the next page of results. Omit for the first page.",
      ),
    exclude_archived: z
      .boolean()
      .optional()
      .describe(
        'Excludes archived channels if true. The API defaults to false (archived channels are included).',
      ),
    limit: z
      .number()
      .optional()
      .default(1)
      .describe(
        'Maximum number of channels to return per page (1 to 1000). Fewer channels may be returned than requested. This schema defaults to 1 if omitted.',
      ),
    types: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of channel types to include: public_channel, private_channel, mpim (multi-person direct message), im (direct message). The API defaults to public_channel if this parameter is omitted.',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_LIST_ALL_CHANNELS',
  execute: async (
    { channel_name, cursor, exclude_archived, limit, types },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      channel_name,
      cursor,
      exclude_archived,
      limit,
      types,
    });
    return {
      success: result.successful,
      message: result.successful
        ? `Listed ${result.data?.channels?.length || 0} channels`
        : result.error,
      data: result.data,
    };
  },
});

// List Conversations
export const slackListConversations = createComposioTool({
  name: 'slackListConversations',
  description:
    'Retrieves conversations accessible to a specified user (or the authenticated user if no user id is provided), respecting shared membership for non-public channels',
  inputSchema: z.object({
    cursor: z
      .string()
      .optional()
      .describe(
        "Pagination cursor for retrieving the next set of results. Obtain this from the next_cursor field in a previous response's response_metadata. If omitted, the first page is fetched.",
      ),
    exclude_archived: z
      .boolean()
      .optional()
      .describe(
        "Set to true to exclude archived channels from the list. If false or omitted, archived channels are typically included (the API's default behavior for omission will apply, usually including them).",
      ),
    limit: z
      .number()
      .optional()
      .describe(
        "The maximum number of items to return per page. Must be an integer, typically between 1 and 1000 (e.g., 100). If omitted, the API's default limit (often 100) applies. Fewer items than the limit may be returned.",
      ),
    types: z
      .string()
      .optional()
      .describe(
        'A comma-separated list of conversation types to include. Valid types are public_channel, private_channel, mpim (multi-person direct message), and im (direct message). If omitted, all types are included.',
      ),
    user: z
      .string()
      .optional()
      .describe(
        'The ID of the user whose conversations will be listed. If not provided, conversations for the authenticated user are returned. Non-public channels are restricted to those where the calling user (authenticating user) shares membership.',
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_LIST_CONVERSATIONS',
  execute: async (
    { cursor, exclude_archived, limit, types, user },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      cursor,
      exclude_archived,
      limit,
      types,
      user,
    });
    return {
      success: result.successful,
      message: result.successful
        ? `Listed ${result.data?.channels?.length || 0} conversations`
        : result.error,
      data: result.data,
    };
  },
});

// Send Message (Chat Post Message)
export const slackSendMessage = createComposioTool({
  name: 'slackSendMessage',
  description:
    'Posts a message to a slack channel, direct message, or private channel',
  inputSchema: z.object({
    as_user: z
      .boolean()
      .optional()
      .describe(
        'Post as the authenticated user instead of as a bot. Defaults to false. If true, username, icon_emoji, and icon_url are ignored. If false, the message is posted as a bot, allowing appearance customization.',
      ),
    attachments: z
      .string()
      .optional()
      .describe(
        'URL-encoded JSON array of message attachments, a legacy method for rich content. See Slack API documentation for structure.',
      ),
    blocks: z
      .string()
      .optional()
      .describe(
        'DEPRECATED: Use markdown_text field instead. URL-encoded JSON array of layout blocks for rich/interactive messages. See Slack API Block Kit docs for structure.',
      ),
    channel: z
      .string()
      .describe(
        'ID or name of the channel, private group, or IM channel to send the message to.',
      ),
    icon_emoji: z
      .string()
      .optional()
      .describe(
        'Emoji for bot\'s icon (e.g., ":robot_face:"). Overrides icon_url. Applies if as_user is false.',
      ),
    icon_url: z
      .string()
      .optional()
      .describe(
        "Image URL for bot's icon (must be HTTPS). Applies if as_user is false.",
      ),
    link_names: z
      .boolean()
      .optional()
      .describe(
        'Automatically hyperlink channel names (e.g., #channel) and usernames (e.g., @user) in message text. Defaults to false for bot messages.',
      ),
    markdown_text: z
      .string()
      .optional()
      .describe(
        'PREFERRED: Write your message in markdown for nicely formatted display. Supports: headers (# ## ###), bold (**text** or __text__), italic (*text* or _text_), strikethrough (~~text~~), inline code (`code`), code blocks (```), links ([text](url)), block quotes (>), lists (- item, 1. item), dividers (--- or ***), context blocks (:::context with images), and section buttons (:::section-button). IMPORTANT: Use \\n for line breaks (e.g., "Line 1\\nLine 2"), not actual newlines. USER MENTIONS: To tag users, use their user ID with <@USER_ID> format (e.g., <@U1234567890>), not username.',
      ),
    mrkdwn: z
      .boolean()
      .optional()
      .describe(
        "Disable Slack's markdown for text field if false. Default true (allows *bold*, _italic_, etc.).",
      ),
    parse: z
      .string()
      .optional()
      .describe(
        'Message text parsing behavior. Default "none" (no special parsing). "full" parses as user-typed (links @mentions, #channels). See Slack API docs for details.',
      ),
    reply_broadcast: z
      .boolean()
      .optional()
      .describe(
        'If true for a threaded reply, also posts to main channel. Defaults to false.',
      ),
    text: z
      .string()
      .optional()
      .describe(
        'DEPRECATED: This sends raw text only, use markdown_text field. Primary textual content. Recommended fallback if using blocks or attachments. Supports mrkdwn unless mrkdwn is false.',
      ),
    thread_ts: z
      .string()
      .optional()
      .describe(
        'Timestamp (ts) of an existing message to make this a threaded reply. Use ts of the parent message, not another reply. Example: "1476746824.000004".',
      ),
    unfurl_links: z
      .boolean()
      .optional()
      .describe(
        'Enable unfurling of text-based URLs. Defaults false for bots, true if as_user is true.',
      ),
    unfurl_media: z
      .boolean()
      .optional()
      .describe(
        'Disable unfurling of media content from URLs if false. Defaults to true.',
      ),
    username: z
      .string()
      .optional()
      .describe(
        "Bot's name in Slack (max 80 chars). Applies if as_user is false.",
      ),
  }),
  integrationName: 'Slack',
  composioToolName: 'SLACK_CHAT_POST_MESSAGE',
  execute: async (
    {
      as_user,
      attachments,
      blocks,
      channel,
      icon_emoji,
      icon_url,
      link_names,
      markdown_text,
      mrkdwn,
      parse,
      reply_broadcast,
      text,
      thread_ts,
      unfurl_links,
      unfurl_media,
      username,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      as_user,
      attachments,
      blocks,
      channel,
      icon_emoji,
      icon_url,
      link_names,
      markdown_text,
      mrkdwn,
      parse,
      reply_broadcast,
      text,
      thread_ts,
      unfurl_links,
      unfurl_media,
      username,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Message sent successfully' : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Slack
export const authenticateSlack = createComposioTool({
  name: 'authenticateSlack',
  description:
    'Initiate authentication with Slack to enable messaging and channel functionality',
  inputSchema: z.object({}),
  integrationName: 'Slack',
  composioToolName: 'SLACK_CHAT_POST_MESSAGE',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'Slack',
      );

      return {
        success: true,
        message: `🔗 **Slack Authentication Required**

To use Slack features, you need to authenticate with your Slack workspace first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Slack workspace. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'Slack',
          authToolName: 'authenticateSlack',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Slack:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Slack authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register the tools
registerComposioTool({
  name: 'slackAddRemoteFile',
  tool: slackAddRemoteFile,
  integrationName: 'Slack',
  composioToolName: 'SLACK_ADD_A_REMOTE_FILE_FROM_A_SERVICE',
});

registerComposioTool({
  name: 'slackCreateUserGroup',
  tool: slackCreateUserGroup,
  integrationName: 'Slack',
  composioToolName: 'SLACK_CREATE_A_SLACK_USER_GROUP',
});

registerComposioTool({
  name: 'slackCreateChannel',
  tool: slackCreateChannel,
  integrationName: 'Slack',
  composioToolName: 'SLACK_CREATE_CHANNEL',
});

registerComposioTool({
  name: 'slackCreateChannelConversation',
  tool: slackCreateChannelConversation,
  integrationName: 'Slack',
  composioToolName: 'SLACK_CREATE_CHANNEL_BASED_CONVERSATION',
});

registerComposioTool({
  name: 'slackDeleteScheduledMessage',
  tool: slackDeleteScheduledMessage,
  integrationName: 'Slack',
  composioToolName: 'SLACK_DELETE_A_SCHEDULED_MESSAGE_IN_A_CHAT',
});

registerComposioTool({
  name: 'slackDeleteMessage',
  tool: slackDeleteMessage,
  integrationName: 'Slack',
  composioToolName: 'SLACK_DELETES_A_MESSAGE_FROM_A_CHAT',
});

registerComposioTool({
  name: 'slackFetchConversationHistory',
  tool: slackFetchConversationHistory,
  integrationName: 'Slack',
  composioToolName: 'SLACK_FETCH_CONVERSATION_HISTORY',
});

registerComposioTool({
  name: 'slackFindChannels',
  tool: slackFindChannels,
  integrationName: 'Slack',
  composioToolName: 'SLACK_FIND_CHANNELS',
});

registerComposioTool({
  name: 'slackListAllChannels',
  tool: slackListAllChannels,
  integrationName: 'Slack',
  composioToolName: 'SLACK_LIST_ALL_CHANNELS',
});

registerComposioTool({
  name: 'slackListConversations',
  tool: slackListConversations,
  integrationName: 'Slack',
  composioToolName: 'SLACK_LIST_CONVERSATIONS',
});

registerComposioTool({
  name: 'slackSendMessage',
  tool: slackSendMessage,
  integrationName: 'Slack',
  composioToolName: 'SLACK_CHAT_POST_MESSAGE',
});

registerComposioTool({
  name: 'authenticateSlack',
  tool: authenticateSlack,
  integrationName: 'Slack',
  composioToolName: 'SLACK_CHAT_POST_MESSAGE',
});
