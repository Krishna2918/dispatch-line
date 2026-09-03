"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
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
import { IconChevron } from "./icons";

type MenuKey = "groups" | "assigned" | "read" | "status" | "tags";

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

function shortGroupName(name: string) {
  return name.replace(/\s+drivers$/i, "").trim() || name;
}

function groupsSummary(groups: ContactGroup[], selectedIds: string[]) {
  if (selectedIds.length === 0) return "All";
  if (selectedIds.length === 1) {
    const group = groups.find((row) => row.id === selectedIds[0]);
    return group ? shortGroupName(group.name) : "1";
  }
  return String(selectedIds.length);
}

function assignedSummary(
  assignmentFilter: AssignmentFilter,
  roster: Profile[],
  staff: Profile,
) {
  if (assignmentFilter === "all") return "All";
  if (assignmentFilter === "me") return "Me";
  if (assignmentFilter === "unassigned") return "Unassigned";
  if (assignmentFilter === staff.id) return "Me";
  const person = roster.find((row) => row.id === assignmentFilter);
  return person ? person.fullName.split(" ")[0] : "Desk";
}

function readSummary(readFilter: ReadFilter, dateFilter: DateFilter) {
  const read =
    readFilter === "unread" ? "Unread" : readFilter === "read" ? "Read" : null;
  const today = dateFilter === "today";
  if (read && today) return `${read} · Today`;
  if (read) return read;
  if (today) return "Today";
  return "Any";
}

