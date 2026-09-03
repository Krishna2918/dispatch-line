"use client";

import { useEffect, useId, useState } from "react";
import type { ContactGroup } from "@/lib/types";
import { IconClose } from "./icons";
import { TagChip } from "./TagChip";

const PALETTE = ["#3d7ea6", "#c45c26", "#7cb87a", "#e0703a", "#c9a227", "#8eb6d4", "#e24b2c"];

type Props = {
  open: boolean;
  groups: ContactGroup[];
  onClose: () => void;
  onCreate: (name: string, color: string) => Promise<void> | void;
  onRename: (groupId: string, name: string) => Promise<void> | void;
};

export function GroupManager({ open, groups, onClose, onCreate, onRename }: Props) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setEditingId(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay-in fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close groups" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="enter-scale relative z-10 w-full max-w-lg rounded-[3rem] border border-line bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Admin</p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold tracking-tight text-ink">
              Contact groups
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

        <div className="board-scroll max-h-[70vh] space-y-4 overflow-y-auto px-5 pb-5">
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              void onCreate(name.trim(), color);
              setName("");
            }}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New group name"
              className="min-w-0 flex-1 rounded-full border border-line bg-board px-4 py-2 text-sm text-ink outline-none focus:border-amber"
            />
            <div className="flex gap-1">
              {PALETTE.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className={`size-6 rounded-full border ${color === swatch ? "border-ink" : "border-transparent"}`}
                  style={{ background: swatch }}
                  aria-label={`Color ${swatch}`}
                />
              ))}
            </div>
            <button
              type="submit"
              className="lift rounded-full bg-amber px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-board"
            >
              Add group
            </button>
          </form>

          <ul className="space-y-2">
            {groups.map((group) => (
              <li key={group.id} className="flex items-center gap-2 rounded-full border border-line bg-board/70 px-3 py-2">
                <TagChip tag={group} compact />
                {editingId === group.id ? (
                  <form
                    className="flex min-w-0 flex-1 items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (editName.trim()) void onRename(group.id, editName.trim());
                      setEditingId(null);
                    }}
                  >
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="min-w-0 flex-1 rounded-full border border-line bg-panel px-3 py-1 text-sm outline-none focus:border-amber"
                    />
                    <button type="submit" className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
                      Save
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(group.id);
                      setEditName(group.name);
                    }}
                    className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                  >
                    Rename
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
