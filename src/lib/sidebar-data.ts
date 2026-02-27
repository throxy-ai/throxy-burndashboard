import type { LucideIcon } from "lucide-react";
import { Flame, Settings } from "lucide-react";

export interface SidebarSubLink {
  title: string;
  href: string;
}

export interface SidebarLink {
  title: string;
  href: string;
  icon: LucideIcon;
  items?: SidebarSubLink[];
}

export interface SidebarGroup {
  title: string;
  items: SidebarLink[];
}

export const nav_groups: SidebarGroup[] = [
  { title: "Finance", items: [{ title: "Burn rate", href: "/burn", icon: Flame }] },
  { title: "Preferences", items: [{ title: "Settings", href: "/settings", icon: Settings }] },
];

export const workspaces = [
  { id: "wk_1", name: "Throxy Main", slug: "TM" },
  { id: "wk_2", name: "Growth Ops", slug: "GO" },
  { id: "wk_3", name: "Sandbox", slug: "SB" },
];

export const sidebar_info_card: { storage_key: string; title: string; description: string; media: { src: string; alt: string }[] } | null = null;

export const default_user = {
  name: "Admin",
  email: "admin@throxy.com",
};

