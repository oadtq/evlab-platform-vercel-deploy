import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Create Document
export const googleDocsCreateDocument = createComposioTool({
  name: 'googleDocsCreateDocument',
  description:
    "Creates a new google docs document using the provided title as filename and inserts the initial text at the beginning if non-empty, returning the document's id and metadata (excluding body content).",
  inputSchema: z.object({
    title: z
      .string()
      .describe(
        'Title for the new document, used as its filename in Google Drive.',
      ),
    text: z
      .string()
      .describe(
        'Initial text content to insert at the beginning of the new document.',
      ),
  }),
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_CREATE_DOCUMENT',
  execute: async ({ title, text }, composioTool, userId) => {
    const result = await composioTool.execute({
      title,
      text,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Document created successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Create Document from Markdown
export const googleDocsCreateDocumentMarkdown = createComposioTool({
  name: 'googleDocsCreateDocumentMarkdown',
  description:
    'Creates a new google docs document, optionally initializing it with a title and content provided as markdown text.',
  inputSchema: z.object({
    title: z.string().describe('The title for the new Google Docs document.'),
    markdown_text: z
      .string()
      .describe(
        'The initial content for the document, formatted as Markdown. Supports various Markdown elements including headings, lists (nested lists are not supported), tables, images (via publicly accessible URLs), blockquotes, code blocks, and text formatting (bold, italic, etc.). If an empty string is provided, the document will be created with only the title.',
      ),
  }),
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN',
  execute: async ({ title, markdown_text }, composioTool, userId) => {
    const result = await composioTool.execute({
      title,
      markdown_text,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Document created successfully from markdown'
        : result.error,
      data: result.data,
    };
  },
});

// Get Document by ID
export const googleDocsGetDocumentById = createComposioTool({
  name: 'googleDocsGetDocumentById',
  description:
    'Retrieves an existing google document by its id; will error if the document is not found.',
  inputSchema: z.object({
    id: z
      .string()
      .describe(
        'The unique identifier for the Google Document to be retrieved. This action specifically fetches an existing document and will not create a new one if the ID is not found.',
      ),
  }),
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_GET_DOCUMENT_BY_ID',
  execute: async ({ id }, composioTool, userId) => {
    const result = await composioTool.execute({
      id,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Document retrieved successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Search Documents
export const googleDocsSearchDocuments = createComposioTool({
  name: 'googleDocsSearchDocuments',
  description:
    'Search for google documents using various filters including name, content, date ranges, and more.',
  inputSchema: z.object({
    query: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Search query to filter documents. Can search by name (name contains 'report'), full text content (fullText contains 'important'), or use complex queries with operators like 'and', 'or', 'not'. Leave empty to get all documents.",
      ),
    max_results: z
      .number()
      .min(1)
      .max(1000)
      .optional()
      .default(10)
      .describe(
        'Maximum number of documents to return (1-1000). Defaults to 10.',
      ),
    order_by: z
      .string()
      .optional()
      .default('modifiedTime desc')
      .describe(
        "Order results by field. Common options: 'modifiedTime desc', 'modifiedTime asc', 'name', 'createdTime desc'",
      ),
    created_after: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Return documents created after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'.",
      ),
    modified_after: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Return documents modified after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'.",
      ),
    include_trashed: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to include documents in trash. Defaults to False.'),
    shared_with_me: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Whether to return only documents shared with the current user. Defaults to False.',
      ),
    starred_only: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to return only starred documents. Defaults to False.'),
  }),
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_SEARCH_DOCUMENTS',
  execute: async (
    {
      query,
      max_results,
      order_by,
      created_after,
      modified_after,
      include_trashed,
      shared_with_me,
      starred_only,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      query,
      max_results,
      order_by,
      created_after,
      modified_after,
      include_trashed,
      shared_with_me,
      starred_only,
    });
    return {
      success: result.successful,
      message: result.successful
        ? `Found ${result.data?.length || 0} documents`
        : result.error,
      data: result.data,
    };
  },
});

// Replace Image
export const googleDocsReplaceImage = createComposioTool({
  name: 'googleDocsReplaceImage',
  description:
    'Tool to replace a specific image in a document with a new image from a uri. use when you need to update an existing image within a google doc.',
  inputSchema: z.object({
    document_id: z
      .string()
      .describe('The ID of the document containing the image to replace.'),
    replace_image: z
      .object({
        image_object_id: z
          .string()
          .describe(
            'The ID of the existing image that will be replaced. The ID can be retrieved from the response of a get request.',
          ),
        uri: z
          .string()
          .describe(
            'The URI of the new image. The image is fetched once at insertion time and a copy is stored for display inside the document. Images must be less than 50MB in size, cannot exceed 25 megapixels, and must be in one of PNG, JPEG, or GIF format. The provided URI must be publicly accessible and at most 2 kB in length. The URI itself is saved with the image, and exposed via the ImageProperties.content_uri field.',
          ),
        image_replace_method: z
          .enum(['CENTER_CROP', 'IMAGE_REPLACE_METHOD_UNSPECIFIED'])
          .optional()
          .default('CENTER_CROP')
          .describe(
            'The replacement method. Defaults to CENTER_CROP if not specified.',
          ),
        tab_id: z
          .string()
          .nullable()
          .optional()
          .describe(
            'The tab that the image to be replaced is in. When omitted, the request is applied to the first tab.',
          ),
      })
      .describe('The details of the image replacement request.'),
  }),
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_REPLACE_IMAGE',
  execute: async ({ document_id, replace_image }, composioTool, userId) => {
    const result = await composioTool.execute({
      document_id,
      replace_image,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Image replaced successfully' : result.error,
      data: result.data,
    };
  },
});

// Update Document Markdown
export const googleDocsUpdateDocumentMarkdown = createComposioTool({
  name: 'googleDocsUpdateDocumentMarkdown',
  description:
    'Replaces the entire content of an existing google docs document with new markdown text; requires edit permissions for the document.',
  inputSchema: z.object({
    document_id: z
      .string()
      .describe(
        "Identifier of the Google Docs document to update, found in the document's URL.",
      ),
    new_markdown_text: z
      .string()
      .describe(
        "Markdown content that will replace the document's entire existing content. Supports standard Markdown features.",
      ),
  }),
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_UPDATE_DOCUMENT_MARKDOWN',
  execute: async ({ document_id, new_markdown_text }, composioTool, userId) => {
    const result = await composioTool.execute({
      document_id,
      new_markdown_text,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Document updated successfully with markdown'
        : result.error,
      data: result.data,
    };
  },
});

// Update Existing Document
export const googleDocsUpdateExistingDocument = createComposioTool({
  name: 'googleDocsUpdateExistingDocument',
  description:
    'Applies programmatic edits, such as text insertion, deletion, or formatting, to a specified google doc using the `batchupdate` api method.',
  inputSchema: z.object({
    document_id: z
      .string()
      .describe(
        'The unique identifier of the Google Docs document to be updated.',
      ),
    editDocs: z
      .array(z.record(z.any()))
      .describe(
        'Requests conforming to the Google Docs API `batchUpdate` method, where each item specifies an operation. For full details and more request types, see https://developers.google.com/docs/api/reference/rest/v1/documents/batchUpdate.',
      ),
  }),
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_UPDATE_EXISTING_DOCUMENT',
  execute: async ({ document_id, editDocs }, composioTool, userId) => {
    const result = await composioTool.execute({
      document_id,
      editDocs,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Document updated successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Google Docs
export const authenticateGoogleDocs = createComposioTool({
  name: 'authenticateGoogleDocs',
  description:
    'Initiate authentication with Google Docs to enable document functionality',
  inputSchema: z.object({}),
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_SEARCH_DOCUMENTS',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'Google Docs',
      );

      return {
        success: true,
        message: `🔗 **Google Docs Authentication Required**

To use Google Docs features, you need to authenticate with your Google account first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Google account. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'Google Docs',
          authToolName: 'authenticateGoogleDocs',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Google Docs:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Google Docs authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register the tools
registerComposioTool({
  name: 'googleDocsCreateDocument',
  tool: googleDocsCreateDocument,
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_CREATE_DOCUMENT',
});

registerComposioTool({
  name: 'googleDocsCreateDocumentMarkdown',
  tool: googleDocsCreateDocumentMarkdown,
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN',
});

registerComposioTool({
  name: 'googleDocsGetDocumentById',
  tool: googleDocsGetDocumentById,
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_GET_DOCUMENT_BY_ID',
});

registerComposioTool({
  name: 'googleDocsSearchDocuments',
  tool: googleDocsSearchDocuments,
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_SEARCH_DOCUMENTS',
});

registerComposioTool({
  name: 'googleDocsReplaceImage',
  tool: googleDocsReplaceImage,
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_REPLACE_IMAGE',
});

registerComposioTool({
  name: 'googleDocsUpdateDocumentMarkdown',
  tool: googleDocsUpdateDocumentMarkdown,
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_UPDATE_DOCUMENT_MARKDOWN',
});

registerComposioTool({
  name: 'googleDocsUpdateExistingDocument',
  tool: googleDocsUpdateExistingDocument,
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_UPDATE_EXISTING_DOCUMENT',
});

registerComposioTool({
  name: 'authenticateGoogleDocs',
  tool: authenticateGoogleDocs,
  integrationName: 'Google Docs',
  composioToolName: 'GOOGLEDOCS_CREATE_DOCUMENT',
});
