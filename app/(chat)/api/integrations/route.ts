import { auth } from '@/app/(auth)/auth';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const integrations = await composioAuthManager.getIntegrations(
      session.user.id,
    );

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 },
    );
  }
}
