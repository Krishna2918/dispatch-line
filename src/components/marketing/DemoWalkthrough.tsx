"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoSession } from "@/hooks/useDemoSession";
import { DEMO_DISPATCHER, DEMO_STAFF_ROSTER } from "@/lib/demo-data";
import { COMPANY_LINE_NAME, PRODUCT_NAME } from "@/lib/site";

const david = DEMO_STAFF_ROSTER[1];

const beats = [
  {
    clock: "0:00",
    title: "Two staff, one inbox",
    copy: `Open the desk as ${DEMO_DISPATCHER.fullName}. In another browser tab, enter as ${david.fullName}. You should see the same driver threads — not two copies of the list.`,
  },
  {
    clock: "0:20",
    title: "Reply from the desk",
    copy: "Open John Smith. Send an SMS. The other staff tab should show the same message with your name on it. That name is desk-only.",
  },
  {
    clock: "0:35",
    title: "Open the driver phone",
    copy: `Switch to the driver phone. There is one chat: ${COMPANY_LINE_NAME}. No dispatcher names, no staff list, no internal notes.`,
  },
  {
    clock: "0:50",
    title: "Filter and assign",
    copy: "Back on the desk, filter Montreal or Assigned to me. The thread is not copied — you are only changing the view. Shared read means opening a thread clears unread for everyone.",
  },
];

export function DemoWalkthrough() {
  const router = useRouter();
  const { enterAs, entered } = useDemoSession();

  const startAsSarah = () => {
    enterAs(DEMO_DISPATCHER);
    router.push("/dashboard");
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:py-16">
      <p className="enter-up font-mono text-[11px] uppercase tracking-[0.22em] text-amber">
        {PRODUCT_NAME} · 60-second demo
      </p>
      <h1 className="enter-up mt-3 text-4xl font-semibold tracking-tight text-ink">
        Two staff. One driver phone.
      </h1>
      <p className="enter-up mt-4 max-w-xl text-[16px] leading-7 text-muted">
        This walkthrough uses the seeded Trans99 desk. You do not need a
        password. Follow the beats, then open the real surfaces.
      </p>

      <ol className="mt-10 space-y-3">
        {beats.map((beat, index) => (
          <li
            key={beat.title}
            className="enter-up rounded-[2rem] border border-line bg-panel px-6 py-5"
            style={{ "--enter-delay": `${80 + index * 70}ms` } as React.CSSProperties}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber">
              {beat.clock} · Step {index + 1}
            </p>
            <h2 className="mt-2 text-[18px] font-medium text-ink">{beat.title}</h2>
            <p className="mt-2 text-[14px] leading-6 text-muted">{beat.copy}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/inbox"
          className="lift rounded-full bg-amber px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-board hover:bg-amber-hot"
        >
          Open shared inbox
        </Link>
        <Link
          href="/driver"
          className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
        >
          Open driver phone
        </Link>
        {entered ? (
          <Link
            href="/dashboard"
            className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
          >
            Back to dashboard
          </Link>
        ) : (
          <button
            type="button"
            onClick={startAsSarah}
            className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
          >
            Start as {DEMO_DISPATCHER.fullName}
          </button>
        )}
      </div>
    </main>
  );
}
