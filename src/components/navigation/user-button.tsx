"use client";

import { useMemo } from "react";
import { Settings, UserRound } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/client";
import { getUserRole } from "@/lib/auth/roles";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (!first) return "U";
  if (!last || parts.length === 1) return first.charAt(0).toUpperCase();

  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export function UserButton() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" || isMobile;
  const { data: session } = authClient.useSession();

  const userName = useMemo(() => {
    return session?.user.name || session?.user.email || "User";
  }, [session?.user.email, session?.user.name]);

  const userEmail = session?.user.email || "Not signed in";
  const role = getUserRole(session?.user);

  if (!session?.user) {
    return <GoogleSignInButton callbackURL="/" className="h-8 w-full rounded-none px-2 text-xs" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-ring">
          <Avatar className="h-6 w-6 rounded-none bg-primary text-xs text-primary-foreground">
            <AvatarFallback className="rounded-none bg-inherit text-inherit">{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-none"
        side={isCollapsed ? "right" : "top"}
        align="end"
        sideOffset={4}
        alignOffset={4}
      >
        <DropdownMenuLabel className="space-y-0.5 font-normal">
          <p className="truncate text-muted-foreground">{userEmail}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{role}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-default gap-2">
          <UserRound className="size-4" />
          {userName}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-default gap-2">
          <Settings className="size-4" />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0 focus:bg-transparent">
          <SignOutButton className="h-8 w-full justify-start rounded-none border-0 px-2 text-xs" variant="ghost" size="sm" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
