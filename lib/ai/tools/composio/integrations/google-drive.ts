import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Add File Sharing Preference
export const googleDriveAddFileSharingPreference = createComposioTool({
  name: 'googleDriveAddFileSharingPreference',
  description:
    "Modifies sharing permissions for an existing Google Drive file, granting a specified role to a user, group, domain, or 'anyone'",
  inputSchema: z.object({
    domain: z
      .string()
      .optional()
      .describe(
        "Domain to grant permission to (e.g., 'example.com'). Required if 'type' is 'domain'.",
      ),
    email_address: z
      .string()
      .optional()
      .describe(
        "Email address of the user or group. Required if 'type' is 'user' or 'group'.",
      ),
    file_id: z
      .string()
      .describe(
        'Unique identifier of the file to update sharing settings for.',
      ),
    role: z
      .string()
      .regex(/^(owner|organizer|fileOrganizer|writer|commenter|reader)$/)
      .describe('Permission role to grant.'),
    type: z
      .string()
      .regex(/^(user|group|domain|anyone)$/)
      .describe('Type of grantee for the permission.'),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE',
  execute: async (
    { domain, email_address, file_id, role, type },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      domain,
      email_address,
      file_id,
      role,
      type,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'File sharing preference added successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Create File
export const googleDriveCreateFile = createComposioTool({
  name: 'googleDriveCreateFile',
  description:
    'Creates a new file or folder with metadata. Use to create empty files or folders, or files with content by providing it in the request body (though this action primarily focuses on metadata creation)',
  inputSchema: z.object({
    description: z
      .string()
      .optional()
      .describe('A short description of the file.'),
    fields: z
      .string()
      .optional()
      .describe('A comma-separated list of fields to include in the response.'),
    mimeType: z.string().optional().describe('The MIME type of the file.'),
    name: z.string().optional().describe('The name of the file.'),
    parents: z
      .array(z.string())
      .optional()
      .describe('The IDs of parent folders.'),
    starred: z
      .boolean()
      .optional()
      .describe('Whether the user has starred the file.'),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_CREATE_FILE',
  execute: async (
    { description, fields, mimeType, name, parents, starred },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      description,
      fields,
      mimeType,
      name,
      parents,
      starred,
    });
    return {
      success: result.successful,
      message: result.successful ? 'File created successfully' : result.error,
      data: result.data,
    };
  },
});

// Create File From Text
export const googleDriveCreateFileFromText = createComposioTool({
  name: 'googleDriveCreateFileFromText',
  description:
    'Creates a new file in Google Drive from provided text content (up to 10MB), supporting various formats including automatic conversion to Google Workspace types',
  inputSchema: z.object({
    file_name: z
      .string()
      .describe('Desired name for the new file on Google Drive.'),
    mime_type: z
      .string()
      .default('text/plain')
      .describe(
        'MIME type for the new file, determining how Google Drive interprets its content.',
      ),
    parent_id: z
      .string()
      .nullable()
      .optional()
      .describe(
        "ID of the parent folder in Google Drive; if omitted, the file is created in the root of 'My Drive'.",
      ),
    text_content: z
      .string()
      .describe('Plain text content to be written into the new file.'),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_CREATE_FILE_FROM_TEXT',
  execute: async (
    { file_name, mime_type, parent_id, text_content },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      file_name,
      mime_type,
      parent_id,
      text_content,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'File created from text successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Create Folder
export const googleDriveCreateFolder = createComposioTool({
  name: 'googleDriveCreateFolder',
  description:
    'Creates a new folder in Google Drive, optionally within a parent folder specified by its ID or name; if a parent name is provided but not found, the action will fail',
  inputSchema: z.object({
    folder_name: z.string().describe('Name for the new folder.'),
    parent_id: z
      .string()
      .nullable()
      .optional()
      .describe(
        'ID or name of the parent folder. If a name is provided, the action attempts to find it. If an ID is provided, it must be a valid Google Drive folder ID. If omitted, the folder is created in the Drive root.',
      ),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_CREATE_FOLDER',
  execute: async ({ folder_name, parent_id }, composioTool, userId) => {
    const result = await composioTool.execute({
      folder_name,
      parent_id,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Folder created successfully' : result.error,
      data: result.data,
    };
  },
});

// Edit File
export const googleDriveEditFile = createComposioTool({
  name: 'googleDriveEditFile',
  description:
    'Updates an existing Google Drive file by overwriting its entire content with new text (max 10MB)',
  inputSchema: z.object({
    content: z
      .string()
      .describe(
        'New textual content to overwrite the existing file; will be UTF-8 encoded for upload.',
      ),
    file_id: z
      .string()
      .describe('Identifier of the Google Drive file to update.'),
    mime_type: z
      .string()
      .default('text/plain')
      .describe(
        "MIME type of the 'content' being uploaded; must accurately represent its format.",
      ),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_EDIT_FILE',
  execute: async ({ content, file_id, mime_type }, composioTool, userId) => {
    const result = await composioTool.execute({
      content,
      file_id,
      mime_type,
    });
    return {
      success: result.successful,
      message: result.successful ? 'File edited successfully' : result.error,
      data: result.data,
    };
  },
});

// Find File
export const googleDriveFindFile = createComposioTool({
  name: 'googleDriveFindFile',
  description:
    'Tool to list or search for files and folders in Google Drive. Use when you need to find specific files based on query criteria or list contents of a drive/folder',
  inputSchema: z.object({
    corpora: z
      .string()
      .optional()
      .describe(
        "Corpora to query. 'user' for user's personal files, 'drive' for files in a specific shared drive (requires 'driveId'), 'domain' for files shared with the domain, 'allDrives' for all drives the user has access to.",
      ),
    driveId: z
      .string()
      .optional()
      .describe(
        "ID of the shared drive to search. Required if 'corpora' is 'drive'.",
      ),
    fields: z
      .string()
      .default('*')
      .optional()
      .describe(
        "Selector specifying which fields to include in a partial response. Use '*' for all fields or a comma-separated list, e.g., 'nextPageToken,files(id,name,mimeType)'.",
      ),
    includeItemsFromAllDrives: z
      .boolean()
      .default(false)
      .optional()
      .describe(
        "Whether both My Drive and shared drive items should be included in results. If true, 'supportsAllDrives' should also be true.",
      ),
    orderBy: z
      .string()
      .optional()
      .describe(
        "A comma-separated list of sort keys. Valid keys are 'createdTime', 'folder', 'modifiedByMeTime', 'modifiedTime', 'name', 'name_natural', 'quotaBytesUsed', 'recency', 'sharedWithMeTime', 'starred', 'viewedByMeTime'. Each key sorts ascending by default, but may be reversed with the 'desc' modifier. Example: 'modifiedTime desc,name'.",
      ),
    pageSize: z
      .number()
      .min(1)
      .max(1000)
      .default(100)
      .optional()
      .describe('The maximum number of files to return per page.'),
    pageToken: z
      .string()
      .optional()
      .describe(
        'The token for continuing a previous list request on the next page.',
      ),
    q: z
      .string()
      .optional()
      .describe(
        "A query for filtering the file results. See Google Drive API documentation for query syntax. Example: \"name contains 'report' and mimeType = 'application/pdf'\"",
      ),
    spaces: z
      .string()
      .default('drive')
      .optional()
      .describe(
        "A comma-separated list of spaces to query. Supported values are 'drive', 'appDataFolder' and 'photos'.",
      ),
    supportsAllDrives: z
      .boolean()
      .default(true)
      .optional()
      .describe(
        "Whether the requesting application supports both My Drives and shared drives. If 'includeItemsFromAllDrives' is true, this must also be true.",
      ),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_FIND_FILE',
  execute: async (
    {
      corpora,
      driveId,
      fields,
      includeItemsFromAllDrives,
      orderBy,
      pageSize,
      pageToken,
      q,
      spaces,
      supportsAllDrives,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      corpora,
      driveId,
      fields,
      includeItemsFromAllDrives,
      orderBy,
      pageSize,
      pageToken,
      q,
      spaces,
      supportsAllDrives,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Files found successfully' : result.error,
      data: result.data,
    };
  },
});

// Find Folder
export const googleDriveFindFolder = createComposioTool({
  name: 'googleDriveFindFolder',
  description:
    'Tool to find a folder in Google Drive by its name and optionally a parent folder. Use when you need to locate a specific folder to perform further actions like creating files in it or listing its contents',
  inputSchema: z.object({
    full_text_contains: z
      .string()
      .optional()
      .describe(
        'A string to search for within the full text content of files within folders (if applicable and supported by Drive for the folder type or its contents). This search is case-insensitive.',
      ),
    full_text_not_contains: z
      .string()
      .optional()
      .describe(
        'A string to exclude from the full text content of files within folders. This search is case-insensitive.',
      ),
    modified_after: z
      .string()
      .optional()
      .describe(
        "Search for folders modified after a specific date and time. The timestamp must be in RFC 3339 format (e.g., '2023-01-15T10:00:00Z' or '2023-01-15T10:00:00.000Z').",
      ),
    name_contains: z
      .string()
      .optional()
      .describe(
        'A substring to search for within folder names. This search is case-insensitive.',
      ),
    name_exact: z
      .string()
      .optional()
      .describe(
        'The exact name of the folder to search for. This search is case-sensitive.',
      ),
    name_not_contains: z
      .string()
      .optional()
      .describe(
        'A substring to exclude from folder names. Folders with names containing this substring will not be returned. This search is case-insensitive.',
      ),
    starred: z
      .boolean()
      .optional()
      .describe(
        'Set to true to search for folders that are starred, or false for those that are not.',
      ),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_FIND_FOLDER',
  execute: async (
    {
      full_text_contains,
      full_text_not_contains,
      modified_after,
      name_contains,
      name_exact,
      name_not_contains,
      starred,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      full_text_contains,
      full_text_not_contains,
      modified_after,
      name_contains,
      name_exact,
      name_not_contains,
      starred,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Folder found successfully' : result.error,
      data: result.data,
    };
  },
});

// Get File Metadata
export const googleDriveGetFileMetadata = createComposioTool({
  name: 'googleDriveGetFileMetadata',
  description:
    "Tool to get a file's metadata by ID. Use when you need to retrieve the metadata for a specific file in Google Drive",
  inputSchema: z.object({
    acknowledgeAbuse: z
      .boolean()
      .optional()
      .describe(
        'Whether the user is acknowledging the risk of downloading known malware or other abusive files. This is only applicable when the alt parameter is set to media and the user is the owner of the file or an organizer of the shared drive in which the file resides.',
      ),
    fileId: z.string().describe('The ID of the file.'),
    includeLabels: z
      .string()
      .optional()
      .describe(
        'A comma-separated list of IDs of labels to include in the labelInfo part of the response.',
      ),
    includePermissionsForView: z
      .string()
      .optional()
      .describe(
        "Specifies which additional view's permissions to include in the response. Only 'published' is supported.",
      ),
    supportsAllDrives: z
      .boolean()
      .optional()
      .describe(
        'Whether the requesting application supports both My Drives and shared drives. This parameter will default to false.',
      ),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_GET_FILE_METADATA',
  execute: async (
    {
      acknowledgeAbuse,
      fileId,
      includeLabels,
      includePermissionsForView,
      supportsAllDrives,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      acknowledgeAbuse,
      fileId,
      includeLabels,
      includePermissionsForView,
      supportsAllDrives,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'File metadata retrieved successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Get Permission
export const googleDriveGetPermission = createComposioTool({
  name: 'googleDriveGetPermission',
  description:
    'Gets a permission by ID. Use this tool to retrieve a specific permission for a file or shared drive',
  inputSchema: z.object({
    file_id: z.string().describe('The ID of the file.'),
    permission_id: z.string().describe('The ID of the permission.'),
    supports_all_drives: z
      .boolean()
      .optional()
      .describe(
        'Whether the requesting application supports both My Drives and shared drives.',
      ),
    use_domain_admin_access: z
      .boolean()
      .optional()
      .describe(
        'Issue the request as a domain administrator; if set to true, then the requester will be granted access if the file ID parameter refers to a shared drive and the requester is an administrator of the domain to which the shared drive belongs.',
      ),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_GET_PERMISSION',
  execute: async (
    { file_id, permission_id, supports_all_drives, use_domain_admin_access },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      file_id,
      permission_id,
      supports_all_drives,
      use_domain_admin_access,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Permission retrieved successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Delete Folder or File
export const googleDriveDeleteFolderOrFile = createComposioTool({
  name: 'googleDriveDeleteFolderOrFile',
  description:
    'Tool to delete a file or folder in Google Drive. Use when you need to permanently remove a specific file or folder using its ID. Note: this action is irreversible',
  inputSchema: z.object({
    fileId: z
      .string()
      .describe(
        'The ID of the file or folder to delete. This is a required field.',
      ),
    supportsAllDrives: z
      .boolean()
      .optional()
      .describe(
        "Whether the application supports both My Drives and shared drives. If false or unspecified, the file is attempted to be deleted from the user's My Drive. If true, the item will be deleted from shared drives as well if necessary.",
      ),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_GOOGLE_DRIVE_DELETE_FOLDER_OR_FILE_ACTION',
  execute: async ({ fileId, supportsAllDrives }, composioTool, userId) => {
    const result = await composioTool.execute({
      fileId,
      supportsAllDrives,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'File/folder deleted successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Update File Metadata
export const googleDriveUpdateFilePut = createComposioTool({
  name: 'googleDriveUpdateFilePut',
  description:
    'Updates file metadata. Uses patch semantics (partial update) as per Google Drive API v3. Use this tool to modify attributes of an existing file like its name, description, or parent folders. Note: this action currently supports metadata updates only. File content updates require multipart/related upload and are not yet implemented',
  inputSchema: z.object({
    add_parents: z
      .string()
      .optional()
      .describe('A comma-separated list of parent IDs to add.'),
    description: z
      .string()
      .optional()
      .describe('A short description of the file.'),
    file_id: z.string().describe('The ID of the file to update.'),
    keep_revision_forever: z
      .boolean()
      .optional()
      .describe(
        'Whether to set this revision of the file to be kept forever. This is only applicable to files with binary content in Google Drive. Only 200 revisions for the file can be kept forever. If the limit is reached, try deleting pinned revisions.',
      ),
    mime_type: z
      .string()
      .optional()
      .describe(
        'The MIME type of the file. Google Drive will attempt to automatically detect an appropriate value from uploaded content if no value is provided. The value cannot be changed unless a new revision is uploaded.',
      ),
    name: z.string().optional().describe('The name of the file.'),
    ocr_language: z
      .string()
      .optional()
      .describe(
        'A language hint for OCR processing during image import (ISO 639-1 code).',
      ),
    remove_parents: z
      .string()
      .optional()
      .describe('A comma-separated list of parent IDs to remove.'),
    starred: z
      .boolean()
      .optional()
      .describe('Whether the user has starred the file.'),
    supports_all_drives: z
      .boolean()
      .optional()
      .describe(
        'Whether the requesting application supports both My Drives and shared drives. This parameter will always be true by default if the application is configured to support shared drives.',
      ),
    use_domain_admin_access: z
      .boolean()
      .optional()
      .describe(
        'Whether the requesting application is using domain-wide delegation to access content belonging to a user in a different domain. This is only applicable to files with binary content in Google Drive.',
      ),
    viewers_can_copy_content: z
      .boolean()
      .optional()
      .describe(
        'Whether viewers are prevented from copying content of the file.',
      ),
    writers_can_share: z
      .boolean()
      .optional()
      .describe('Whether writers can share the document with other users.'),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_UPDATE_FILE_PUT',
  execute: async (
    {
      add_parents,
      description,
      file_id,
      keep_revision_forever,
      mime_type,
      name,
      ocr_language,
      remove_parents,
      starred,
      supports_all_drives,
      use_domain_admin_access,
      viewers_can_copy_content,
      writers_can_share,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      add_parents,
      description,
      file_id,
      keep_revision_forever,
      mime_type,
      name,
      ocr_language,
      remove_parents,
      starred,
      supports_all_drives,
      use_domain_admin_access,
      viewers_can_copy_content,
      writers_can_share,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'File metadata updated successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Update Permission
export const googleDriveUpdatePermission = createComposioTool({
  name: 'googleDriveUpdatePermission',
  description:
    'Tool to update a permission with patch semantics. Use when you need to modify an existing permission for a file or shared drive',
  inputSchema: z.object({
    enforceExpansiveAccess: z
      .boolean()
      .default(false)
      .optional()
      .describe(
        'Whether the request should enforce expansive access rules. This field is deprecated, it is recommended to use `permissionDetails` instead.',
      ),
    fileId: z.string().describe('The ID of the file or shared drive.'),
    permission: z.object({
      expirationTime: z
        .string()
        .optional()
        .describe(
          'The time at which this permission will expire (RFC 3339 date-time).',
        ),
      role: z
        .string()
        .optional()
        .describe('The role granted by this permission.'),
    }),
    permissionId: z.string().describe('The ID of the permission.'),
    removeExpiration: z
      .boolean()
      .default(false)
      .optional()
      .describe('Whether to remove the expiration date.'),
    supportsAllDrives: z
      .boolean()
      .default(false)
      .optional()
      .describe(
        'Whether the requesting application supports both My Drives and shared drives.',
      ),
    transferOwnership: z
      .boolean()
      .default(false)
      .optional()
      .describe(
        'Whether to transfer ownership to the specified user and downgrade the current owner to a writer. This parameter is required as an acknowledgement of the side effect when set to true.',
      ),
    useDomainAdminAccess: z
      .boolean()
      .default(false)
      .optional()
      .describe(
        'Issue the request as a domain administrator; if set to true, then the requester will be granted access if the file ID parameter refers to a shared drive and the requester is an administrator of the domain to which the shared drive belongs.',
      ),
  }),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_UPDATE_PERMISSION',
  execute: async (
    {
      enforceExpansiveAccess,
      fileId,
      permission,
      permissionId,
      removeExpiration,
      supportsAllDrives,
      transferOwnership,
      useDomainAdminAccess,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      enforceExpansiveAccess,
      fileId,
      permission,
      permissionId,
      removeExpiration,
      supportsAllDrives,
      transferOwnership,
      useDomainAdminAccess,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Permission updated successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Google Drive
export const authenticateGoogleDrive = createComposioTool({
  name: 'authenticateGoogleDrive',
  description:
    'Initiate authentication with Google Drive to enable file management functionality',
  inputSchema: z.object({}),
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_FIND_FILE',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'Google Drive',
      );

      return {
        success: true,
        message: `🔗 **Google Drive Authentication Required**

To use Google Drive features, you need to authenticate with your Google account first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Google account. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'Google Drive',
          authToolName: 'authenticateGoogleDrive',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Google Drive:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Google Drive authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register the tools
registerComposioTool({
  name: 'googleDriveAddFileSharingPreference',
  tool: googleDriveAddFileSharingPreference,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE',
});

registerComposioTool({
  name: 'googleDriveCreateFile',
  tool: googleDriveCreateFile,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_CREATE_FILE',
});

registerComposioTool({
  name: 'googleDriveCreateFileFromText',
  tool: googleDriveCreateFileFromText,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_CREATE_FILE_FROM_TEXT',
});

registerComposioTool({
  name: 'googleDriveCreateFolder',
  tool: googleDriveCreateFolder,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_CREATE_FOLDER',
});

registerComposioTool({
  name: 'googleDriveEditFile',
  tool: googleDriveEditFile,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_EDIT_FILE',
});

registerComposioTool({
  name: 'googleDriveFindFile',
  tool: googleDriveFindFile,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_FIND_FILE',
});

registerComposioTool({
  name: 'googleDriveFindFolder',
  tool: googleDriveFindFolder,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_FIND_FOLDER',
});

registerComposioTool({
  name: 'googleDriveGetFileMetadata',
  tool: googleDriveGetFileMetadata,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_GET_FILE_METADATA',
});

registerComposioTool({
  name: 'googleDriveGetPermission',
  tool: googleDriveGetPermission,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_GET_PERMISSION',
});

registerComposioTool({
  name: 'googleDriveDeleteFolderOrFile',
  tool: googleDriveDeleteFolderOrFile,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_GOOGLE_DRIVE_DELETE_FOLDER_OR_FILE_ACTION',
});

registerComposioTool({
  name: 'googleDriveUpdateFilePut',
  tool: googleDriveUpdateFilePut,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_UPDATE_FILE_PUT',
});

registerComposioTool({
  name: 'googleDriveUpdatePermission',
  tool: googleDriveUpdatePermission,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_UPDATE_PERMISSION',
});

registerComposioTool({
  name: 'authenticateGoogleDrive',
  tool: authenticateGoogleDrive,
  integrationName: 'Google Drive',
  composioToolName: 'GOOGLEDRIVE_CREATE_FOLDER',
});
