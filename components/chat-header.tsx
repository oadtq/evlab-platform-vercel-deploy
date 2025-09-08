'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

// import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { HeaderUserNav } from '@/components/header-user-nav';
import { IntegrationManager } from '@/components/integration-manager';
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
    <header className="flex sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 items-center px-6 gap-4">
      {/* Left side - Sidebar toggle and New Chat button */}
      <div className="flex items-center gap-3">
        <SidebarToggle />

        {/* New Chat button - always visible */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
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
      </div>

      {/* Center - EveryLab branding - absolutely centered */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link
          href="/"
          className="flex items-center text-lg font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
        >
          Every<span className="text-primary">Lab</span>.ai
        </Link>
      </div>

      {/* Right side - Model selector, Visibility selector, Integration manager, and User navigation */}
      <div className="flex items-center gap-3 ml-auto">
        {/* {!isReadonly && (
          <ModelSelector session={session} selectedModelId={selectedModelId} />
        )}

        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )} */}

        <IntegrationManager />
        <HeaderUserNav user={session.user} />
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
