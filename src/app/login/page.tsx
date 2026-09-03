import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoLogin } from "@/components/DemoLogin";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <MarketingShell>
      <Suspense
        fallback={
          <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-5 py-16">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
              Opening sign-in…
            </p>
          </main>
        }
      >
        <DemoLogin />
      </Suspense>
    </MarketingShell>
  );
}
