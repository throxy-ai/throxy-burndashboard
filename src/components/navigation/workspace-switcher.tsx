"use client";

import { useState } from "react";
import { Building2, ChevronsUpDown } from "lucide-react";

import { workspaces } from "@/lib/sidebar-data";
import { WorkspaceSelector } from "@/components/navigation/workspace-selector";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher() {
  const [selected_id, set_selected_id] = useState(workspaces[0]?.id ?? "");
  const { state } = useSidebar();
  const is_collapsed = state === "collapsed";

  const selected = workspaces.find((w) => w.id === selected_id);

  const trigger = (
    <SidebarMenuButton
      className={cn(
        "w-full cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
        is_collapsed && "justify-center p-0",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-none bg-muted",
          is_collapsed ? "size-6" : "size-5",
        )}
      >
        <Building2 className={is_collapsed ? "size-5" : "size-4"} />
      </div>
      {!is_collapsed && (
        <>
          <span className="flex-1 truncate text-sm font-medium">{selected?.name ?? "No workspace"}</span>
          <ChevronsUpDown className="ml-auto size-4 opacity-50" />
        </>
      )}
    </SidebarMenuButton>
  );

  return (
    <WorkspaceSelector
      value={selected_id}
      on_change={set_selected_id}
      workspaces={workspaces}
      trigger={trigger}
      popover_side={is_collapsed ? "right" : "top"}
      popover_align={is_collapsed ? "end" : "start"}
      popover_side_offset={4}
      popover_align_offset={8}
      search_position="bottom"
    />
  );
}
