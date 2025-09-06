import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
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

  const url = new URL(request.url);
  const error = url.searchParams.get('error');
  const code = url.searchParams.get('code');

  if (error) {
    return new NextResponse(`OAuth error: ${error}`, { status: 400 });
  }
  if (!code) {
    return new NextResponse('Missing authorization code', { status: 400 });
  }

  const origin = url.origin;
  const callbackUrl = `${origin}/api/mcp/oauth/callback`;

  const clientMetadata: OAuthClientMetadata = {
    client_name: 'EvLab MCP Client',
    redirect_uris: [callbackUrl],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
    scope: 'mcp:tools',
  };

  const oauthProvider = await DatabaseOAuthClientProvider.create(
    session.user.id,
    'rube',
    callbackUrl,
    clientMetadata,
  );

  const transport = new StreamableHTTPClientTransport(new URL(MCP_BASE_URL), {
    authProvider: oauthProvider,
  });

  // Exchange code for tokens and persist via provider
  await transport.finishAuth(code);

  // Redirect to home after successful linking
  return NextResponse.redirect(`${origin}/`, { status: 302 });
}
