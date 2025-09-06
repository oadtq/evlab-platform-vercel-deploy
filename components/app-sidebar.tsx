'use client';

import type { User } from 'next-auth';
// import { useRouter } from 'next/navigation';

// import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
// import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarHeader,
  // SidebarMenu,
  // useSidebar,
} from '@/components/ui/sidebar';
// import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function AppSidebar({ user }: { user: User | undefined }) {
  // const router = useRouter();
  // const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      {/* <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-end items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader> */}
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
