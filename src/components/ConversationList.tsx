"use client";

import { formatPhone, formatRelativeTime, initials } from "@/hooks/format";
import type { ThreadRow } from "@/hooks/useDemoInbox";
import type { Tag } from "@/lib/types";
import { IconSearch } from "@/components/icons";
import { TagChip } from "@/components/TagChip";

type Props = {
  rows: ThreadRow[];
  tags: Tag[];
  selectedId: string;
  search: string;
  tagFilter: string | null;
  unreadTotal: number;
  now: number;
  onSearchChange: (value: string) => void;
  onTagFilterChange: (tagId: string | null) => void;
  onSelect: (conversationId: string) => void;
};

export function ConversationList({
  rows,
  tags,
  selectedId,
  search,
  tagFilter,
  unreadTotal,
  now,
  onSearchChange,
  onTagFilterChange,
  onSelect,
}: Props) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-panel md:w-[22rem]">
      <div className="px-3 py-3">
        <div className="flex items-baseline justify-between gap-2 px-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Threads</p>
          <p className="font-mono text-[11px] text-amber">{unreadTotal} unread</p>
        </div>
        <label className="relative mt-2 block">
          <span className="sr-only">Search conversations</span>
          <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="thread-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search drivers, tags, phone"
            className="w-full rounded-full border border-line bg-board py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-muted outline-none focus:border-amber"
          />
        </label>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onTagFilterChange(null)}
            className={`lift chip-pop rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
              tagFilter === null
                ? "border-amber/50 bg-amber/15 text-amber"
                : "border-line text-muted hover:text-ink"
            }`}
          >
            All
          </button>
          {tags.map((tag, index) => (
            <span
              key={tag.id}
              className="chip-pop"
              style={{ "--enter-delay": `${40 + index * 35}ms` } as React.CSSProperties}
            >
              <TagChip
                tag={tag}
                compact
                active={tagFilter === tag.id}
                onClick={() => onTagFilterChange(tagFilter === tag.id ? null : tag.id)}
              />
            </span>
          ))}
        </div>
      </div>

      <ul className="board-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2 pb-3" role="listbox" aria-label="Conversations">
        {rows.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted">No threads match.</li>
        ) : (
          rows.map(({ conversation, driver, tags: rowTags }, index) => {
            const selected = conversation.id === selectedId;
            const unread = conversation.unreadCount;
            const preview = conversation.lastMessagePreview ?? "";
            const at = conversation.lastMessageAt;
            const recent = at ? now - new Date(at).getTime() < 120_000 : false;
            return (
              <li
                key={conversation.id}
                className="enter-up"
                style={{ "--enter-delay": `${Math.min(index, 10) * 40}ms` } as React.CSSProperties}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onSelect(conversation.id)}
                  className={`lift flex w-full gap-3 rounded-full border px-3.5 py-3 text-left ${
                    selected
                      ? "border-amber/40 bg-panel-raised"
                      : "border-transparent hover:border-line hover:bg-panel-raised/70"
                  }`}
                >
                  <span
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-board text-xs font-semibold tracking-wide"
                    aria-hidden
                  >
                    {initials(driver.fullName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${unread ? "font-semibold" : "font-medium"}`}>
                        {driver.fullName}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-muted tabular-nums">
                        <span
                          className={`size-1 rounded-full ${
                            recent ? "live-tick bg-ok" : "bg-line-strong"
                          }`}
                          aria-hidden
                        />
                        {at ? formatRelativeTime(at, now) : ""}
                      </span>
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted">
                      {formatPhone(driver.phone)}
                    </span>
                    <span className={`mt-1 block truncate text-xs ${unread ? "text-ink" : "text-muted"}`}>
                      {preview || "No messages yet"}
                    </span>
                    {rowTags.length > 0 ? (
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {rowTags.map((tag) => (
                          <TagChip key={tag.id} tag={tag} compact />
                        ))}
                      </span>
                    ) : null}
                  </span>
                  {unread > 0 ? (
                    <span className="unread-pulse mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber px-1.5 text-center text-[10px] font-bold text-board tabular-nums">
                      {unread}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
