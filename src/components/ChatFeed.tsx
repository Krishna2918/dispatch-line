"use client";

import { IconBack, IconBroadcast } from "@/components/icons";
import { formatPhone, initials } from "@/hooks/format";
import type { Driver, Message, Tag } from "@/lib/types";
import { TagChip } from "./TagChip";
import { MessageBubble } from "./MessageBubble";

type Props = {
  driver: Driver | null;
  tags?: Tag[];
  messages: Message[];
  onBack: () => void;
  onBroadcast: () => void;
};

export function ChatFeed({ driver, tags = [], messages, onBack, onBroadcast }: Props) {
  if (!driver) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="enter-up font-mono text-[11px] font-semibold tracking-[0.28em] text-amber uppercase">
          Dispatch board
        </p>
        <p
          className="enter-up mt-3 max-w-sm text-lg font-medium text-ink"
          style={{ "--enter-delay": "60ms" } as React.CSSProperties}
        >
          Select a driver thread
        </p>
        <p
          className="enter-up mt-2 max-w-sm text-sm text-muted"
          style={{ "--enter-delay": "110ms" } as React.CSSProperties}
        >
          Shared inbox — every dispatcher sees the same 1:1 SMS line. Notes stay on the desk.
        </p>
      </div>
    );
  }

  const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const shownTags = tags.length > 0 ? tags : driver.tags;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={onBack}
          className="lift rounded-full border border-line p-2 text-muted hover:text-ink md:hidden"
          aria-label="Back to threads"
        >
          <IconBack className="h-4 w-4" />
        </button>
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-board text-[11px] font-semibold"
          aria-hidden
        >
          {initials(driver.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{driver.fullName}</p>
          <p className="font-mono text-[11px] text-muted">{formatPhone(driver.phone)}</p>
        </div>
        <div className="hidden flex-wrap gap-1 sm:flex">
          {shownTags.map((tag) => (
            <TagChip key={tag.id} tag={tag} compact />
          ))}
        </div>
        <button
          type="button"
          onClick={onBroadcast}
          className="lift rounded-full border border-amber/50 p-2 text-amber hover:bg-amber/10 sm:hidden"
          aria-label="Mass broadcast"
        >
          <IconBroadcast className="h-4 w-4" />
        </button>
      </header>

      <div
        className="board-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 md:px-6"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={`Thread with ${driver.fullName}`}
      >
        {sorted.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">No traffic on this thread yet.</p>
        ) : (
          sorted.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              driverName={driver.fullName}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}
