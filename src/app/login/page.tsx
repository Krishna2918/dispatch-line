import type { Metadata } from "next";
import Link from "next/link";
import { DemoLogin } from "@/components/DemoLogin";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-board">
      <div className="px-3 pt-3">
        <header className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-line bg-panel/90 px-5">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-amber" aria-hidden />
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-amber">
              DispatchLine
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/driver"
              className="rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:bg-panel-raised hover:text-ink"
            >
              Open driver phone
            </Link>
            <Link
              href="/inbox"
              className="rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:bg-panel-raised hover:text-ink"
            >
              Skip to inbox
            </Link>
          </div>
        </header>
      </div>
      <DemoLogin />
    </div>
  );
}
