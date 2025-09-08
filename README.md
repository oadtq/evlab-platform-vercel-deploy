<h1 align="center">EveryLab Platform v2</h1>

<p align="center">
    This version is based on Composio integrations. Our roadmap to the final version: Slashy -> Sidekick -> Sola.
</p>

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

```bash
pnpm db:generate
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).

### Composio Integration Setup

This platform includes Composio integration for connecting to various external services. To enable this functionality:

1. **Get your Composio API Key and Auth Config IDs:**
   - Sign up at [Composio](https://composio.dev)
   - Generate an API key from your dashboard
   - Create auth configurations for each integration you want to use
   - Note the auth config IDs for each integration

2. **Set Environment Variables:**
   ```bash
   COMPOSIO_API_KEY=your_composio_api_key_here
   COMPOSIO_GMAIL_AUTH_CONFIG_ID=ac_KohiLlbdKKne  # Your Gmail auth config ID
   COMPOSIO_GOOGLE_CALENDAR_AUTH_CONFIG_ID=your_google_calendar_auth_config_id
   COMPOSIO_GOOGLE_DOCS_AUTH_CONFIG_ID=your_google_docs_auth_config_id
   COMPOSIO_GOOGLE_SHEETS_AUTH_CONFIG_ID=your_google_sheets_auth_config_id
   COMPOSIO_SLACK_AUTH_CONFIG_ID=your_slack_auth_config_id
   COMPOSIO_NOTION_AUTH_CONFIG_ID=your_notion_auth_config_id
   COMPOSIO_TWITTER_AUTH_CONFIG_ID=your_twitter_auth_config_id
   COMPOSIO_LINKEDIN_AUTH_CONFIG_ID=your_linkedin_auth_config_id
   COMPOSIO_AIRTABLE_AUTH_CONFIG_ID=your_airtable_auth_config_id
   ```

3. **Supported Integrations:**
   - Gmail (send emails)
   - Google Calendar (create events)
   - Google Docs (create documents)
   - Google Sheets (create spreadsheets)
   - Slack (post messages)
   - Notion (create pages)
   - X (Twitter) (post tweets)

4. **Authentication Flow:**
   - Users can authenticate integrations through the Integrations dropdown in the chat interface
   - When users request actions that require unauthenticated integrations, the AI will prompt them with authentication links
   - OAuth flows open in popup windows for seamless authentication


### Adding New Composio Integrations

The platform uses a scalable architecture that automatically discovers and loads all Composio integrations. To add a new integration:

#### Step 1: Create Integration File

Create a new file in `lib/ai/tools/composio/integrations` (e.g., `discord.ts`):

```typescript
import { createComposioTool } from './base';
import { registerComposioTool } from './tool-manager';
import { z } from 'zod';

// Example: Send Discord Message
export const discordSendMessage = createComposioTool({
  name: 'discordSendMessage',
  description: 'Send a message to a Discord channel.',
  inputSchema: z.object({
    channelId: z.string().describe('Discord channel ID'),
    content: z.string().describe('Message content'),
  }),
  integrationName: 'Discord',
  composioToolName: 'DISCORD_SEND_MESSAGE',
  execute: async ({ channelId, content }, composioTool, userId) => {
    const result = await composioTool.execute({
      channel_id: channelId,
      content,
    });
    return {
      success: true,
      message: 'Message sent to Discord successfully',
      result,
    };
  },
});

// Register the tool
registerComposioTool({
  name: 'discordSendMessage',
  tool: discordSendMessage,
  integrationName: 'Discord',
  composioToolName: 'DISCORD_SEND_MESSAGE',
});

// Add more tools as needed...
```

#### Step 2: Update Auth Manager

Add the new integration to `lib/composio/auth-manager.ts`:

```typescript
{
  name: 'Discord',
  logo: '/logos/discord.svg',
  connected: false,
  appId: 'discord',
  authConfigId: process.env.COMPOSIO_DISCORD_AUTH_CONFIG_ID || 'DISCORD',
  description: 'Send messages and manage Discord servers',
},
```

#### Step 3: Add Environment Variable

Add to your `.env` file:

```bash
COMPOSIO_DISCORD_AUTH_CONFIG_ID=your_discord_auth_config_id
```

#### Step 4: Update Logo (Optional)

Add the integration logo to `public/logos/discord.svg` and update the auth manager with the correct path.

#### Step 5: Add to Integration Manager (Optional)

Update `components/integration-manager.tsx` to include the new integration in the UI:

```typescript
{ name: 'Discord', logo: '/logos/discord.svg', connected: false },
```

#### That's It!

The system will automatically:
- ✅ Discover your new integration file
- ✅ Load and register all tools
- ✅ Make tools available to the AI
- ✅ Handle authentication flows
- ✅ Include tools in the active tools list

#### Best Practices

1. **Individual Tools**: Create separate tool functions for each specific action (don't group multiple actions in one tool)
2. **Descriptive Names**: Use clear, descriptive names like `discordSendMessage`, `slackCreateChannel`, etc.
3. **Proper Error Handling**: Each tool should handle errors gracefully and return structured responses
4. **Type Safety**: Use Zod schemas for input validation
5. **Registration**: Always register your tools using `registerComposioTool()`

# References
[Composio doc](https://docs.composio.dev/docs/welcome) \
[Composio toolkits](https://docs.composio.dev/toolkits/introduction) \
[Composio auth configs](https://platform.composio.dev/tech_org_2qeiea/default/auth-configs) \
[AI SDK](https://ai-sdk.dev/docs/foundations/agents)