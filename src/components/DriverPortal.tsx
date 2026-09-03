"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BUSINESS_LINE_FULL,
  BUSINESS_LINE_NAME,
  BUSINESS_LINE_PHONE,
  DriverPhone,
  JOHN_STORY_CHIP,
} from "@/components/DriverPhone";
import { D_JOHN, DEMO_DRIVERS } from "@/lib/demo-data";
import { getDemoStore } from "@/lib/demo-store";
import type { Driver, InboxSnapshot, Message } from "@/lib/types";

const SESSION_KEY = "dispatch-line-demo-driver";

function readStoredDriverId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeStoredDriverId(id: string) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, id);
  } catch {
    /* private mode */
  }
}

function smsOnly(messages: Message[]): Message[] {
  return messages.filter((message) => message.kind === "sms_in" || message.kind === "sms_out");
}

function messagesForDriver(snap: InboxSnapshot, driverId: string): Message[] {
  const conversation = snap.conversations.find((row) => row.driverId === driverId);
  const byId = new Map<string, Message>();
  for (const list of Object.values(snap.messagesByConversation)) {
    for (const message of list) {
      const sameDriver = message.driverId === driverId;
      const sameThread =
        conversation &&
        (message.conversationId === conversation.id || message.conversation_id === conversation.id);
      if (sameDriver || sameThread) byId.set(message.id, message);
    }
  }
  return smsOnly([...byId.values()]).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function postInbound(driverId: string, body: string, phone: string): Message {
  const store = getDemoStore() as ReturnType<typeof getDemoStore> & {
    appendInbound?: (a: unknown, b?: string) => Message;
    ingestInbound: (params: { from: string; body: string }) => Message;
  };
  if (typeof store.appendInbound === "function") {
    try {
      return store.appendInbound(driverId, body);
    } catch {
      return store.appendInbound({ from: phone, body });
    }
  }
  return store.ingestInbound({ from: phone, body });
}

function clockLabel(now: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(now));
}

export function DriverPortal() {
  const [snap, setSnap] = useState<InboxSnapshot | null>(null);
  const [driverId, setDriverId] = useState(D_JOHN);
  const [draft, setDraft] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const store = getDemoStore();
    try {
      const next = store.snapshot(store.currentStaff());
      const stored = readStoredDriverId();
      const chosen =
        stored && next.drivers.some((row) => row.id === stored) ? stored : D_JOHN;
      setDriverId(chosen);
      writeStoredDriverId(chosen);
      setSnap(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Store failed");
    }
    return store.subscribe((incoming) => setSnap(incoming));
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const drivers = snap?.drivers?.length ? snap.drivers : DEMO_DRIVERS;
  const driver =
    drivers.find((row) => row.id === driverId) ??
    drivers.find((row) => row.id === D_JOHN) ??
    DEMO_DRIVERS[0];
  const thread = snap && driver ? messagesForDriver(snap, driver.id) : [];
  const showStory = driver?.id === D_JOHN;

  const selectDriver = (id: string) => {
    setDriverId(id);
    writeStoredDriverId(id);
    setDraft("");
    setError(null);
  };

  const sendBody = (raw: string) => {
    const body = raw.trim();
    if (!body || !driver) return;
    setError(null);
    try {
      postInbound(driver.id, body, driver.phone);
      setDraft("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#07080a] text-[#f3efe6]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-3 pb-4 pt-3">
        <header className="mb-2 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e6b33a]">
              Driver phone · Demo
            </p>
            <p className="text-[13px] text-white/55">
              One chat: {BUSINESS_LINE_NAME}. Notes stay on the desk.
            </p>
          </div>
          <Link
            href="/inbox"
            className="rounded-full border border-white/12 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 hover:border-white/30 hover:text-white"
          >
            Open desk
          </Link>
        </header>

        <label className="mb-2 flex items-center gap-2 px-1">
          <span className="shrink-0 text-[11px] text-white/35">
            demo: switch which driver I am
          </span>
          <select
            value={driver?.id ?? D_JOHN}
            onChange={(event) => selectDriver(event.target.value)}
            className="min-w-0 flex-1 appearance-none rounded-full border border-white/10 bg-[#14181c] px-3 py-1.5 text-[12px] text-white/85 outline-none focus:border-[#e6b33a]/50"
            aria-label="Demo only: switch which driver I am"
          >
            {drivers.map((row: Driver) => (
              <option key={row.id} value={row.id}>
                {row.fullName}
                {row.terminal ? ` · ${row.terminal}` : ""}
              </option>
            ))}
          </select>
        </label>

        {showStory ? (
          <button
            type="button"
            onClick={() => sendBody(JOHN_STORY_CHIP)}
            className="mb-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-left text-[12px] leading-4 text-white/70 hover:border-white/25 hover:text-white"
          >
            <span className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#e6b33a]">
              Demo chip
            </span>
            {JOHN_STORY_CHIP}
          </button>
        ) : null}

        <DriverPhone
          messages={thread}
          draft={draft}
          onDraftChange={setDraft}
          onSend={() => sendBody(draft)}
          clock={now ? clockLabel(now) : "9:41"}
        />

        {error ? (
          <p className="mt-2 px-2 text-center text-[12px] text-[#ff6b4a]" role="alert">
            {error}
          </p>
        ) : null}

        <p className="mt-3 px-2 text-center text-[11px] leading-5 text-white/35">
          Every desk SMS lands as {BUSINESS_LINE_FULL} · {BUSINESS_LINE_PHONE}. No
          staff names. No dispatcher list.
        </p>
      </div>
    </div>
  );
}
