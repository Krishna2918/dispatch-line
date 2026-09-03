"use client";

import { useEffect, useId, useRef, useState } from "react";
import { initials, roleLabel } from "@/hooks/format";
import type { Profile } from "@/lib/types";
import { IconChevron } from "./icons";

type Props = {
  staff: Profile;
  roster: Profile[];
  onSelect: (staff: Profile) => void;
};

export function DispatcherSwitcher({ staff, roster, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const activeIndex = Math.max(0, roster.findIndex((person) => person.id === staff.id));

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (person: Profile) => {
    onSelect(person);
    setOpen(false);
  };

  const move = (delta: number) => {
    if (roster.length === 0) {
      return;
    }
    const next = roster[(activeIndex + delta + roster.length) % roster.length];
    onSelect(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Logged in as ${staff.fullName}. Switch account.`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }
            move(1);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }
            move(-1);
          }
        }}
        className="lift flex items-center gap-2 rounded-full border border-line bg-board/70 py-1 pr-2.5 pl-1 text-left hover:border-amber/45"
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-amber/40 bg-amber/12 text-[11px] font-semibold tracking-wide text-amber"
          aria-hidden
        >
          {initials(staff.fullName)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-[13px] font-medium text-ink">{staff.fullName}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Signed in · {roleLabel(staff.role)}
          </span>
        </span>
        <IconChevron
          className={`size-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Staff accounts"
          className="absolute right-0 z-30 mt-2 w-64 rounded-[1.75rem] border border-line bg-panel p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
        >
          {roster.map((person) => {
            const selected = person.id === staff.id;
            return (
              <li key={person.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(person)}
                  className={`flex w-full items-center gap-3 rounded-full px-2 py-2 text-left ${
                    selected ? "bg-amber/12" : "hover:bg-panel-raised"
                  }`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                      selected
                        ? "border-amber/50 bg-amber/15 text-amber"
                        : "border-line bg-board text-ink"
                    }`}
                    aria-hidden
                  >
                    {initials(person.fullName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">
                      {person.fullName}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                      {roleLabel(person.role)}
                    </span>
                  </span>
                  {selected ? (
                    <span className="rounded-full border border-amber/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
                      Active
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
