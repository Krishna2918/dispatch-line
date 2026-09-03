"use client";

import { formatPhone, formatRelativeTime, initials, statusLabel } from "@/hooks/format";
import type { ThreadRow } from "@/hooks/useDemoInbox";
import type {
  AssignmentFilter,
  ContactGroup,
  DateFilter,
  Profile,
  ReadFilter,
  StatusFilter,
  Tag,
} from "@/lib/types";
import { IconSearch } from "@/components/icons";
import { InboxFilters } from "@/components/InboxFilters";
import { TagChip } from "@/components/TagChip";

type Props = {
  rows: ThreadRow[];
  tags: Tag[];
  groups: ContactGroup[];
  roster: Profile[];
  staff: Profile;
  selectedId: string;
  search: string;
  groupFilter: string[];
  tagFilter: string | null;
  assignmentFilter: AssignmentFilter;
  readFilter: ReadFilter;
  statusFilter: StatusFilter;
  dateFilter: DateFilter;
  filtersActive: boolean;
  unreadTotal: number;
  now: number;
  onSearchChange: (value: string) => void;
  onToggleGroup: (groupId: string) => void;
  onTagFilterChange: (tagId: string | null) => void;
  onAssignmentChange: (value: AssignmentFilter) => void;
  onReadChange: (value: ReadFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  onDateChange: (value: DateFilter) => void;
  onClearFilters: () => void;
  onClearGroups: () => void;
  onSelect: (conversationId: string) => void;
};

export function ConversationList({
  rows,
  tags,
  groups,
  roster,
  staff,
  selectedId,
  search,
  groupFilter,
  tagFilter,
  assignmentFilter,
  readFilter,
  statusFilter,
  dateFilter,
  filtersActive,
  unreadTotal,
  now,
  onSearchChange,
  onToggleGroup,
  onTagFilterChange,
  onAssignmentChange,
  onReadChange,
  onStatusChange,
  onDateChange,
  onClearFilters,
  onClearGroups,
  onSelect,
}: Props) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-panel md:w-[24.5rem]">
      <div className="px-3 py-3">
        <label className="relative block">
          <span className="sr-only">Search conversations</span>
          <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="thread-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, phone, truck"
            className="w-full rounded-full border border-line bg-board py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-muted outline-none focus:border-amber"
          />
        </label>
        <div className="mt-3">
          <InboxFilters
            groups={groups}
            tags={tags}
            roster={roster}
            staff={staff}
            groupFilter={groupFilter}
            tagFilter={tagFilter}
            assignmentFilter={assignmentFilter}
            readFilter={readFilter}
            statusFilter={statusFilter}
            dateFilter={dateFilter}
            filtersActive={filtersActive}
            unreadTotal={unreadTotal}
            visibleCount={rows.length}
            onToggleGroup={onToggleGroup}
            onTagFilterChange={onTagFilterChange}
            onAssignmentChange={onAssignmentChange}
            onReadChange={onReadChange}
            onStatusChange={onStatusChange}
            onDateChange={onDateChange}
            onClear={onClearFilters}
            onClearGroups={onClearGroups}
          />
        </div>
      </div>

      <ul className="board-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2 pb-3" role="listbox" aria-label="Conversations">
        {rows.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted">
            No threads match this view. Clear filters to see the full shared inbox.
          </li>
        ) : (
          rows.map(({ conversation, driver, tags: rowTags, groups: rowGroups }, index) => {
            const selected = conversation.id === selectedId;
            const unread = conversation.unreadCount;
            const preview = conversation.lastMessagePreview ?? "";
            const at = conversation.lastMessageAt;
            const recent = at ? now - new Date(at).getTime() < 120_000 : false;
            const assignee = roster.find((person) => person.id === conversation.assignedStaffId);
            const chips = rowGroups.length > 0 ? rowGroups : rowTags;
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
                  className={`lift flex w-full gap-3 rounded-[1.75rem] border px-3.5 py-3 text-left ${
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
                      {driver.truck ? ` · Truck ${driver.truck}` : ""}
                    </span>
                    <span className={`mt-1 block truncate text-xs ${unread ? "text-ink" : "text-muted"}`}>
                      {preview || "No messages yet"}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="rounded-full border border-line px-2 py-px font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                        {statusLabel(conversation.status)}
                      </span>
                      {assignee ? (
                        <span className="rounded-full border border-amber/30 px-2 py-px font-mono text-[10px] uppercase tracking-[0.1em] text-amber">
                          {assignee.fullName.split(" ")[0]}
                        </span>
                      ) : (
                        <span className="rounded-full border border-line px-2 py-px font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                          Unassigned
                        </span>
                      )}
                      {chips.map((chip) => (
                        <TagChip key={chip.id} tag={chip} compact />
                      ))}
                    </span>
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
