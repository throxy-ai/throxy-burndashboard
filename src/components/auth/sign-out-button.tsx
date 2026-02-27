"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";

interface SignOutButtonProps {
  className?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SignOutButton({ className, variant = "outline", size = "default" }: SignOutButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsPending(true);
    await authClient.signOut();
    router.refresh();
    setIsPending(false);
  };

  const baseClasses =
    "inline-flex items-center gap-2 rounded-none border px-3 text-sm font-medium transition-colors disabled:opacity-50";
  const variantClasses =
    variant === "ghost"
      ? "border-transparent bg-transparent text-foreground hover:bg-muted"
      : "border-border bg-background text-foreground hover:bg-muted";
  const sizeClasses = size === "sm" ? "h-8 px-2 text-xs" : size === "lg" ? "h-10 px-4" : "h-9 px-3";

  return (
    <button
      className={[baseClasses, variantClasses, sizeClasses, className].filter(Boolean).join(" ")}
      onClick={handleSignOut}
      disabled={isPending}
      type="button"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sign out
    </button>
  );
}
