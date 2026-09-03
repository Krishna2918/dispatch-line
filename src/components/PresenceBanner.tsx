"use client";

import type { PresenceEntry } from "@/lib/types";

type Props = {
  others: PresenceEntry[];
};

export function PresenceBanner({ others }: Props) {
  if (others.length === 0) return null;

  const unique = new Map<string, PresenceEntry>();
  for (const entry of others) {
    const current = unique.get(entry.staffId);
    if (!current || (entry.mode === "replying" && current.mode !== "replying")) {
      unique.set(entry.staffId, entry);
    }
  }
  const people = [...unique.values()];
  const replying = people.filter((entry) => entry.mode === "replying");
  const viewing = people.filter((entry) => entry.mode === "viewing");

  const names = (list: PresenceEntry[]) =>
    list.map((entry) => entry.staffName).join(", ");

  let text = "";
  if (replying.length > 0 && viewing.length > 0) {
    text = `${names(replying)} ${replying.length === 1 ? "is" : "are"} replying… · ${names(viewing)} viewing`;
  } else if (replying.length > 0) {
    text = `${names(replying)} ${replying.length === 1 ? "is" : "are"} replying…`;
  } else {
    text = `${names(viewing)} ${viewing.length === 1 ? "is" : "are"} viewing this conversation.`;
  }

  return (
    <div
      className="mx-4 mt-1 rounded-full border border-amber/35 bg-amber/10 px-4 py-2 font-mono text-[11px] tracking-[0.04em] text-amber"
      role="status"
      data-testid="presence-banner"
    >
      {text}
    </div>
  );
}
