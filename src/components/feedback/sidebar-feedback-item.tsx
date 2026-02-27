"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function SidebarFeedbackItem() {
  const [open, set_open] = useState(false);

  return (
    <>
      <SidebarMenuItem className="mb-3">
        <SidebarMenuButton
          tooltip="Feedback"
          className="justify-center text-center"
          onClick={() => {
            set_open(true);
          }}
        >
          <Flag className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Feedback</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <FeedbackModal open={open} onOpenChange={set_open} />
    </>
  );
}
