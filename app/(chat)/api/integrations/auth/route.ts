import { auth } from '@/app/(auth)/auth';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { integration } = body;

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration name is required' },
        { status: 400 },
      );
    }

    const authRequest = await composioAuthManager.initiateAuth(
      session.user.id,
      integration,
    );

    return NextResponse.json({
      redirectUrl: authRequest.redirectUrl,
      integration: authRequest.integration,
    });
  } catch (error) {
    console.error('Error initiating auth:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initiate authentication',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const integration = searchParams.get('integration');

  if (!integration) {
    return NextResponse.json(
      { error: 'Integration parameter is required' },
      { status: 400 },
    );
  }

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connectionStatus = await composioAuthManager.getConnectionStatus(
      session.user.id,
      integration,
    );

    return NextResponse.json({
      integration,
      connected: connectionStatus.connected,
      connectionId: connectionStatus.connectionId,
    });
  } catch (error) {
    console.error('Error checking connection status:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 },
    );
  }
}
