import { getComposioClient } from './client';
import type { Integration, ConnectionStatus, AuthRequest } from './types';
import {
  getUserIntegrations,
  getUserIntegration,
  createOrUpdateUserIntegration,
  createAuthRequest,
  getUserAuthRequest,
  deleteAuthRequest,
} from '@/lib/db/queries';

export class ComposioAuthManager {
  private composio = getComposioClient();

  // List of available integrations with their Composio app IDs
  private integrations: Integration[] = [
    {
      name: 'Gmail',
      logo: '/logos/gmail.svg',
      connected: false,
      appId: 'gmail',
      authConfigId: process.env.COMPOSIO_GMAIL_AUTH_CONFIG_ID || 'GMAIL',
      description: 'Send and manage emails',
    },
    {
      name: 'Google Calendar',
      logo: '/logos/google-calendar.svg',
      connected: false,
      appId: 'google-calendar',
      authConfigId:
        process.env.COMPOSIO_GOOGLE_CALENDAR_AUTH_CONFIG_ID || 'GOOGLECALENDAR',
      description: 'Manage calendar events',
    },
    {
      name: 'Google Docs',
      logo: '/logos/google-docs.svg',
      connected: false,
      appId: 'google-docs',
      authConfigId:
        process.env.COMPOSIO_GOOGLE_DOCS_AUTH_CONFIG_ID || 'GOOGLEDOCS',
      description: 'Create and edit documents',
    },
    {
      name: 'Google Sheets',
      logo: '/logos/google-sheets.svg',
      connected: false,
      appId: 'google-sheets',
      authConfigId:
        process.env.COMPOSIO_GOOGLE_SHEETS_AUTH_CONFIG_ID || 'GOOGLESHEETS',
      description: 'Create and edit spreadsheets',
    },
    {
      name: 'Google Drive',
      logo: '/logos/google-drive.svg',
      connected: false,
      appId: 'google-drive',
      authConfigId: process.env.COMPOSIO_GOOGLE_DRIVE_AUTH_CONFIG_ID || 'GOOGLEDRIVE',
      description: 'Manage Google Drive files and folders',
    },
    {
      name: 'Notion',
      logo: '/logos/notion.svg',
      connected: false,
      appId: 'notion',
      authConfigId: process.env.COMPOSIO_NOTION_AUTH_CONFIG_ID || 'NOTION',
      description: 'Manage Notion pages and databases',
    },
    // {
    //   name: 'Airtable',
    //   logo: '/logos/airtable.svg',
    //   connected: false,
    //   appId: 'airtable',
    //   authConfigId: process.env.COMPOSIO_AIRTABLE_AUTH_CONFIG_ID || 'AIRTABLE',
    //   description: 'Manage Airtable bases',
    // },
    {
      name: 'Slack',
      logo: '/logos/slack.svg',
      connected: false,
      appId: 'slack',
      authConfigId: process.env.COMPOSIO_SLACK_AUTH_CONFIG_ID || 'SLACK',
      description: 'Send messages and manage channels',
    },
    {
      name: 'X (Twitter)',
      logo: '/logos/twitter.png',
      connected: false,
      appId: 'twitter',
      authConfigId: process.env.COMPOSIO_TWITTER_AUTH_CONFIG_ID || 'TWITTER',
      description: 'Post tweets and manage account',
    },
    {
      name: 'LinkedIn',
      logo: '/logos/linkedin.svg',
      connected: false,
      appId: 'linkedin',
      authConfigId: process.env.COMPOSIO_LINKEDIN_AUTH_CONFIG_ID || 'LINKEDIN',
      description: 'Manage LinkedIn posts and connections',
    },
    // {
    //   name: 'Hubspot',
    //   logo: '/logos/hubspot.webp',
    //   connected: false,
    //   appId: 'hubspot',
    //   authConfigId: process.env.COMPOSIO_HUBSPOT_AUTH_CONFIG_ID || 'HUBSPOT',
    //   description: 'Manage Hubspot contacts and deals',
    // },
    // {
    //   name: 'Outlook',
    //   logo: '/logos/outlook.svg',
    //   connected: false,
    //   appId: 'outlook',
    //   authConfigId: process.env.COMPOSIO_OUTLOOK_AUTH_CONFIG_ID || 'OUTLOOK',
    //   description: 'Manage Outlook contacts and emails',
    // },
    {
      name: 'Facebook',
      logo: '/logos/facebook.svg',
      connected: false,
      appId: 'facebook',
      authConfigId: process.env.COMPOSIO_FACEBOOK_AUTH_CONFIG_ID || 'FACEBOOK',
      description: 'Manage Facebook posts and pages',
    },
  ];

  async getIntegrations(userId: string): Promise<Integration[]> {
    // Get user's integration data from database
    const userIntegrations = await getUserIntegrations({ userId });

    // Create a map of integration name to database record
    const integrationMap = new Map(
      userIntegrations.map((integration) => [
        integration.integrationName,
        integration,
      ]),
    );

    // Check connection status for each integration
    const integrationsWithStatus = await Promise.all(
      this.integrations.map(async (integration) => {
        const dbRecord = integrationMap.get(integration.name);
        let connected = false;

        if (dbRecord) {
          // If we have a database record, use it
          connected = dbRecord.isConnected;
        } else {
          // If no database record, check Composio status
          const connectionStatus = await this.getConnectionStatus(
            userId,
            integration.name,
          );
          connected = connectionStatus.connected;
        }

        return {
          ...integration,
          connected,
        };
      }),
    );

    return integrationsWithStatus;
  }

