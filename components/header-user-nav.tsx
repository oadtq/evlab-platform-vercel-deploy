'use client';

import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { guestRegex } from '@/lib/constants';

export function HeaderUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();

  const isGuest = guestRegex.test(data?.user?.email ?? '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {status === 'loading' ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
          >
            <div className="size-6 bg-zinc-500/30 rounded-full animate-pulse" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 hover:bg-muted"
            data-testid="header-user-nav-button"
          >
            <Image
              src={`https://avatar.vercel.sh/${user.email}`}
              alt={user.email ?? 'User Avatar'}
              width={32}
              height={32}
              className="rounded-full"
            />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-testid="header-user-nav-menu"
        align="end"
        className="w-56"
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{isGuest ? 'Guest' : user?.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="header-user-nav-item-theme"
          className="cursor-pointer"
          onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {`Toggle ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild data-testid="header-user-nav-item-auth">
          <button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => {
              if (status === 'loading') {
                toast({
                  type: 'error',
                  description:
                    'Checking authentication status, please try again!',
                });

                return;
              }

              if (isGuest) {
                router.push('/login');
              } else {
                signOut({
                  redirectTo: '/',
                });
              }
            }}
          >
            {isGuest ? 'Login to your account' : 'Sign out'}
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
