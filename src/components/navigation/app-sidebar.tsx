"use client";

import { SidebarFeedbackItem } from "@/components/feedback/sidebar-feedback-item";
import { NavGroups } from "@/components/navigation/nav-groups";
import { NavLogo } from "@/components/navigation/nav-logo";
import { SidebarInfoCards } from "@/components/navigation/sidebar-info-cards";
import { UserButton } from "@/components/navigation/user-button";
import { WorkspaceSwitcher } from "@/components/navigation/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const is_collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavGroups />
      </SidebarContent>
      <SidebarFooter>
        <SidebarInfoCards />
        <SidebarMenu>
          <SidebarFeedbackItem />
          {is_collapsed ? (
            <>
              <SidebarMenuItem>
                <WorkspaceSwitcher />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <UserButton />
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <div className="flex w-full items-center gap-0.5">
                <div className="min-w-0 flex-1">
                  <WorkspaceSwitcher />
                </div>
                <UserButton />
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
