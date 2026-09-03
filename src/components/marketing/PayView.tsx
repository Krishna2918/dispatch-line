"use client";

import Link from "next/link";
import { useState } from "react";
import { CompanyLineFields } from "@/components/marketing/CompanyLineFields";
import { SeatStepper } from "@/components/marketing/SeatStepper";
import { PricingFinePrint, PricingHighlights } from "@/components/marketing/PricingHighlights";
import { useSeatQuery } from "@/hooks/useSeatQuery";
import {
  businessPhonePlaceholder,
  companyNamePlaceholder,
} from "@/lib/placeholders";
import { formatCad, monthlyTotalCad, PRICE_CURRENCY, PRICE_PER_USER_CAD } from "@/lib/pricing";
import { PRODUCT_NAME } from "@/lib/site";

export function PayView() {
  const { seats, setSeats } = useSeatQuery();
  const [submitted, setSubmitted] = useState(false);
  const total = monthlyTotalCad(seats);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:py-20">
      <p className="enter-up font-mono text-[11px] uppercase tracking-[0.22em] text-amber">
        {PRODUCT_NAME} · Checkout
      </p>
      <h1 className="enter-up mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Request seats
      </h1>
      <p className="enter-up mt-4 max-w-2xl text-[16px] leading-7 text-muted">
        {formatCad(PRICE_PER_USER_CAD)} {PRICE_CURRENCY}{" "}
        <span className="font-semibold text-amber">per user</span> / month.{" "}
        <span className="font-semibold text-amber">Unlimited messages</span> per
        user. Billing connects later — this step collects seats only.
      </p>

      <article className="enter-up mx-auto mt-10 max-w-xl rounded-[2.5rem] border border-line bg-panel px-6 py-8 sm:px-8">
        {submitted ? (
          <div role="status">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ok">
              Seats recorded
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">
              {seats} {seats === 1 ? "seat" : "seats"} · {formatCad(total)} CAD/month
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-muted">
              Seat request recorded. No card was charged. Billing is not
              connected yet — when it is, this same total{" "}
              <span className="font-semibold text-amber">per user</span> will
              apply, with{" "}
              <span className="font-semibold text-amber">unlimited messages</span>{" "}
              per user.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/pricing?seats=${seats}`}
                className="lift rounded-full bg-amber px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-board hover:bg-amber-hot"
              >
                Back to pricing
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
              >
                Change seats
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              {PRODUCT_NAME} · {formatCad(PRICE_PER_USER_CAD)} {PRICE_CURRENCY}
            </p>
            <PricingHighlights />
            <div className="mt-8 space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Company line
              </p>
              <p className="text-[13px] leading-5 text-muted">
                Demo fill-ins — not the {PRODUCT_NAME} brand. Placeholder company{" "}
                {companyNamePlaceholder} / {businessPhonePlaceholder}.
              </p>
              <CompanyLineFields idPrefix="pay" />
            </div>
            <div className="mt-8">
              <SeatStepper seats={seats} onChange={setSeats} id="checkout-seats" />
            </div>
            <dl className="mt-6 space-y-2 rounded-[1.5rem] border border-line bg-board/60 px-5 py-4">
              <div className="flex justify-between gap-4 font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
                <dt>Unit</dt>
                <dd className="text-ink">
                  {formatCad(PRICE_PER_USER_CAD)} {PRICE_CURRENCY}{" "}
                  <span className="text-amber">per user</span> / month
                </dd>
              </div>
              <div className="flex justify-between gap-4 font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
                <dt>Seats</dt>
                <dd className="text-ink">{seats}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-2 font-mono text-[13px] uppercase tracking-[0.12em] text-amber">
                <dt>Monthly total</dt>
                <dd>{formatCad(total)} CAD</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="lift mt-6 flex w-full items-center justify-center rounded-full bg-amber px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-board hover:bg-amber-hot"
            >
              Continue — request {seats} {seats === 1 ? "seat" : "seats"}
            </button>
            <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              No charge now
            </p>
            <div className="mt-5">
              <PricingFinePrint />
            </div>
            <p className="mt-4 text-center">
              <Link
                href={`/pricing?seats=${seats}`}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-amber"
              >
                Back to pricing
              </Link>
            </p>
          </>
        )}
      </article>
    </main>
  );
}
