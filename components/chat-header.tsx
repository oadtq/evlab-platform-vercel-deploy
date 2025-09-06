'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

// import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { HeaderUserNav } from '@/components/header-user-nav';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
// import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { VisibilityType } from './visibility-selector';
import type { Session } from 'next-auth';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 items-center px-4 gap-3">
      <SidebarToggle />

      {/* New Chat button - always visible */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
          >
            <PlusIcon />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>New Chat</TooltipContent>
      </Tooltip>

      {/* Center - EveryLab branding */}
      <div className="flex-1 flex items-center justify-center">
        <Link
          href="/"
          className="flex items-center text-lg font-normal hover:opacity-80 transition-opacity"
        >
          Every<span className="text-green-primary">Lab</span>.ai
        </Link>
      </div>

      {/* Right side - Model selector, Visibility selector, and User navigation */}
      <div className="flex items-center gap-3">
        {/* {!isReadonly && (
          <ModelSelector session={session} selectedModelId={selectedModelId} />
        )}

        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )} */}

        <HeaderUserNav user={session.user} />
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
