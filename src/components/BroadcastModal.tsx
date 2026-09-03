"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { displayPhone } from "@/lib/phone";
import type { Driver, Tag } from "@/lib/types";
import { IconClose } from "./icons";
import { TagChip } from "./TagChip";

type BroadcastModalProps = {
  open: boolean;
  tags: Tag[];
  staffName: string;
  driversForTags: (tagIds: string[]) => Driver[];
  onClose: () => void;
  onSend: (tagIds: string[], body: string) => number | Promise<number>;
};

export function BroadcastModal({
  open,
  tags,
  staffName,
  driversForTags,
  onClose,
  onSend,
}: BroadcastModalProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  const targets = useMemo(
    () => driversForTags(selectedTags),
    [driversForTags, selectedTags],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedTags([]);
    setBody("");
    setSentCount(null);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const toggleTag = (id: string) => {
    setSelectedTags((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setSentCount(null);
  };

  const canSend = selectedTags.length > 0 && body.trim().length > 0 && !pending;

  return (
    <div className="overlay-in fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close broadcast"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="enter-scale relative z-10 w-full max-w-xl rounded-[3rem] border border-line bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">
              Mass SMS
            </p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold tracking-tight text-ink">
              Broadcast to tagged drivers
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lift rounded-full border border-line p-2 text-muted hover:text-ink"
            aria-label="Close"
          >
            <IconClose className="size-4" />
          </button>
        </header>

        <div className="board-scroll max-h-[70vh] overflow-y-auto px-5 py-2">
          <div
            className="mb-4 rounded-[1.75rem] border border-signal/40 bg-signal/10 px-4 py-3 text-[13px] leading-5 text-ink"
            role="note"
          >
            Replies come back as private 1:1 threads — not a group chat.
            Each driver gets their own SMS. They will not see who else got this.
          </div>

          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Select tags
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const count = driversForTags([tag.id]).length;
              return (
                <TagChip
                  key={tag.id}
                  tag={{ ...tag, name: `${tag.name} · ${count}` }}
                  size="md"
                  active={selectedTags.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                />
              );
            })}
          </div>

          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            {targets.length === 0
              ? "No drivers selected"
              : `${targets.length} driver${targets.length === 1 ? "" : "s"} will receive this SMS`}
          </p>
          {targets.length > 0 ? (
            <ul className="mb-4 max-h-32 overflow-y-auto rounded-[1.5rem] border border-line bg-board px-4 py-2.5 font-mono text-[12px] text-muted">
              {targets.map((driver) => (
                <li key={driver.id} className="flex justify-between gap-3 py-0.5">
                  <span className="text-ink">{driver.fullName}</span>
                  <span>{displayPhone(driver.phone)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <label className="sr-only" htmlFor="broadcast-body">
            Broadcast message
          </label>
          <textarea
            id="broadcast-body"
            ref={inputRef}
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              setSentCount(null);
            }}
            rows={4}
            placeholder="Yard closed at 1900. Do not deadhead to Chicago without a new load."
            className="w-full resize-none rounded-[1.5rem] border border-line bg-board px-4 py-3 text-[14px] leading-6 text-ink outline-none placeholder:text-muted/70 focus-visible:border-amber"
          />
          <p className="mt-2 font-mono text-[11px] text-muted">
            Sends as {staffName}. Drivers answer in their own thread.
          </p>
          {sentCount !== null ? (
            <p className="mt-2 font-mono text-[12px] text-ok" role="status">
              Sent {sentCount} SMS. Replies will land in each 1:1 inbox.
            </p>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="lift rounded-full border border-line px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-muted hover:text-ink"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!canSend}
            onClick={() => {
              setPending(true);
              void Promise.resolve(onSend(selectedTags, body))
                .then((count) => setSentCount(count))
                .finally(() => setPending(false));
            }}
            className="lift rounded-full bg-amber px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-board hover:bg-amber-hot disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Sending…" : `Send ${targets.length || ""} SMS`}
          </button>
        </footer>
      </div>
    </div>
  );
}
