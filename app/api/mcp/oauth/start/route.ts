import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { Client as MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { OAuthClientMetadata } from '@modelcontextprotocol/sdk/shared/auth.js';
import { DatabaseOAuthClientProvider } from '@/lib/mcp/oauth-provider';

const MCP_BASE_URL = process.env.MCP_SERVER
  ? process.env.MCP_SERVER
  : 'https://rube.app/mcp';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const callbackUrl = `${origin}/api/mcp/oauth/callback`;

  const clientMetadata: OAuthClientMetadata = {
    client_name: 'EvLab MCP Client',
    redirect_uris: [callbackUrl],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
    scope: 'mcp:tools',
  };

  let resolveRedirect: (url: URL) => void;
  const redirectPromise = new Promise<URL>((resolve) => {
    resolveRedirect = resolve;
  });

  const oauthProvider = await DatabaseOAuthClientProvider.create(
    session.user.id,
    'rube',
    callbackUrl,
    clientMetadata,
    (url) => resolveRedirect(url),
  );

  const client = new MCPClient(
    { name: 'evlab-mcp-client', version: '1.0.0' },
    { capabilities: {} },
  );

  const transport = new StreamableHTTPClientTransport(new URL(MCP_BASE_URL), {
    authProvider: oauthProvider,
  });

  // Trigger OAuth redirect by attempting a connection
  // We wait only for the redirect URL capture, not for full auth
  client.connect(transport).catch(() => {
    // Unauthorized expected until user completes OAuth; ignore
  });

  const authorizationUrl = await redirectPromise;
  return NextResponse.redirect(authorizationUrl.toString(), { status: 302 });
}
