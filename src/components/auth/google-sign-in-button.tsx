"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth/client";

interface GoogleSignInButtonProps {
  callbackURL?: string;
  className?: string;
}

export function GoogleSignInButton({ callbackURL = "/", className }: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = async () => {
    setIsPending(true);

    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    setIsPending(false);
  };

  return (
    <button
      className={["inline-flex h-9 items-center gap-2 rounded-none border border-transparent bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50", className]
        .filter(Boolean)
        .join(" ")}
      onClick={handleSignIn}
      disabled={isPending}
      type="button"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
      Continue with Google
    </button>
  );
}
