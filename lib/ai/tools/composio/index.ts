// Export all Composio tools
// Gmail tools
export {
  gmailSendEmail, // tested and working
  gmailSendDraft,
  gmailMoveToTrash,
  gmailFetchEmails,
  gmailReplyToEmail,
  gmailCreateDraft,
  authenticateGmail,
} from './integrations/gmail';

// Google Calendar tools
export {
  googleCalendarCreateEvent,
  googleCalendarUpdateEvent,
  googleCalendarDeleteEvent,
  googleCalendarListEvents,
  authenticateGoogleCalendar,
} from './integrations/google-calendar';

// Google Docs tools
export {
  googleDocsCreateDocument, // tested and working
  googleDocsCreateDocumentMarkdown, // tested and working
  googleDocsGetDocumentById,
  googleDocsSearchDocuments,
  googleDocsReplaceImage,
  googleDocsUpdateDocumentMarkdown,
  googleDocsUpdateExistingDocument,
  authenticateGoogleDocs,
} from './integrations/google-docs';

// Google Sheets tools
export {
  googleSheetsCreateGoogleSheet,
  googleSheetsAddSheet,
  googleSheetsAppendDimension,
  googleSheetsBatchGet,
  googleSheetsBatchUpdate,
  googleSheetsBatchUpdateValuesByDataFilter,
  googleSheetsClearValues,
  googleSheetsCreateSpreadsheetColumn,
  googleSheetsCreateSpreadsheetRow,
  googleSheetsDeleteDimension,
  googleSheetsDeleteSheet,
  googleSheetsExecuteSql,
  googleSheetsGetSpreadsheetInfo,
  googleSheetsGetTableSchema,
  authenticateGoogleSheets,
} from './integrations/google-sheets';

// Google Drive tools
export {
  googleDriveAddFileSharingPreference,
  googleDriveCreateFile,
  googleDriveCreateFileFromText,
  googleDriveCreateFolder, // tested and working
  googleDriveEditFile,
  googleDriveFindFile,
  googleDriveFindFolder,
  googleDriveGetFileMetadata,
  googleDriveGetPermission,
  googleDriveDeleteFolderOrFile,
  googleDriveUpdateFilePut,
  googleDriveUpdatePermission,
  authenticateGoogleDrive,
} from './integrations/google-drive';

// Twitter tools
export {
  twitterCreateNewDmConversation,
  twitterCreationOfAPost,
  twitterDeleteDm,
  twitterFullArchiveSearch,
  twitterFullArchiveSearchCounts,
  twitterUserLookupMe,
  authenticateTwitter,
} from './integrations/twitter';

// Slack tools
export {
  slackAddRemoteFile,
  slackCreateUserGroup,
  slackCreateChannel,
  slackCreateChannelConversation,
  slackDeleteScheduledMessage,
  slackDeleteMessage,
  slackFetchConversationHistory,
  slackFindChannels,
  slackListAllChannels,
  slackListConversations,
  slackSendMessage,
  authenticateSlack,
} from './integrations/slack';

// Notion tools
export {
  notionAddMultiplePageContent,
  notionAppendBlockChildren,
  notionCreateDatabase,
  notionCreateNotionPage,
  notionDeleteBlock,
  notionFetchData,
  notionFetchBlockMetadata,
  notionFetchDatabase,
  notionQueryDatabase,
  notionSearchNotionPage,
  notionUpdateBlock,
  notionUpdatePage,
  notionUpdateRowDatabase,
  notionUpdateSchemaDatabase,
  authenticateNotion,
} from './integrations/notion';

// LinkedIn tools
export {
  linkedinCreatePost,
  linkedinDeletePost,
  linkedinGetCompanyInfo,
  linkedinGetMyInfo,
  authenticateLinkedIn,
} from './integrations/linkedin';

// Facebook tools
export {
  facebookCreatePost,
  facebookCreatePhotoPost,
  facebookCreateVideoPost,
  facebookUpdatePost,
  facebookDeletePost,
  facebookGetPageDetails,
  authenticateFacebook,
} from './integrations/facebook';

// Composio Search tools (No Auth Required)
export {
  composioSearch, // tested and working
  composioTavilySearch,
  composioExaSimilarLink,
  composioImageSearch,
  composioTrendsSearch,
} from './integrations/search';
