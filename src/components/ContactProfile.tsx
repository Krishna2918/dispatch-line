"use client";

import { useEffect, useState } from "react";
import { formatPhone, statusLabel } from "@/hooks/format";
import type { ActivityEvent, ContactGroup, Driver, Profile } from "@/lib/types";
import { TagChip } from "./TagChip";

type Props = {
  driver: Driver;
  groups: ContactGroup[];
  roster: Profile[];
  assignedStaffId: string | null;
  status: string;
  canEdit: boolean;
  canViewActivity: boolean;
  activity: ActivityEvent[];
  onUpdate: (patch: {
    fullName?: string;
    driverCode?: string;
    truck?: string;
    terminal?: string;
    notes?: string;
  }) => void;
  onGroupsChange: (groupIds: string[]) => void;
};

function Field({
  label,
  value,
  disabled,
  onSave,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onSave: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <input
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft.trim() !== value) onSave(draft.trim());
        }}
        className="w-full rounded-full border border-line bg-board px-3.5 py-2 text-[13px] text-ink outline-none focus:border-amber disabled:opacity-70"
      />
    </label>
  );
}

export function ContactProfile({
  driver,
  groups,
  roster,
  assignedStaffId,
  status,
  canEdit,
  canViewActivity,
  activity,
  onUpdate,
  onGroupsChange,
}: Props) {
  const assignee = roster.find((person) => person.id === assignedStaffId);

  const toggleGroup = (groupId: string) => {
    if (!canEdit) return;
    const next = driver.groupIds.includes(groupId)
      ? driver.groupIds.filter((id) => id !== groupId)
      : [...driver.groupIds, groupId];
    onGroupsChange(next);
  };

  return (
    <aside className="board-scroll flex h-full min-h-0 w-full flex-col overflow-y-auto bg-panel px-4 py-4 xl:w-[20.5rem]">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber">Contact</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">{driver.fullName}</h2>
      <p className="mt-1 font-mono text-[12px] text-muted">{formatPhone(driver.phone)}</p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {statusLabel(status)}
        {assignee ? ` · ${assignee.fullName}` : " · Unassigned"}
      </p>

      <div className="mt-4 space-y-3">
        <Field
          label="Name"
          value={driver.fullName}
          disabled={!canEdit}
          onSave={(fullName) => onUpdate({ fullName })}
        />
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Phone
          </span>
          <p className="rounded-full border border-line bg-board/60 px-3.5 py-2 font-mono text-[13px] text-muted">
            {formatPhone(driver.phone)}
          </p>
        </label>
        <Field
          label="Driver ID"
          value={driver.driverCode}
          disabled={!canEdit}
          onSave={(driverCode) => onUpdate({ driverCode })}
        />
        <Field
          label="Truck"
          value={driver.truck}
          disabled={!canEdit}
          onSave={(truck) => onUpdate({ truck })}
        />
        <Field
          label="Terminal"
          value={driver.terminal}
          disabled={!canEdit}
          onSave={(terminal) => onUpdate({ terminal })}
        />
      </div>

      <div className="mt-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Groups {canEdit ? "· tap to add or remove" : "· view only"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {groups.map((group) => (
            <TagChip
              key={group.id}
              tag={group}
              compact
              active={driver.groupIds.includes(group.id)}
              onClick={canEdit ? () => toggleGroup(group.id) : undefined}
            />
          ))}
        </div>
      </div>

      {driver.notes ? (
        <div className="mt-5">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Desk notes
          </p>
          <p className="rounded-[1.5rem] border border-line bg-board/70 px-4 py-3 text-[13px] leading-5 text-muted">
            {driver.notes}
          </p>
        </div>
      ) : null}

      {canViewActivity ? (
        <div className="mt-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
            Activity
          </p>
          {activity.length === 0 ? (
            <p className="text-[12px] text-muted">No assignment, group, or status changes yet.</p>
          ) : (
            <ol className="space-y-2">
              {activity.slice(0, 12).map((event) => (
                <li
                  key={event.id}
                  className="rounded-[1.25rem] border border-line bg-board/60 px-3 py-2"
                >
                  <p className="text-[12px] text-ink">{event.detail}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {event.staffName}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}
    </aside>
  );
}
