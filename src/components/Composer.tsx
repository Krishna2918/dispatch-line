"use client";

import { useState } from "react";
import type { ComposerMode } from "@/hooks/useDemoInbox";
import type { Profile } from "@/lib/types";
import { IconNote, IconSms } from "./icons";

type ComposerProps = {
  mode?: ComposerMode;
  driverName: string | null;
  staffName?: string;
  staff?: Profile | null;
  error?: string | null;
  disabled?: boolean;
  sending?: boolean;
  onModeChange?: (mode: ComposerMode) => void;
  onSend: (body: string, kind?: "sms_out" | "internal_note") => boolean | void | Promise<boolean | void>;
};

export function Composer({
  mode = "sms",
  driverName,
  staffName,
  staff,
  error,
  disabled,
  sending,
  onModeChange,
  onSend,
}: ComposerProps) {
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const sms = mode === "sms";
  const name = staffName ?? staff?.fullName ?? staff?.name ?? "Desk";
  const blocked = disabled || sending || !driverName || draft.trim().length === 0;

  const submit = async () => {
    const text = draft.trim();
    if (!text || !driverName || disabled || sending) return;
    setLocalError(null);
    try {
      const ok = await onSend(text, sms ? "sms_out" : "internal_note");
      if (ok !== false) setDraft("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Send failed");
    }
  };

  return (
    <form
      className="px-3 pb-3 md:px-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div
        className={`composer-shell rounded-[3rem] border px-5 py-3.5 transition-[border-color,box-shadow] duration-200 ${
          sms ? "border-line bg-board/80" : "border-note/40 bg-note/8"
        }`}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div
            className="inline-flex rounded-full border border-line bg-panel p-1"
            role="group"
            aria-label="Message type"
          >
            <button
              type="button"
              onClick={() => onModeChange?.("sms")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                sms ? "bg-amber text-board" : "text-muted hover:text-ink"
              }`}
              aria-pressed={sms}
            >
              <IconSms className="h-3.5 w-3.5" />
              SMS to driver
            </button>
            <button
              type="button"
              onClick={() => onModeChange?.("note")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                !sms ? "bg-note text-board" : "text-muted hover:text-ink"
              }`}
              aria-pressed={!sms}
            >
              <IconNote className="h-3.5 w-3.5" />
              Internal note
            </button>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {sms ? `Sends as ${name} · native SMS` : `Staff only · ${name}`}
          </p>
        </div>

        <label className="sr-only" htmlFor="composer-body">
          {sms ? "SMS body" : "Internal note"}
        </label>
        <textarea
          id="composer-body"
          value={draft}
          disabled={disabled || sending}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={3}
          placeholder={
            sms
              ? driverName
                ? `Text ${driverName}…`
                : "Select a thread"
              : "Private note for the desk. Drivers never see this."
          }
          className={`w-full resize-none rounded-[2rem] border bg-panel px-5 py-3 text-[14px] leading-6 text-ink outline-none placeholder:text-muted/70 focus-visible:border-amber disabled:opacity-50 ${
            sms ? "border-line" : "border-note/40"
          }`}
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-muted">Ctrl+Enter to send</p>
          <button
            type="submit"
            disabled={blocked}
            className={`lift rounded-full px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-40 ${
              sms ? "bg-amber text-board hover:bg-amber-hot" : "bg-note text-board hover:brightness-110"
            }`}
          >
            {sending ? "Sending" : sms ? "Send SMS" : "Post note"}
          </button>
        </div>
        {error || localError ? (
          <p className="mt-2 font-mono text-[11px] text-signal" role="alert">
            {error ?? localError}
          </p>
        ) : null}
      </div>
    </form>
  );
}
