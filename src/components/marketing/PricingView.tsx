"use client";

import Link from "next/link";
import { SeatStepper } from "@/components/marketing/SeatStepper";
import { PricingFinePrint, PricingHighlights } from "@/components/marketing/PricingHighlights";
import { useSeatQuery } from "@/hooks/useSeatQuery";
import {
  businessPhonePlaceholder,
  companyNamePlaceholder,
} from "@/lib/placeholders";
import { formatCad, monthlyTotalCad, PRICE_CURRENCY, PRICE_PER_USER_CAD } from "@/lib/pricing";
import { PRODUCT_NAME } from "@/lib/site";

export function PricingView() {
  const { seats, setSeats } = useSeatQuery();
  const total = monthlyTotalCad(seats);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:py-20">
      <p
        className="enter-up font-mono text-[11px] uppercase tracking-[0.22em] text-amber"
        style={{ "--enter-delay": "40ms" } as React.CSSProperties}
      >
        {PRODUCT_NAME} · Pricing
      </p>
      <h1
        className="enter-up mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl sm:leading-[1.05]"
        style={{ "--enter-delay": "80ms" } as React.CSSProperties}
      >
        One plan. Seats you can count.
      </h1>
      <p
        className="enter-up mt-5 max-w-2xl text-[17px] leading-8 text-muted"
        style={{ "--enter-delay": "120ms" } as React.CSSProperties}
      >
        {formatCad(PRICE_PER_USER_CAD)} {PRICE_CURRENCY}{" "}
        <span className="font-semibold text-amber">per user</span> / month.{" "}
        <span className="font-semibold text-amber">Unlimited messages</span>{" "}
        per user — no per-text fee on the desk. This is a {PRODUCT_NAME} plan,
        not a {companyNamePlaceholder} plan. The demo uses placeholder company{" "}
        {companyNamePlaceholder} / {businessPhonePlaceholder}.
      </p>

      <article
        className="enter-up mx-auto mt-12 max-w-xl rounded-[2.5rem] border border-amber/35 bg-panel px-6 py-8 sm:px-8"
        style={{ "--enter-delay": "160ms" } as React.CSSProperties}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber">
          {PRODUCT_NAME}
        </p>
        <p className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-6xl font-semibold tracking-tight text-ink sm:text-7xl">
            {formatCad(PRICE_PER_USER_CAD)}
          </span>
          <span className="mb-2 font-mono text-[13px] uppercase tracking-[0.16em] text-amber">
            {PRICE_CURRENCY}
          </span>
        </p>
        <PricingHighlights />
        <p className="mt-5 text-[15px] leading-6 text-muted">
          Shared inbox, filters, assignment, and driver phone.{" "}
          <strong className="font-semibold text-amber">Unlimited messages</strong>{" "}
          <strong className="font-semibold text-amber">per user</strong> — not
          per text.
        </p>
        <div className="mt-8 border-t border-line pt-6">
          <SeatStepper seats={seats} onChange={setSeats} />
        </div>
        <Link
          href={`/pay?seats=${seats}`}
          className="lift mt-6 flex w-full items-center justify-center rounded-full bg-amber px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-board hover:bg-amber-hot"
        >
          Continue to checkout · {formatCad(total)} CAD/month
        </Link>
        <div className="mt-5">
          <PricingFinePrint />
        </div>
      </article>
    </main>
  );
}
