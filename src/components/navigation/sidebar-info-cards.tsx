"use client";

import { Sparkles } from "lucide-react";

import { InfoCard, InfoCardContent, InfoCardDescription, InfoCardDismiss, InfoCardFooter, InfoCardMedia, InfoCardTitle } from "@/components/ui/info-card";
import { useSidebar } from "@/components/ui/sidebar";
import { sidebar_info_card } from "@/lib/sidebar-data";

export function SidebarInfoCards() {
  const { state } = useSidebar();

  if (state === "collapsed") {
    return null;
  }

  if (!sidebar_info_card) {
    return null;
  }

  return (
    <InfoCard storageKey={sidebar_info_card.storage_key} className="mx-2 mb-2">
      <InfoCardContent>
        <InfoCardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          {sidebar_info_card.title}
        </InfoCardTitle>
        <InfoCardDescription>{sidebar_info_card.description}</InfoCardDescription>
      </InfoCardContent>
      <InfoCardMedia media={sidebar_info_card.media} shrinkHeight={75} expandHeight={150} />
      <InfoCardFooter className="mt-3">
        <InfoCardDismiss>Got it</InfoCardDismiss>
      </InfoCardFooter>
    </InfoCard>
  );
}