function FilterTrigger({
  triggerId,
  listId,
  label,
  value,
  active,
  open,
  onToggle,
}: {
  triggerId: string;
  listId: string;
  label: string;
  value: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      id={triggerId}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      aria-label={`${label} filter`}
      onClick={onToggle}
      className={`lift inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
        active
          ? "border-amber/50 bg-amber/15 text-amber"
          : "border-line bg-board/70 text-muted hover:text-ink"
      }`}
    >
      <span className="min-w-0 truncate">
        {label}
        <span className={active ? "text-amber/70" : "text-muted"}> · </span>
        {value}
      </span>
      <IconChevron
        className={`size-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function FilterPanel({
  listId,
  triggerId,
  open,
  multiselectable = false,
  children,
}: {
  listId: string;
  triggerId: string;
  open: boolean;
  multiselectable?: boolean;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      id={listId}
      role="listbox"
      aria-labelledby={triggerId}
      aria-multiselectable={multiselectable || undefined}
      className="absolute top-full right-0 left-0 z-30 mt-1.5 rounded-[1.5rem] border border-line bg-panel p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
    >
      {children}
    </div>
  );
}

function MenuItem({
  selected,
  onClick,
  children,
  color,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-full px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] ${
        selected ? "bg-amber/12 text-amber" : "text-ink hover:bg-panel-raised"
      }`}
    >
      {color ? (
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      ) : (
        <span
          className={`size-2 shrink-0 rounded-full border ${
            selected ? "border-amber bg-amber" : "border-line-strong"
          }`}
          aria-hidden
        />
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
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
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const groupsId = useId();
  const groupsListId = useId();
  const assignedId = useId();
  const assignedListId = useId();
  const readId = useId();
  const readListId = useId();
  const statusId = useId();
  const statusListId = useId();
  const tagsId = useId();
  const tagsListId = useId();

  useEffect(() => {
    if (!openMenu) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const toggleMenu = (key: MenuKey) => {
    setOpenMenu((current) => (current === key ? null : key));
  };

  const close = () => setOpenMenu(null);

  const assignmentOptions: { value: AssignmentFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "me", label: "Assigned to me" },
    { value: "unassigned", label: "Unassigned" },
    ...roster
      .filter((person) => person.id !== staff.id)
      .map((person) => ({
        value: person.id,
        label: person.fullName.split(" ")[0],
      })),
  ];

  return (
    <div ref={rootRef} className="relative z-10 space-y-2">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Shared inbox
        </p>
        <p className="font-mono text-[11px] text-amber">
          {unreadTotal} unread · {visibleCount} shown
        </p>
      </div>

      <div className="relative">
        <div className="flex flex-wrap gap-1.5">
          <FilterTrigger
            triggerId={groupsId}
            listId={groupsListId}
            label="Groups"
            value={groupsSummary(groups, groupFilter)}
            active={groupFilter.length > 0}
            open={openMenu === "groups"}
            onToggle={() => toggleMenu("groups")}
          />
          <FilterTrigger
            triggerId={assignedId}
            listId={assignedListId}
            label="Assigned"
            value={assignedSummary(assignmentFilter, roster, staff)}
            active={assignmentFilter !== "all"}
            open={openMenu === "assigned"}
            onToggle={() => toggleMenu("assigned")}
          />
          <FilterTrigger
            triggerId={readId}
            listId={readListId}
            label="Read"
            value={readSummary(readFilter, dateFilter)}
            active={readFilter !== "all" || dateFilter !== "all"}
            open={openMenu === "read"}
            onToggle={() => toggleMenu("read")}
          />
          <FilterTrigger
            triggerId={statusId}
            listId={statusListId}
            label="Status"
            value={statusFilter === "all" ? "Any" : statusLabel(statusFilter)}
            active={statusFilter !== "all"}
            open={openMenu === "status"}
            onToggle={() => toggleMenu("status")}
          />
          {tags.length > 0 ? (
            <FilterTrigger
              triggerId={tagsId}
              listId={tagsListId}
              label="Tags"
              value={
                tagFilter
                  ? (tags.find((tag) => tag.id === tagFilter)?.name ?? "1")
                  : "All"
              }
              active={tagFilter !== null}
              open={openMenu === "tags"}
              onToggle={() => toggleMenu("tags")}
            />
          ) : null}
        </div>

        <FilterPanel
          listId={groupsListId}
          triggerId={groupsId}
          open={openMenu === "groups"}
          multiselectable
        >
          <MenuItem selected={groupFilter.length === 0} onClick={onClearGroups}>
            All groups
          </MenuItem>
          {groups.map((group) => (
            <MenuItem
              key={group.id}
              selected={groupFilter.includes(group.id)}
              color={group.color}
              onClick={() => onToggleGroup(group.id)}
            >
              {group.name}
            </MenuItem>
          ))}
        </FilterPanel>

        <FilterPanel listId={assignedListId} triggerId={assignedId} open={openMenu === "assigned"}>
          {assignmentOptions.map((option) => (
            <MenuItem
              key={option.value}
              selected={assignmentFilter === option.value}
              onClick={() => {
                const isNamedDesk =
                  option.value !== "all" &&
                  option.value !== "me" &&
                  option.value !== "unassigned";
                onAssignmentChange(
                  isNamedDesk && assignmentFilter === option.value
                    ? "all"
                    : option.value,
                );
                close();
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </FilterPanel>

        <FilterPanel listId={readListId} triggerId={readId} open={openMenu === "read"}>
          {(
            [
              ["all", "Any"],
              ["unread", "Unread"],
              ["read", "Read"],
            ] as const
          ).map(([value, label]) => (
            <MenuItem
              key={value}
              selected={readFilter === value}
              onClick={() => {
                onReadChange(value);
                close();
              }}
            >
              {label}
            </MenuItem>
          ))}
          <div className="my-1 border-t border-line" role="separator" />
          <MenuItem
            selected={dateFilter === "today"}
            onClick={() => {
              onDateChange(dateFilter === "today" ? "all" : "today");
              close();
            }}
          >
            Today
          </MenuItem>
        </FilterPanel>

        <FilterPanel listId={statusListId} triggerId={statusId} open={openMenu === "status"}>
          <MenuItem
            selected={statusFilter === "all"}
            onClick={() => {
              onStatusChange("all");
              close();
            }}
          >
            Any status
          </MenuItem>
          {WORKFLOW_STATUSES.map((status) => (
            <MenuItem
              key={status}
              selected={statusFilter === status}
              onClick={() => {
                onStatusChange(
                  statusFilter === status ? "all" : (status as WorkflowStatus),
                );
                close();
              }}
            >
              {statusLabel(status)}
            </MenuItem>
          ))}
        </FilterPanel>

        {tags.length > 0 ? (
          <FilterPanel listId={tagsListId} triggerId={tagsId} open={openMenu === "tags"}>
            <MenuItem
              selected={tagFilter === null}
              onClick={() => {
                onTagFilterChange(null);
                close();
              }}
            >
              Any tags
            </MenuItem>
            {tags.map((tag) => (
              <MenuItem
                key={tag.id}
                selected={tagFilter === tag.id}
                color={tag.color}
                onClick={() => {
                  onTagFilterChange(tagFilter === tag.id ? null : tag.id);
                  close();
                }}
              >
                {tag.name}
              </MenuItem>
            ))}
          </FilterPanel>
        ) : null}
      </div>

      {filtersActive ? (
        <button
          type="button"
          onClick={() => {
            close();
            onClear();
          }}
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
