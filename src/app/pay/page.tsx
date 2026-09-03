import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PayView } from "@/components/marketing/PayView";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Request DispatchLine seats at $55 CAD per user per month. Unlimited messages per user. Billing connects later.",
};

export default function PayPage() {
  return (
    <MarketingShell>
      <Suspense
        fallback={
          <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-5 py-16">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
              Loading checkout…
            </p>
          </main>
        }
      >
        <PayView />
      </Suspense>
    </MarketingShell>
  );
}
