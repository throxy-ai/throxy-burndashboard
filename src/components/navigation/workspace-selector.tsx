"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceSelectorProps {
  value: string | null;
  on_change: (workspace_id: string) => void;
  workspaces: WorkspaceItem[];
  disabled?: boolean;
  trigger?: ReactNode;
  popover_side?: "top" | "bottom" | "left" | "right";
  popover_align?: "start" | "center" | "end";
  popover_side_offset?: number;
  popover_align_offset?: number;
  search_position?: "top" | "bottom";
}

export function WorkspaceSelector({
  value,
  on_change,
  workspaces,
  disabled = false,
  trigger,
  popover_side = "bottom",
  popover_align = "start",
  popover_side_offset,
  popover_align_offset,
  search_position = "top",
}: WorkspaceSelectorProps) {
  const [open, set_open] = useState(false);
  const [search_value, set_search_value] = useState("");
  const [highlighted_index, set_highlighted_index] = useState(-1);
  const search_input_ref = useRef<HTMLInputElement>(null);
  const item_refs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const filtered_workspaces = useMemo(() => {
    if (!search_value.trim()) return workspaces;
    const search_lower = search_value.toLowerCase();
    return workspaces.filter(
      (w) => w.name.toLowerCase().includes(search_lower) || w.id.toLowerCase().includes(search_lower),
    );
  }, [workspaces, search_value]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => search_input_ref.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (highlighted_index >= 0) {
      item_refs.current.get(highlighted_index)?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted_index]);

  const handle_key_down = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const max_index = filtered_workspaces.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        set_highlighted_index((prev) => (prev < max_index ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        set_highlighted_index((prev) => (prev > 0 ? prev - 1 : max_index));
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted_index >= 0 && filtered_workspaces[highlighted_index]) {
          on_change(filtered_workspaces[highlighted_index].id);
          set_open(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        set_open(false);
        break;
    }
  };

  const handle_select = (workspace_id: string) => {
    on_change(workspace_id);
    set_open(false);
  };

  const handle_open_change = (next_open: boolean) => {
    set_open(next_open);

    if (!next_open) {
      set_highlighted_index(-1);
      set_search_value("");
    }
  };

  const search_input = (
    <div className="flex items-center gap-2 px-3">
      <Search className="h-4 w-4 shrink-0 opacity-50" />
      <input
        ref={search_input_ref}
        type="text"
        placeholder="Search workspaces..."
        value={search_value}
        onChange={(e) => {
          set_search_value(e.target.value);
          set_highlighted_index(-1);
        }}
        onKeyDown={handle_key_down}
        className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );

  return (
    <Popover open={open} onOpenChange={handle_open_change}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-56 rounded-none p-0"
        side={popover_side}
        align={popover_align}
        sideOffset={popover_side_offset}
        alignOffset={popover_align_offset}
      >
        <div className="flex max-h-64 flex-col">
          {search_position === "top" && <div className="border-b">{search_input}</div>}
          <div className="flex-1 overflow-y-auto">
            {filtered_workspaces.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">No workspace found.</div>
            ) : (
              filtered_workspaces.map((workspace, index) => (
                <button
                  key={workspace.id}
                  ref={(el) => {
                    if (el) item_refs.current.set(index, el);
                    else item_refs.current.delete(index);
                  }}
                  onClick={() => handle_select(workspace.id)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left text-sm outline-none hover:bg-accent disabled:cursor-wait disabled:opacity-50",
                    workspace.id === value && "bg-accent",
                    index === highlighted_index && "bg-accent",
                  )}
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-muted text-[10px] font-semibold uppercase">
                    {workspace.slug}
                  </span>
                  <span className="flex-1 truncate">{workspace.name}</span>
                  {workspace.id === value && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))
            )}
          </div>
          {search_position === "bottom" && <div className="border-t">{search_input}</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
