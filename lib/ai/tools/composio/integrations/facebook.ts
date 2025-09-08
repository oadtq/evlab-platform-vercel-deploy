import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Create Facebook Post
export const facebookCreatePost = createComposioTool({
  name: 'facebookCreatePost',
  description: 'Creates a new post on a Facebook page',
  inputSchema: z.object({
    link: z
      .string()
      .nullable()
      .optional()
      .describe('URL to include in the post'),
    message: z.string().describe('The text content of the post'),
    page_id: z.string().describe('The ID of the Facebook Page to post to'),
    published: z
      .boolean()
      .default(true)
      .describe(
        'Set to true to publish immediately, false to save as draft or schedule',
      )
      .optional(),
    scheduled_publish_time: z
      .number()
      .nullable()
      .optional()
      .describe(
        'Unix timestamp for scheduled posts (required if published=false)',
      ),
    targeting: z
      .object({})
      .passthrough()
      .nullable()
      .optional()
      .describe('Audience targeting specifications'),
  }),
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_CREATE_POST',
  execute: async (
    { link, message, page_id, published, scheduled_publish_time, targeting },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      link,
      message,
      page_id,
      published,
      scheduled_publish_time,
      targeting,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Facebook post created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Create Facebook Photo Post
export const facebookCreatePhotoPost = createComposioTool({
  name: 'facebookCreatePhotoPost',
  description: 'Creates a photo post on a Facebook page',
  inputSchema: z.object({
    backdated_time: z
      .number()
      .nullable()
      .optional()
      .describe('Unix timestamp to backdate the post'),
    backdated_time_granularity: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Granularity of backdated time: year, month, day, hour, or min',
      ),
    message: z
      .string()
      .nullable()
      .optional()
      .describe('Caption text for the photo'),
    page_id: z.string().describe('The ID of the Facebook Page to post to'),
    photo: z
      .object({
        mimetype: z.string(),
        name: z.string(),
        s3key: z.string(),
      })
      .nullable()
      .optional()
      .describe("Local photo file to upload (alternative to 'url')"),
    published: z
      .boolean()
      .default(true)
      .describe(
        'Set to true to publish immediately, false to save as unpublished',
      )
      .optional(),
    scheduled_publish_time: z
      .number()
      .nullable()
      .optional()
      .describe(
        'Unix timestamp for scheduled posts (required if published=false)',
      ),
    url: z
      .string()
      .nullable()
      .optional()
      .describe("URL of the photo to upload (alternative to 'photo')"),
  }),
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_CREATE_PHOTO_POST',
  execute: async (
    {
      backdated_time,
      backdated_time_granularity,
      message,
      page_id,
      photo,
      published,
      scheduled_publish_time,
      url,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      backdated_time,
      backdated_time_granularity,
      message,
      page_id,
      photo,
      published,
      scheduled_publish_time,
      url,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Facebook photo post created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Create Facebook Video Post
export const facebookCreateVideoPost = createComposioTool({
  name: 'facebookCreateVideoPost',
  description: 'Creates a video post on a Facebook page',
  inputSchema: z.object({
    description: z
      .string()
      .nullable()
      .optional()
      .describe('Description of the video'),
    file_url: z
      .string()
      .nullable()
      .optional()
      .describe("URL of the video file to upload (alternative to 'video')"),
    page_id: z.string().describe('The ID of the Facebook Page'),
    published: z
      .boolean()
      .default(true)
      .describe('Whether to publish immediately')
      .optional(),
    scheduled_publish_time: z
      .number()
      .nullable()
      .optional()
      .describe('Unix timestamp to schedule the video post'),
    targeting: z
      .object({})
      .passthrough()
      .nullable()
      .optional()
      .describe('Audience targeting specifications'),
    title: z.string().nullable().optional().describe('Title of the video'),
    video: z
      .object({
        mimetype: z.string(),
        name: z.string(),
        s3key: z.string(),
      })
      .nullable()
      .optional()
      .describe("Local video file to upload (alternative to 'file_url')"),
  }),
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_CREATE_VIDEO_POST',
  execute: async (
    {
      description,
      file_url,
      page_id,
      published,
      scheduled_publish_time,
      targeting,
      title,
      video,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      description,
      file_url,
      page_id,
      published,
      scheduled_publish_time,
      targeting,
      title,
      video,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Facebook video post created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Update Facebook Post
export const facebookUpdatePost = createComposioTool({
  name: 'facebookUpdatePost',
  description: 'Updates an existing Facebook page post',
  inputSchema: z.object({
    message: z
      .string()
      .nullable()
      .optional()
      .describe('Updated text content of the post'),
    og_action_type_id: z
      .string()
      .nullable()
      .optional()
      .describe('Open Graph action type ID'),
    og_icon_id: z.string().nullable().optional().describe('Open Graph icon ID'),
    og_object_id: z
      .string()
      .nullable()
      .optional()
      .describe('Open Graph object ID'),
    og_phrase: z.string().nullable().optional().describe('Open Graph phrase'),
    og_suggestion_mechanism: z
      .string()
      .nullable()
      .optional()
      .describe('Open Graph suggestion mechanism'),
    post_id: z.string().describe('The ID of the post to update'),
  }),
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_UPDATE_POST',
  execute: async (
    {
      message,
      og_action_type_id,
      og_icon_id,
      og_object_id,
      og_phrase,
      og_suggestion_mechanism,
      post_id,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      message,
      og_action_type_id,
      og_icon_id,
      og_object_id,
      og_phrase,
      og_suggestion_mechanism,
      post_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Facebook post updated successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Delete Facebook Post
export const facebookDeletePost = createComposioTool({
  name: 'facebookDeletePost',
  description: 'Deletes a Facebook page post',
  inputSchema: z.object({
    post_id: z.string().describe('The ID of the post to delete'),
  }),
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_DELETE_POST',
  execute: async ({ post_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      post_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Facebook post deleted successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Get Facebook Page Details
export const facebookGetPageDetails = createComposioTool({
  name: 'facebookGetPageDetails',
  description: 'Fetches details about a specific Facebook page',
  inputSchema: z.object({
    fields: z
      .string()
      .default(
        'id,name,about,category,description,fan_count,followers_count,website',
      )
      .describe('Comma-separated list of fields to return')
      .optional(),
    page_id: z
      .string()
      .describe('The ID of the Facebook Page to get details for'),
  }),
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_GET_PAGE_DETAILS',
  execute: async ({ fields, page_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      fields,
      page_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Facebook page details retrieved successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Facebook
export const authenticateFacebook = createComposioTool({
  name: 'authenticateFacebook',
  description:
    'Initiate authentication with Facebook to enable posting and page management functionality',
  inputSchema: z.object({}),
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_CREATE_POST',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'Facebook',
      );

      return {
        success: true,
        message: `🔗 **Facebook Authentication Required**

To use Facebook features, you need to authenticate with your Facebook account first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Facebook account. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'Facebook',
          authToolName: 'authenticateFacebook',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Facebook:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Facebook authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register the tools
registerComposioTool({
  name: 'facebookCreatePost',
  tool: facebookCreatePost,
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_CREATE_POST',
});

registerComposioTool({
  name: 'facebookCreatePhotoPost',
  tool: facebookCreatePhotoPost,
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_CREATE_PHOTO_POST',
});

registerComposioTool({
  name: 'facebookCreateVideoPost',
  tool: facebookCreateVideoPost,
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_CREATE_VIDEO_POST',
});

registerComposioTool({
  name: 'facebookUpdatePost',
  tool: facebookUpdatePost,
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_UPDATE_POST',
});

registerComposioTool({
  name: 'facebookDeletePost',
  tool: facebookDeletePost,
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_DELETE_POST',
});

registerComposioTool({
  name: 'facebookGetPageDetails',
  tool: facebookGetPageDetails,
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_GET_PAGE_DETAILS',
});

registerComposioTool({
  name: 'authenticateFacebook',
  tool: authenticateFacebook,
  integrationName: 'Facebook',
  composioToolName: 'FACEBOOK_CREATE_POST',
});
