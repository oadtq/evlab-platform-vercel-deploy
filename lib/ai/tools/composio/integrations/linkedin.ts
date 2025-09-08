import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Create LinkedIn Post
export const linkedinCreatePost = createComposioTool({
  name: 'linkedinCreatePost',
  description:
    'Creates a new post on LinkedIn for the authenticated user or an organization they manage; ensure the user has necessary permissions if posting for an organization',
  inputSchema: z.object({
    author: z
      .string()
      .describe(
        "The URN of the LinkedIn member or organization creating the post. Use the GET_USER_INFO action to retrieve the 'author_id' (URN) for the authenticated user. For an organization, the URN will be in the format 'urn:li:organization:{id}'.",
      )
      .optional(),
    commentary: z
      .string()
      .describe(
        'The main text content of the post. This field supports plain text and @-mentions (e.g., @[LinkedIn Member](urn:li:person:xxxx)).',
      ),
    distribution: z
      .object({
        feedDistribution: z
          .enum(['MAIN_FEED', 'NONE'])
          .default('MAIN_FEED')
          .describe(
            "Specifies how the post is distributed on the LinkedIn feed. 'MAIN_FEED' distributes to the main feed, 'NONE' does not distribute automatically.",
          )
          .optional(),
        targetEntities: z
          .array(z.object({}).passthrough())
          .describe(
            "A list of entities to target with this post. Each entity should be a dictionary. This is often used for targeted distribution, e.g., to specific groups or GeoLocations. For GeoLocations, provide a dictionary like: `{'geoLocations': [{'geo': 'urn:li:geo:103644278'}]}`. Refer to LinkedIn documentation for specific URN formats.",
          )
          .optional(),
        thirdPartyDistributionChannels: z
          .array(z.string())
          .describe(
            'A list of third-party channels where the post should be distributed, e.g., Twitter. Refer to LinkedIn documentation for supported channels.',
          )
          .optional(),
      })
      .optional(),
    isReshareDisabledByAuthor: z
      .boolean()
      .default(false)
      .describe('Set to true to prevent others from resharing this post.')
      .optional(),
    lifecycleState: z
      .enum(['PUBLISHED', 'DRAFT', 'PUBLISH_REQUESTED'])
      .default('PUBLISHED')
      .describe(
        "The state of the post. Use 'PUBLISHED' to post directly, 'DRAFT' to save as a draft, or 'PUBLISH_REQUESTED' if the post requires review before publishing.",
      )
      .optional(),
    visibility: z
      .enum(['PUBLIC', 'CONNECTIONS', 'LOGGED_IN', 'CONTAINER'])
      .default('PUBLIC')
      .describe(
        "Controls who can see the post. 'PUBLIC' makes it visible to everyone, 'CONNECTIONS' to connections only, 'LOGGED_IN' to signed-in LinkedIn members, and 'CONTAINER' for specific group/event posts.",
      )
      .optional(),
  }),
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_CREATE_LINKED_IN_POST',
  execute: async (
    {
      author,
      commentary,
      distribution,
      isReshareDisabledByAuthor,
      lifecycleState,
      visibility,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      author,
      commentary,
      distribution,
      isReshareDisabledByAuthor,
      lifecycleState,
      visibility,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'LinkedIn post created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Delete LinkedIn Post
export const linkedinDeletePost = createComposioTool({
  name: 'linkedinDeletePost',
  description:
    'Deletes a specific LinkedIn post (share) by its unique `share id`, which must correspond to an existing share',
  inputSchema: z.object({
    share_id: z
      .string()
      .describe(
        'Unique identifier of the LinkedIn share (post) to be deleted.',
      ),
  }),
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_DELETE_LINKED_IN_POST',
  execute: async ({ share_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      share_id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'LinkedIn post deleted successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Get Company Info
export const linkedinGetCompanyInfo = createComposioTool({
  name: 'linkedinGetCompanyInfo',
  description:
    'Retrieves organizations where the authenticated user has specific roles (acls), to determine their management or content posting capabilities for LinkedIn company pages',
  inputSchema: z.object({
    count: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe('The number of organization ACLs to return per page.')
      .optional(),
    role: z
      .enum(['ADMINISTRATOR', 'DIRECT_SPONSORED_CONTENT_POSTER'])
      .default('ADMINISTRATOR')
      .describe('The specific role to filter organization ACLs by.')
      .optional(),
    start: z
      .number()
      .min(0)
      .default(0)
      .describe(
        'The starting index for pagination, representing the number of initial ACLs to skip.',
      )
      .optional(),
    state: z
      .enum(['APPROVED', 'REQUESTED'])
      .default('APPROVED')
      .describe('The approval state of the role to filter by.')
      .optional(),
  }),
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_GET_COMPANY_INFO',
  execute: async ({ count, role, start, state }, composioTool, userId) => {
    const result = await composioTool.execute({
      count,
      role,
      start,
      state,
    });
    return {
      success: result.successful,
      message: result.successful
        ? `Retrieved company information successfully`
        : result.error,
      data: result.data,
    };
  },
});

// Get My Info
export const linkedinGetMyInfo = createComposioTool({
  name: 'linkedinGetMyInfo',
  description:
    "Fetches the authenticated LinkedIn user's profile, notably including the 'author id' required for attributing content such as posts or articles",
  inputSchema: z.object({}),
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_GET_MY_INFO',
  execute: async (params, composioTool, userId) => {
    const result = await composioTool.execute({});
    return {
      success: result.successful,
      message: result.successful
        ? 'Retrieved user profile information successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for LinkedIn
export const authenticateLinkedIn = createComposioTool({
  name: 'authenticateLinkedIn',
  description:
    'Initiate authentication with LinkedIn to enable posting and profile functionality',
  inputSchema: z.object({}),
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_CREATE_LINKED_IN_POST',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'LinkedIn',
      );

      return {
        success: true,
        message: `🔗 **LinkedIn Authentication Required**

To use LinkedIn features, you need to authenticate with your LinkedIn account first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your LinkedIn account. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'LinkedIn',
          authToolName: 'authenticateLinkedIn',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for LinkedIn:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate LinkedIn authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register the tools
registerComposioTool({
  name: 'linkedinCreatePost',
  tool: linkedinCreatePost,
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_CREATE_LINKED_IN_POST',
});

registerComposioTool({
  name: 'linkedinDeletePost',
  tool: linkedinDeletePost,
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_DELETE_LINKED_IN_POST',
});

registerComposioTool({
  name: 'linkedinGetCompanyInfo',
  tool: linkedinGetCompanyInfo,
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_GET_COMPANY_INFO',
});

registerComposioTool({
  name: 'linkedinGetMyInfo',
  tool: linkedinGetMyInfo,
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_GET_MY_INFO',
});

registerComposioTool({
  name: 'authenticateLinkedIn',
  tool: authenticateLinkedIn,
  integrationName: 'LinkedIn',
  composioToolName: 'LINKEDIN_CREATE_LINKED_IN_POST',
});
