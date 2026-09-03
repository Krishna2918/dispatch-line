import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { TryDemoButton } from "@/components/marketing/TryDemoButton";
import {
  COMPANY_LINE_FULL,
  COMPANY_LINE_NAME,
  COMPANY_LINE_PHONE,
  MANUFACTURER,
  PRODUCT_NAME,
} from "@/lib/site";

const features = [
  {
    title: "Individual logins",
    copy: "Sarah, David, Alex — each person signs in as themselves. The inbox is not copied per user.",
  },
  {
    title: "One shared inbox",
    copy: "Messages live once. Filters, groups, and assignment change the view. They do not create a second desk.",
  },
  {
    title: "One company line",
    copy: `Drivers text their own phone. They only see the company line (demo placeholder: ${COMPANY_LINE_FULL}). Staff names never leave the desk.`,
  },
  {
    title: "Groups & filters",
    copy: "Montreal, highway, assigned to me, unread. A filter is a lens — the thread stays on the shared list.",
  },
  {
    title: "Shared read",
    copy: "Open a thread and it is read for everyone on the floor. Presence shows who is already in it.",
  },
  {
    title: "Desk-only names",
    copy: "Who sent an SMS is labeled for staff. The driver still sees one company conversation.",
  },
];

export default function Home() {
  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:py-20">
        <p
          className="enter-up font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
          style={{ "--enter-delay": "40ms" } as React.CSSProperties}
        >
          Trucking / dispatch SMS desk
        </p>
        <h1
          className="enter-up mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl sm:leading-[1.05]"
          style={{ "--enter-delay": "80ms" } as React.CSSProperties}
        >
          Shared SMS for the floor. Not a private inbox for each login.
        </h1>
        <p
          className="enter-up mt-5 max-w-2xl text-[17px] leading-8 text-muted"
          style={{ "--enter-delay": "120ms" } as React.CSSProperties}
        >
          {PRODUCT_NAME} is the company text desk. Staff keep their own logins.
          Drivers never install an app — they text the company line and stay in
          one thread. The demo uses {COMPANY_LINE_NAME} at {COMPANY_LINE_PHONE}{" "}
          as a placeholder example, not the product name.
        </p>

        <div
          className="enter-up mt-8 flex flex-wrap gap-3"
          style={{ "--enter-delay": "160ms" } as React.CSSProperties}
        >
          <Link
            href="/pricing"
            className="lift rounded-full bg-amber px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-board hover:bg-amber-hot"
          >
            See pricing
          </Link>
          <Link
            href="/login"
            className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
          >
            Sign in
          </Link>
          <TryDemoButton className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50">
            Try demo
          </TryDemoButton>
        </div>

        <p
          className="enter-up mt-8 inline-flex rounded-full border border-line bg-panel/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
          style={{ "--enter-delay": "200ms" } as React.CSSProperties}
        >
          Manufactured by {MANUFACTURER}
        </p>

        <section className="mt-16 grid gap-3 md:grid-cols-3" aria-label="How the desk works">
          {[
            [
              "01",
              "Staff sign in",
              "Each dispatcher has a login and a role. The desk does not clone the inbox for them.",
            ],
            [
              "02",
              "Drivers text the line",
              `A driver uses their personal phone. They only see the company line (demo placeholder: ${COMPANY_LINE_FULL}) — never a staff list.`,
            ],
            [
              "03",
              "The floor shares one thread",
              "Groups, assignment, and shared read keep the same conversation in front of whoever is on shift.",
            ],
          ].map(([num, title, copy], index) => (
            <article
              key={title}
              className="enter-up rounded-[2.25rem] border border-line bg-panel px-6 py-7"
              style={{ "--enter-delay": `${240 + index * 70}ms` } as React.CSSProperties}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber">{num}</p>
              <h2 className="mt-3 text-xl font-medium text-ink">{title}</h2>
              <p className="mt-2 text-[14px] leading-6 text-muted">{copy}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Product details">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="enter-up rounded-[2rem] border border-line bg-panel/70 px-6 py-6"
              style={{ "--enter-delay": `${420 + index * 50}ms` } as React.CSSProperties}
            >
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
                {feature.title}
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-muted">{feature.copy}</p>
            </article>
          ))}
        </section>
      </main>
    </MarketingShell>
  );
}
