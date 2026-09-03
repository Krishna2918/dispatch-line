import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PayView } from "@/components/marketing/PayView";
import { AUTH_COOKIE, AUTH_COOKIE_OK, loginHref } from "@/lib/credentials";
import { parseSeats } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Request DispatchLine seats at $55 CAD per user per month. Unlimited messages per user. Billing connects later.",
};

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ seats?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  if (cookieStore.get(AUTH_COOKIE)?.value !== AUTH_COOKIE_OK) {
    const seats = parseSeats((await searchParams).seats);
    redirect(loginHref(`/pay?seats=${seats}`));
  }

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
