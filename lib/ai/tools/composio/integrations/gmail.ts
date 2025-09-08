import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Send Email
export const gmailSendEmail = createComposioTool({
  name: 'gmailSendEmail',
  description:
    "Sends an email via gmail api using the authenticated user's google profile display name.",
  inputSchema: z.object({
    recipient_email: z.string().email().describe('Recipient email address'),
    subject: z.string().describe('Email subject'),
    body: z.string().describe('Email body content'),
    extra_recipients: z
      .array(z.string().email())
      .optional()
      .describe('Extra recipient email addresses'),
    cc: z.array(z.string().email()).optional().describe('CC email addresses'),
    bcc: z.array(z.string().email()).optional().describe('BCC email addresses'),
    attachment: z
      .object({
        s3key: z.string().describe('S3 key of the attachment'),
        mimetype: z.string().describe('Mimetype of the attachment'),
        name: z.string().describe('Name of the attachment'),
      })
      .optional()
      .describe('File to attach'),
    is_html: z
      .boolean()
      .optional()
      .describe('Set to `True` if the email body contains HTML tags.'),
  }),
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_SEND_EMAIL',
  execute: async (
    {
      recipient_email,
      subject,
      body,
      extra_recipients,
      cc,
      bcc,
      attachment,
      is_html,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      recipient_email,
      subject,
      body,
      extra_recipients,
      cc,
      bcc,
      attachment,
      is_html,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Email sent successfully' : result.error,
      data: result.data,
    };
  },
});

// Send Draft Email
export const gmailSendDraft = createComposioTool({
  name: 'gmailSendDraft',
  description:
    'Sends the specified, existing draft to the recipients in the to, cc, and bcc headers.',
  inputSchema: z.object({
    draftId: z.string().describe('ID of the draft to send'),
  }),
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_SEND_DRAFT',
  execute: async ({ draftId }, composioTool, userId) => {
    const result = await composioTool.execute({
      draft_id: draftId,
    });
    return {
      success: result.successful,
      message: result.successful
        ? 'Draft email sent successfully'
        : result.error,
      data: result.data,
    };
  },
});

// Move Email to Trash
export const gmailMoveToTrash = createComposioTool({
  name: 'gmailMoveToTrash',
  description:
    'Moves an existing, non-deleted email message to the trash for the specified user.',
  inputSchema: z.object({
    messageId: z.string().describe('ID of the email message to trash'),
  }),
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_MOVE_TO_TRASH',
  execute: async ({ messageId }, composioTool, userId) => {
    const result = await composioTool.execute({
      message_id: messageId,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Email moved to trash' : result.error,
      data: result.data,
    };
  },
});

// Fetch Emails
export const gmailFetchEmails = createComposioTool({
  name: 'gmailFetchEmails',
  description:
    'Fetches a list of email messages from a gmail account, supporting filtering, pagination, and optional full content retrieval.',
  inputSchema: z.object({
    ids_only: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'If true, only returns message IDs from the list API without fetching individual message details. Fastest option for getting just message IDs and thread IDs.',
      ),
    include_payload: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'Set to true to include full message payload (headers, body, attachments); false for metadata only.',
      ),
    include_spam_trash: z
      .boolean()
      .optional()
      .default(false)
      .describe("Set to true to include messages from 'SPAM' and 'TRASH'."),
    label_ids: z
      .array(z.string())
      .optional()
      .describe(
        "Filter by label IDs; only messages with all specified labels are returned. Common IDs: 'INBOX', 'SPAM', 'TRASH', 'UNREAD', 'STARRED', 'IMPORTANT', 'CATEGORY_PRIMARY' (alias 'CATEGORY_PERSONAL'), 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_FORUMS'. Use 'listLabels' action for custom IDs.",
      ),
    max_results: z
      .number()
      .min(1)
      .max(500)
      .optional()
      .default(10)
      .describe('Maximum number of messages to retrieve per page.'),
    page_token: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Token for retrieving a specific page, obtained from a previous response's `nextPageToken`. Omit for the first page.",
      ),
    query: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Gmail advanced search query (e.g., 'from:user subject:meeting'). Supports operators like 'from:', 'to:', 'subject:', 'label:', 'has:attachment', 'is:unread', 'after:YYYY/MM/DD', 'before:YYYY/MM/DD', AND/OR/NOT. Use quotes for exact phrases. Omit for no query filter.",
      ),
    user_id: z
      .string()
      .optional()
      .default('me')
      .describe("User's email address or 'me' for the authenticated user."),
    verbose: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'If false, uses optimized concurrent metadata fetching for faster performance (~75% improvement). If true, uses standard detailed message fetching. When false, only essential fields (subject, sender, recipient, time, labels) are guaranteed.',
      ),
  }),
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_FETCH_EMAILS',
  execute: async (
    {
      ids_only,
      include_payload,
      include_spam_trash,
      label_ids,
      max_results,
      page_token,
      query,
      user_id,
      verbose,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      ids_only,
      include_payload,
      include_spam_trash,
      label_ids,
      max_results,
      page_token,
      query,
      user_id,
      verbose,
    });
    return {
      success: result.successful,
      message: result.successful ? `Fetched emails successfully` : result.error,
      data: result.data,
    };
  },
});

