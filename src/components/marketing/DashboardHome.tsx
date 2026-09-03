"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { roleLabel } from "@/hooks/format";
import { useDemoSession } from "@/hooks/useDemoSession";
import { CompanyLineFields } from "@/components/marketing/CompanyLineFields";
import { DEMO_CONVERSATIONS, DEMO_DRIVERS, DEMO_GROUPS } from "@/lib/demo-data";
import {
  businessPhonePlaceholder,
  companyLineFullPlaceholder,
  companyNamePlaceholder,
} from "@/lib/placeholders";
import { MANUFACTURER, PRODUCT_NAME } from "@/lib/site";

const unreadSeed = DEMO_CONVERSATIONS.filter((row) => row.unreadCount > 0).length;

export function DashboardHome() {
  const router = useRouter();
  const { staff, entered, hydrated, signOut } = useDemoSession();

  useEffect(() => {
    if (hydrated && !entered) {
      router.replace("/login");
    }
  }, [entered, hydrated, router]);

  if (!hydrated || !entered) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-5 py-16">
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
          Opening your desk…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:py-16">
      <p className="enter-up font-mono text-[11px] uppercase tracking-[0.22em] text-amber">
        {PRODUCT_NAME} · Desk home
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">
            You are on the shared desk.
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-muted">
            Signed in as <span className="text-ink">{staff.fullName}</span>
            <span className="text-muted"> · {roleLabel(staff.role)}</span>.
            This is the first screen — not a thread. Open the inbox when you are
            ready.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className="lift self-start rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ink"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          [
            "Shared inbox",
            `${DEMO_DRIVERS.length} driver threads`,
            `${unreadSeed} unread on the seed desk. One list for every login — never a private copy.`,
          ],
          [
            "Driver phone",
            `${companyNamePlaceholder} · ${businessPhonePlaceholder}`,
            `Demo placeholder company / shared business number. Drivers only see ${companyLineFullPlaceholder}. Staff names stay here.`,
          ],
          [
            "Filters",
            `${DEMO_GROUPS.length} groups + assignment`,
            "Montreal, unread, assigned to me — views of the same desk, not extra inboxes.",
          ],
        ].map(([title, stat, copy], index) => (
          <article
            key={title}
            className="enter-up rounded-[2rem] border border-line bg-panel px-6 py-6"
            style={{ "--enter-delay": `${80 + index * 60}ms` } as React.CSSProperties}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">{title}</p>
            <p className="mt-2 text-[17px] font-medium text-ink">{stat}</p>
            <p className="mt-2 text-[13px] leading-5 text-muted">{copy}</p>
          </article>
        ))}
      </div>

      <section
        className="enter-up mt-6 rounded-[2rem] border border-line bg-panel px-6 py-6"
        style={{ "--enter-delay": "240ms" } as React.CSSProperties}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
          Company line
        </p>
        <p className="mt-2 text-[14px] leading-6 text-muted">
          Demo fill-ins — not the {PRODUCT_NAME} brand. Drivers see this shared
          line, not dispatcher names.
        </p>
        <div className="mt-4">
          <CompanyLineFields idPrefix="dashboard" />
        </div>
      </section>

      <div
        className="enter-up mt-8 flex flex-wrap gap-3"
        style={{ "--enter-delay": "260ms" } as React.CSSProperties}
      >
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
        <Link
          href="/demo"
          className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
        >
          Try demo walkthrough
        </Link>
        <Link
          href="/pricing"
          className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
        >
          Pricing
        </Link>
      </div>

      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Manufactured by {MANUFACTURER} · demo desk, seeded data
      </p>
    </main>
  );
}
