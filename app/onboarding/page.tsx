import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getMcpOAuthByUser } from '@/lib/db/queries';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // If already connected, go to home
  const creds = await getMcpOAuthByUser({ userId: session.user.id, provider: 'rube' });
  if (creds?.tokens) {
    redirect('/');
  }

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-2xl border p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Connect Rube MCP</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Link your Rube MCP account to enable tools in chat. You will be
            redirected to authorize, then returned here.
          </p>
        </div>
        <div>
          <Link
            href="/api/mcp/oauth/start"
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90 dark:bg-white dark:text-black"
          >
            Connect Rube MCP
          </Link>
        </div>
        <p className="text-xs text-gray-500 dark:text-zinc-500">
          Having trouble? Ensure popups are allowed and try again.
        </p>
      </div>
    </div>
  );
}