  async getConnectionStatus(
    userId: string,
    integrationName: string,
  ): Promise<ConnectionStatus> {
    try {
      // First, check database for existing record
      const dbRecord = await getUserIntegration({ userId, integrationName });

      if (dbRecord) {
        // If we have a database record, return it (unless we need to verify with Composio)
        return {
          integration: integrationName,
          connected: dbRecord.isConnected,
          connectionId: dbRecord.connectionId || undefined,
        };
      }

      // If no database record, check Composio status and create database record
      const connections = await this.composio.connectedAccounts.list({
        userIds: [userId],
      });

      const integration = this.integrations.find(
        (i) => i.name === integrationName,
      );
      if (!integration) {
        throw new Error(`Integration ${integrationName} not found`);
      }

      // Find connections for this integration by checking both toolkit slug and auth config
      const relevantConnections = connections.items.filter(
        (conn) =>
          conn.toolkit.slug === integration.appId ||
          conn.authConfig.id === integration.authConfigId,
      );

      console.log(
        `Found ${relevantConnections.length} connections for ${integrationName}:`,
        relevantConnections.map((conn) => ({
          id: conn.id,
          toolkit: conn.toolkit.slug,
          authConfigId: conn.authConfig.id,
          status: conn.status,
        })),
      );

      const isConnected = relevantConnections.length > 0;

      // Save to database - use the most recent connection if multiple exist
      if (relevantConnections.length > 0) {
        const latestConnection = relevantConnections.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];

        await createOrUpdateUserIntegration({
          userId,
          integrationName,
          connectionId: latestConnection.id,
          authConfigId: integration.authConfigId,
          isConnected,
          metadata: {
            toolkit: latestConnection.toolkit,
            status: latestConnection.status,
            totalConnections: relevantConnections.length,
            connectionIds: relevantConnections.map((conn) => conn.id),
          },
        });
      }

      return {
        integration: integrationName,
        connected: isConnected,
        connectionId:
          relevantConnections.length > 0
            ? relevantConnections[0].id
            : undefined,
      };
    } catch (error) {
      console.error(
        `Error checking connection status for ${integrationName}:`,
        error,
      );
      return {
        integration: integrationName,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async initiateAuth(
    userId: string,
    integrationName: string,
  ): Promise<AuthRequest> {
    const integration = this.integrations.find(
      (i) => i.name === integrationName,
    );
    if (!integration || !integration.authConfigId) {
      throw new Error(
        `Integration ${integrationName} not found or not configured`,
      );
    }

    try {
      if (!integration.authConfigId) {
        throw new Error(
          `Integration ${integrationName} does not have an auth config ID`,
        );
      }

      console.log(
        `Initiating auth for ${integrationName} with config: ${integration.authConfigId}`,
      );

      const connectionRequest = await this.composio.connectedAccounts.initiate(
        userId,
        integration.authConfigId,
        {
          allowMultiple: true, // Allow multiple connected accounts
        },
      );

      console.log(
        `Auth initiated successfully for ${integrationName}, redirect URL: ${connectionRequest.redirectUrl}`,
      );

      if (!connectionRequest.redirectUrl) {
        throw new Error('No redirect URL provided by Composio');
      }

      // Check if there's already an active auth request for this user/integration
      const existingAuthRequest = await getUserAuthRequest({
        userId,
        integrationName,
      });

      if (existingAuthRequest) {
        // Return the existing request if it's still valid
        return {
          integration: existingAuthRequest.integrationName,
          redirectUrl: existingAuthRequest.redirectUrl,
          expiresAt: existingAuthRequest.expiresAt,
        };
      }

      // Create a unique request ID
      const requestId = `${userId}:${integrationName}:${Date.now()}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store the auth request in database
      await createAuthRequest({
        userId,
        integrationName,
        requestId,
        redirectUrl: connectionRequest.redirectUrl,
        expiresAt,
      });

      const authRequest: AuthRequest = {
        integration: integrationName,
        redirectUrl: connectionRequest.redirectUrl,
        expiresAt,
      };

      return authRequest;
    } catch (error) {
      console.error(`Error initiating auth for ${integrationName}:`, error);
      throw new Error(
        `Failed to initiate authentication for ${integrationName}`,
      );
    }
  }

  async waitForConnection(
    userId: string,
    integrationName: string,
  ): Promise<ConnectionStatus> {
    const maxRetries = 30; // 30 seconds with 1 second intervals
    const retryDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      const status = await this.getConnectionStatus(userId, integrationName);

      if (status.connected) {
        // Clean up the auth request since connection is established
        await this.cleanupAuthRequest(userId, integrationName);
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    throw new Error(`Connection timeout for ${integrationName}`);
  }

  getIntegrationByName(name: string): Integration | undefined {
    return this.integrations.find((i) => i.name === name);
  }

  // Clean up auth request after successful connection
  async cleanupAuthRequest(userId: string, integrationName: string) {
    try {
      const authRequest = await getUserAuthRequest({
        userId,
        integrationName,
      });

      if (authRequest) {
        await deleteAuthRequest(authRequest.requestId);
      }
    } catch (error) {
      console.error('Error cleaning up auth request:', error);
    }
  }

  // Clear cache for a user's integration (no-op since we use database)
  clearCache(userId: string, integrationName?: string) {
    // No-op: we're using database storage now
    // In the future, we could implement Redis cache invalidation here
  }
}

// Export singleton instance
export const composioAuthManager = new ComposioAuthManager();