// Reply to Email
export const gmailReplyToEmail = createComposioTool({
  name: 'gmailReplyToEmail',
  description:
    "Sends a reply within a specific gmail thread using the original thread's subject",
  inputSchema: z.object({
    thread_id: z
      .string()
      .describe('Identifier of the Gmail thread for the reply.'),
    message_body: z
      .string()
      .describe('Content of the reply message, either plain text or HTML.'),
    recipient_email: z.string().describe("Primary recipient's email address."),
    attachment: z
      .object({
        mimetype: z.string().describe('Mimetype of the attachment'),
        name: z.string().describe('Name of the attachment'),
        s3key: z.string().describe('S3 key of the attachment'),
      })
      .optional()
      .describe('File to attach to the reply. Just Provide file path here'),
    bcc: z
      .array(z.string())
      .optional()
      .default([])
      .describe(
        "BCC recipients' email addresses (hidden from other recipients).",
      ),
    cc: z
      .array(z.string())
      .optional()
      .default([])
      .describe("CC recipients' email addresses."),
    extra_recipients: z
      .array(z.string())
      .optional()
      .default([])
      .describe("Additional 'To' recipients' email addresses."),
    is_html: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Indicates if `message_body` is HTML; if True, body must be valid HTML, if False, body should not contain HTML tags.',
      ),
    user_id: z
      .string()
      .optional()
      .default('me')
      .describe(
        "Identifier for the user sending the reply; 'me' refers to the authenticated user.",
      ),
  }),
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_REPLY_TO_THREAD',
  execute: async (
    {
      thread_id,
      message_body,
      recipient_email,
      attachment,
      bcc,
      cc,
      extra_recipients,
      is_html,
      user_id,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      thread_id,
      message_body,
      recipient_email,
      attachment,
      bcc,
      cc,
      extra_recipients,
      is_html,
      user_id,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Reply sent successfully' : result.error,
      data: result.data,
    };
  },
});

// Create Draft Email
export const gmailCreateDraft = createComposioTool({
  name: 'gmailCreateDraft',
  description: 'Create a draft email in Gmail.',
  inputSchema: z.object({
    recipient_email: z.string().describe("Primary recipient's email address."),
    subject: z.string().describe('Email subject line.'),
    body: z
      .string()
      .describe(
        'Email body content (plain text or HTML); `is_html` must be True if HTML.',
      ),
    attachment: z
      .object({
        mimetype: z.string().describe('Mimetype of the attachment'),
        name: z.string().describe('Name of the attachment'),
        s3key: z.string().describe('S3 key of the attachment'),
      })
      .optional()
      .describe('File to attach to the email.'),
    bcc: z
      .array(z.string())
      .optional()
      .default([])
      .describe("'Bcc' (blind carbon copy) recipient email addresses."),
    cc: z
      .array(z.string())
      .optional()
      .default([])
      .describe("'Cc' (carbon copy) recipient email addresses."),
    extra_recipients: z
      .array(z.string())
      .optional()
      .default([])
      .describe("Additional 'To' recipient email addresses."),
    is_html: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Set to True if `body` is HTML, otherwise the action may fail.',
      ),
    thread_id: z
      .string()
      .nullable()
      .optional()
      .describe(
        'ID of an existing Gmail thread to reply to; omit for new thread.',
      ),
    user_id: z
      .string()
      .optional()
      .default('me')
      .describe("User's email address or 'me' for the authenticated user."),
  }),
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_CREATE_EMAIL_DRAFT',
  execute: async (
    {
      recipient_email,
      subject,
      body,
      attachment,
      bcc,
      cc,
      extra_recipients,
      is_html,
      thread_id,
      user_id,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      recipient_email,
      subject,
      body,
      attachment,
      bcc,
      cc,
      extra_recipients,
      is_html,
      thread_id,
      user_id,
    });
    return {
      success: result.successful,
      message: result.successful ? 'Draft created successfully' : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Gmail
export const authenticateGmail = createComposioTool({
  name: 'authenticateGmail',
  description:
    'Initiate authentication with Gmail to enable email functionality',
  inputSchema: z.object({}),
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_FETCH_EMAILS',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'Gmail',
      );

      return {
        success: true,
        message: `🔗 **Gmail Authentication Required**

To use Gmail features, you need to authenticate with your Gmail account first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Gmail account. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'Gmail',
          authToolName: 'authenticateGmail',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Gmail:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Gmail authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

// Auto-register the tools
registerComposioTool({
  name: 'gmailMoveToTrash',
  tool: gmailMoveToTrash,
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_MOVE_TO_TRASH',
});

registerComposioTool({
  name: 'gmailSendDraft',
  tool: gmailSendDraft,
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_SEND_DRAFT',
});

registerComposioTool({
  name: 'gmailSendEmail',
  tool: gmailSendEmail,
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_SEND_EMAIL',
});

registerComposioTool({
  name: 'gmailFetchEmails',
  tool: gmailFetchEmails,
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_FETCH_EMAILS',
});

registerComposioTool({
  name: 'gmailReplyToEmail',
  tool: gmailReplyToEmail,
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_REPLY_TO_THREAD',
});

registerComposioTool({
  name: 'gmailCreateDraft',
  tool: gmailCreateDraft,
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_CREATE_EMAIL_DRAFT',
});

registerComposioTool({
  name: 'authenticateGmail',
  tool: authenticateGmail,
  integrationName: 'Gmail',
  composioToolName: 'GMAIL_SEND_EMAIL',
});
