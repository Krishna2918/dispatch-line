import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PricingView } from "@/components/marketing/PricingView";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "DispatchLine is $55 CAD per user per month. Unlimited messages per user. No per-text fee on the desk.",
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <Suspense
        fallback={
          <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-5 py-16">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
              Loading pricing…
            </p>
          </main>
        }
      >
        <PricingView />
      </Suspense>
    </MarketingShell>
  );
}
