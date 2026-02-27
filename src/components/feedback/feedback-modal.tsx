"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Category = "bug" | "feature_request";

type Priority = "low" | "medium" | "high" | "critical";

function build_mailto_url(payload: { category: Category; priority: Priority; message: string }): string {
  const subject = encodeURIComponent("Feedback (" + payload.category + ", " + payload.priority + ")");
  const body = encodeURIComponent(payload.message);

  return "mailto:feedback@throxy.com?subject=" + subject + "&body=" + body;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [category, set_category] = useState<Category | "">("");
  const [priority, set_priority] = useState<Priority | "">("");
  const [message, set_message] = useState("");

  const can_submit = useMemo(() => Boolean(category && priority && message.trim().length > 0), [category, priority, message]);

  const reset_form = () => {
    set_category("");
    set_priority("");
    set_message("");
  };

  const handle_open_change = (next_open: boolean) => {
    if (!next_open) {
      reset_form();
    }
    onOpenChange(next_open);
  };

  const handle_submit = () => {
    if (!can_submit) {
      return;
    }

    const href = build_mailto_url({
      category: category as Category,
      priority: priority as Priority,
      message: message.trim(),
    });

    window.location.href = href;
    handle_open_change(false);
  };

  return (
    <Dialog open={open} onOpenChange={handle_open_change}>
      <DialogContent className="sm:max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            This starter ships with a simple feedback modal. Replace the mailto behavior with your in-app feedback flow
            when ready.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => set_category(value as Category)}>
              <SelectTrigger id="category" className="rounded-none">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug report</SelectItem>
                <SelectItem value="feature_request">Feature request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => set_priority(value as Priority)}>
              <SelectTrigger id="priority" className="rounded-none">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => {
                set_message(event.target.value);
              }}
              placeholder={
                category === "bug"
                  ? "Describe what happened, what you expected, and steps to reproduce..."
                  : category === "feature_request"
                  ? "Describe the feature you want and why it helps..."
                  : "Describe your feedback..."
              }
              className="min-h-28 resize-none rounded-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-none" onClick={() => handle_open_change(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-none" onClick={handle_submit} disabled={!can_submit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
