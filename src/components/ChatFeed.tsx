"use client";

import { IconBack, IconBroadcast } from "@/components/icons";
import { formatPhone, initials, statusLabel } from "@/hooks/format";
import type { Driver, Message, PresenceEntry, Profile, WorkflowStatus } from "@/lib/types";
import { WORKFLOW_STATUSES } from "@/lib/types";
import { PresenceBanner } from "./PresenceBanner";
import { MessageBubble } from "./MessageBubble";

type Props = {
  driver: Driver | null;
  messages: Message[];
  roster: Profile[];
  assignedStaffId: string | null;
  status: WorkflowStatus | null;
  others: PresenceEntry[];
  canBroadcast: boolean;
  canEditWorkflow: boolean;
  onBack: () => void;
  onBroadcast: () => void;
  onAssign: (staffId: string | null) => void;
  onStatus: (status: WorkflowStatus) => void;
  onSimulateInbound: () => void;
};

export function ChatFeed({
  driver,
  messages,
  roster,
  assignedStaffId,
  status,
  others,
  canBroadcast,
  canEditWorkflow,
  onBack,
  onBroadcast,
  onAssign,
  onStatus,
  onSimulateInbound,
}: Props) {
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
          One shared inbox. Filters and assignment are views — never a private copy.
        </p>
      </div>
    );
  }

  const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-3 px-3 py-3">
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
          <p className="font-mono text-[11px] text-muted">
            {formatPhone(driver.phone)}
            {driver.truck ? ` · Truck ${driver.truck}` : ""}
            {driver.terminal ? ` · ${driver.terminal}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onSimulateInbound}
          className="lift rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:border-amber/40 hover:text-amber"
        >
          Simulate inbound
        </button>
        {canBroadcast ? (
          <button
            type="button"
            onClick={onBroadcast}
            className="lift rounded-full border border-amber/50 p-2 text-amber hover:bg-amber/10 sm:hidden"
            aria-label="Mass broadcast"
          >
            <IconBroadcast className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
        <label className="sr-only" htmlFor="thread-status">
          Workflow status
        </label>
        <select
          id="thread-status"
          value={status ?? "open"}
          disabled={!canEditWorkflow}
          onChange={(event) => onStatus(event.target.value as WorkflowStatus)}
          className="rounded-full border border-line bg-board px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink outline-none focus:border-amber disabled:opacity-60"
        >
          {WORKFLOW_STATUSES.map((value) => (
            <option key={value} value={value}>
              {statusLabel(value)}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="thread-assign">
          Assignment
        </label>
        <select
          id="thread-assign"
          value={assignedStaffId ?? ""}
          disabled={!canEditWorkflow}
          onChange={(event) => onAssign(event.target.value || null)}
          className="rounded-full border border-line bg-board px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink outline-none focus:border-amber disabled:opacity-60"
        >
          <option value="">Unassigned</option>
          {roster.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName}
            </option>
          ))}
        </select>
      </div>

      <PresenceBanner others={others} />

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
