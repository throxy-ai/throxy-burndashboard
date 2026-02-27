"use client";

import Image from "next/image";
import Link from "next/link";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavLogo() {
  const { state } = useSidebar();
  const is_collapsed = state === "collapsed";

  return (
    <Link href="/" className="flex w-full items-center justify-center py-1">
      <div className={cn("relative h-6 w-6 overflow-hidden bg-neutral-800", !is_collapsed && "hidden")}>
        <Image src="/throxy-white.svg" alt="Throxy" className="object-contain" fill priority />
      </div>
      <div className={cn("relative h-8 w-full", is_collapsed && "hidden")}>
        <Image src="/Logo_Dark.svg" alt="Throxy" className="object-contain object-left px-2" fill priority />
      </div>
    </Link>
  );
}
