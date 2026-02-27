"use client";

import * as React from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

const INFO_CARD_EVENT = "throxy:info-card";

function get_storage_value(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set_storage_value(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event(INFO_CARD_EVENT));
  } catch {
    // ignore storage failures
  }
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(INFO_CARD_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(INFO_CARD_EVENT, callback);
  };
}

function useDismissed(storage_key: string): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => get_storage_value(storage_key) === "dismissed",
    () => false,
  );
}

interface InfoCardContextValue {
  isHovered: boolean;
  dismiss: () => void;
}

const InfoCardContext = React.createContext<InfoCardContextValue | null>(null);

interface InfoCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  storageKey: string;
}

export function InfoCard({ storageKey, className, children, ...props }: InfoCardProps) {
  const dismissed = useDismissed(storageKey);
  const [is_hovered, set_is_hovered] = React.useState(false);

  const context_value = React.useMemo(
    () => ({
      isHovered: is_hovered,
      dismiss: () => set_storage_value(storageKey, "dismissed"),
    }),
    [is_hovered, storageKey],
  );

  return (
    <InfoCardContext.Provider value={context_value}>
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className={cn("rounded-none border bg-background p-3", className)}
            onMouseEnter={() => set_is_hovered(true)}
            onMouseLeave={() => set_is_hovered(false)}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </InfoCardContext.Provider>
  );
}

export function InfoCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 text-xs", className)} {...props} />;
}

export function InfoCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold tracking-tight", className)} {...props} />;
}

export function InfoCardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-relaxed text-muted-foreground", className)} {...props} />;
}

export function InfoCardFooter({ className, ...props }: Omit<HTMLMotionProps<"div">, "ref">) {
  const context = React.useContext(InfoCardContext);

  return (
    <motion.div
      className={cn("flex items-center", className)}
      initial={{ opacity: 0, height: "0px" }}
      animate={{
        opacity: context?.isHovered ? 1 : 0,
        height: context?.isHovered ? "auto" : "0px",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}
      {...props}
    />
  );
}

interface InfoCardMediaItem {
  src: string;
  alt: string;
}

interface InfoCardMediaProps {
  media: InfoCardMediaItem[];
  shrinkHeight?: number;
  expandHeight?: number;
}

export function InfoCardMedia({ media, shrinkHeight = 75, expandHeight = 150 }: InfoCardMediaProps) {
  const context = React.useContext(InfoCardContext);
  const is_hovered = context?.isHovered ?? false;
  const [is_overflow_visible, set_is_overflow_visible] = React.useState(false);
  const display_media = media.slice(0, 3);
  const count = display_media.length;

  React.useEffect(() => {
    let timeout_id: NodeJS.Timeout;
    if (is_hovered) {
      timeout_id = setTimeout(() => set_is_overflow_visible(true), 100);
    } else {
      set_is_overflow_visible(false);
    }
    return () => clearTimeout(timeout_id);
  }, [is_hovered]);

  if (display_media.length === 0) {
    return null;
  }

  const get_rotation = (index: number) => {
    if (!is_hovered || count === 1) return 0;
    return (index - (count === 2 ? 0.5 : 1)) * 5;
  };

  const get_translate_x = (index: number) => {
    if (!is_hovered || count === 1) return 0;
    return (index - (count === 2 ? 0.5 : 1)) * 20;
  };

  const get_translate_y = (index: number) => {
    if (!is_hovered) return 0;
    if (count === 1) return -5;
    return index === 0 ? -10 : index === 1 ? -5 : 0;
  };

  const get_scale = (index: number) => {
    if (!is_hovered) return 1;
    return count === 1 ? 1 : 0.95 + index * 0.02;
  };

  return (
    <motion.div
      className="relative mt-2 rounded-none"
      animate={{ height: is_hovered ? expandHeight : shrinkHeight }}
      style={{ overflow: is_overflow_visible ? "visible" : "hidden" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}
    >
      <div className="relative" style={{ height: shrinkHeight }}>
        {display_media.map((item, index) => (
          <motion.div
            key={item.src}
            className="absolute w-full"
            animate={{
              rotateZ: get_rotation(index),
              x: get_translate_x(index),
              y: get_translate_y(index),
              scale: get_scale(index),
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full rounded-none border object-cover shadow-lg"
            />
          </motion.div>
        ))}
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-background"
        animate={{ opacity: is_hovered ? 0 : 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      />
    </motion.div>
  );
}

export function InfoCardDismiss({ children }: { children: React.ReactNode }) {
  const context = React.useContext(InfoCardContext);

  if (!context) {
    throw new Error("InfoCardDismiss must be used within an InfoCard");
  }

  return (
    <div className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground" onClick={context.dismiss}>
      {children}
    </div>
  );
}
