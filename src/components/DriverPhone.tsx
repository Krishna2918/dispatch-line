"use client";

import { useEffect, useRef } from "react";
import {
  businessPhonePlaceholder,
  companyAvatarPlaceholder,
  companyLineFullPlaceholder,
  companyNamePlaceholder,
} from "@/lib/placeholders";
import type { Message } from "@/lib/types";

export const JOHN_STORY_CHIP =
  "Truck 125 is at the customer. They are saying the load isn't ready.";

type DriverPhoneProps = {
  messages: Message[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  clock: string;
};

function bubbleTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function dayLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function shouldShowStamp(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const prev = Date.parse(messages[index - 1].createdAt);
  const next = Date.parse(messages[index].createdAt);
  return !Number.isFinite(prev) || !Number.isFinite(next) || next - prev > 12 * 60 * 1000;
}

export function DriverPhone({
  messages,
  draft,
  onDraftChange,
  onSend,
  clock,
}: DriverPhoneProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages.length, messages.at(-1)?.id]);

  const submit = () => {
    onSend();
    field.current?.focus();
  };

  return (
    <section
      className="relative mx-auto flex h-[min(48rem,calc(100dvh-7.5rem))] w-full max-w-[24.5rem] flex-col overflow-hidden rounded-[2.55rem] bg-black shadow-[0_30px_80px_-24px_rgba(0,0,0,0.85)]"
      aria-label={`Messages with ${companyNamePlaceholder}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[2.55rem] ring-[10px] ring-[#1b1c20]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[10px] rounded-[2.05rem] ring-1 ring-white/10"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[2.05rem] bg-[#f2f2f7] text-[#1c1c1e]">
        <header className="shrink-0 bg-white/92 px-4 pb-2.5 pt-2 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between px-1 font-medium text-[11px] text-[#1c1c1e]">
            <span className="tabular-nums">{clock}</span>
            <span
              className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black"
              aria-hidden
            />
            <span className="flex items-center gap-1.5 text-[10px]" aria-hidden>
              <span className="inline-block h-2 w-3.5 rounded-[1px] border border-current">
                <span className="ml-px mt-px block h-1.5 w-2.5 bg-current" />
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1d4f7a] text-[13px] font-semibold tracking-wide text-white"
              aria-hidden
            >
              {companyAvatarPlaceholder}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold leading-5 tracking-tight">
                {companyNamePlaceholder}
              </p>
              <p className="truncate text-[12px] text-[#6e6e73]">
                {companyLineFullPlaceholder} · {businessPhonePlaceholder}
              </p>
            </div>
          </div>
        </header>

        <div
          ref={scroller}
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3"
          role="log"
          aria-live="polite"
          aria-label={`Texts with ${companyNamePlaceholder}`}
        >
          {messages.length === 0 ? (
            <p className="px-6 py-16 text-center text-[13px] text-[#8e8e93]">
              No texts yet. Dispatch shows up as {companyNamePlaceholder}.
            </p>
          ) : (
            messages.map((message, index) => {
              const mine = message.kind === "sms_in";
              return (
                <div key={message.id}>
                  {shouldShowStamp(messages, index) ? (
                    <p className="py-2 text-center text-[11px] font-medium text-[#8e8e93]">
                      {dayLabel(message.createdAt)}
                    </p>
                  ) : null}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-[1.35rem] px-3.5 py-2 ${
                        mine
                          ? "rounded-br-[0.4rem] bg-[#0b84ff] text-white"
                          : "rounded-bl-[0.4rem] bg-[#e9e9eb] text-[#1c1c1e]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-[15px] leading-5">
                        {message.body}
                      </p>
                      <p
                        className={`mt-0.5 text-right text-[10px] ${
                          mine ? "text-white/75" : "text-[#6e6e73]"
                        }`}
                      >
                        {bubbleTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          className="shrink-0 bg-white/92 px-2.5 pb-3 pt-1.5 backdrop-blur-md"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="driver-sms">
              Text {companyNamePlaceholder}
            </label>
            <textarea
              id="driver-sms"
              ref={field}
              rows={1}
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder="Text message"
              className="max-h-24 min-h-10 flex-1 resize-none rounded-full border-0 bg-[#e9e9eb] px-4 py-2.5 text-[15px] text-[#1c1c1e] outline-none placeholder:text-[#8e8e93] focus:ring-2 focus:ring-[#0b84ff]/35"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0b84ff] text-white disabled:bg-[#c7c7cc]"
              aria-label="Send text"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path
                  fill="currentColor"
                  d="M3.4 11.2 20.2 3.6c.8-.4 1.6.4 1.2 1.2l-7.6 16.8c-.4.8-1.6.7-1.8-.2l-1.6-6.6-6.6-1.6c-.9-.2-1-1.4-.2-1.8Z"
                />
              </svg>
            </button>
          </div>
          <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-[#1c1c1e]/80" aria-hidden />
        </form>
      </div>
    </section>
  );
}
