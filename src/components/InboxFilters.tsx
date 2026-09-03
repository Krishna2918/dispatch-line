"use client";

import { statusLabel } from "@/hooks/format";
import type {
  AssignmentFilter,
  ContactGroup,
  DateFilter,
  Profile,
  ReadFilter,
  StatusFilter,
  Tag,
  WorkflowStatus,
} from "@/lib/types";
import { WORKFLOW_STATUSES } from "@/lib/types";
import { TagChip } from "./TagChip";

type Props = {
  groups: ContactGroup[];
  tags: Tag[];
  roster: Profile[];
  staff: Profile;
  groupFilter: string[];
  tagFilter: string | null;
  assignmentFilter: AssignmentFilter;
  readFilter: ReadFilter;
  statusFilter: StatusFilter;
  dateFilter: DateFilter;
  filtersActive: boolean;
  unreadTotal: number;
  visibleCount: number;
  onToggleGroup: (groupId: string) => void;
  onTagFilterChange: (tagId: string | null) => void;
  onAssignmentChange: (value: AssignmentFilter) => void;
  onReadChange: (value: ReadFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  onDateChange: (value: DateFilter) => void;
  onClear: () => void;
  onClearGroups: () => void;
};

function pill(active: boolean) {
  return `lift rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
    active
      ? "border-amber/50 bg-amber/15 text-amber"
      : "border-line text-muted hover:text-ink"
  }`;
}

export function InboxFilters({
  groups,
  tags,
  roster,
  staff,
  groupFilter,
  tagFilter,
  assignmentFilter,
  readFilter,
  statusFilter,
  dateFilter,
  filtersActive,
  unreadTotal,
  visibleCount,
  onToggleGroup,
  onTagFilterChange,
  onAssignmentChange,
  onReadChange,
  onStatusChange,
  onDateChange,
  onClear,
  onClearGroups,
}: Props) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Shared inbox
        </p>
        <p className="font-mono text-[11px] text-amber">
          {unreadTotal} unread · {visibleCount} shown
        </p>
      </div>

      <div>
        <p className="mb-1.5 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Groups
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={onClearGroups}
            className={pill(groupFilter.length === 0)}
          >
            All groups
          </button>
          {groups.map((group, index) => (
            <span
              key={group.id}
              className="chip-pop"
              style={{ "--enter-delay": `${40 + index * 25}ms` } as React.CSSProperties}
            >
              <TagChip
                tag={group}
                compact
                active={groupFilter.includes(group.id)}
                onClick={() => onToggleGroup(group.id)}
              />
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Assigned
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "All"],
              ["me", "Assigned to me"],
              ["unassigned", "Unassigned"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onAssignmentChange(value)}
              className={pill(assignmentFilter === value)}
            >
              {label}
            </button>
          ))}
          {roster
            .filter((person) => person.id !== staff.id)
            .map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() =>
                  onAssignmentChange(assignmentFilter === person.id ? "all" : person.id)
                }
                className={pill(assignmentFilter === person.id)}
              >
                {person.fullName.split(" ")[0]}
              </button>
            ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
              ["all", "Any"],
            ["unread", "Unread"],
            ["read", "Read"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onReadChange(value)}
            className={pill(readFilter === value)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onDateChange(dateFilter === "today" ? "all" : "today")}
          className={pill(dateFilter === "today")}
        >
          Today
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onStatusChange("all")}
          className={pill(statusFilter === "all")}
        >
          Any status
        </button>
        {WORKFLOW_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() =>
              onStatusChange(statusFilter === status ? "all" : (status as WorkflowStatus))
            }
            className={pill(statusFilter === status)}
          >
            {statusLabel(status)}
          </button>
        ))}
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              compact
              active={tagFilter === tag.id}
              onClick={() => onTagFilterChange(tagFilter === tag.id ? null : tag.id)}
            />
          ))}
        </div>
      ) : null}

      {filtersActive ? (
        <button
          type="button"
          onClick={onClear}
          className="lift rounded-full border border-amber/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber hover:bg-amber/10"
        >
          Clear filters · full inbox
        </button>
      ) : (
        <p className="px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          Filters are views — one shared desk
        </p>
      )}
    </div>
  );
}
