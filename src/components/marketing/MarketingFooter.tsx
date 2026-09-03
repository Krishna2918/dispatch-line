import Link from "next/link";
import { COPYRIGHT_YEAR, MANUFACTURER, PRODUCT_NAME } from "@/lib/site";

export function MarketingFooter() {
  return (
    <footer className="px-3 pb-4 pt-2">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 rounded-full border border-line bg-panel/80 px-5 py-3 text-center sm:flex-row sm:text-left">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          Manufactured by {MANUFACTURER}
          <span className="mx-2 text-line-strong" aria-hidden>
            ·
          </span>
          © {COPYRIGHT_YEAR} {PRODUCT_NAME}
        </p>
        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-1">
          <Link
            href="/pricing"
            className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:bg-panel-raised hover:text-ink"
          >
            Pricing
          </Link>
          <Link
            href="/pay"
            className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:bg-panel-raised hover:text-ink"
          >
            Pay
          </Link>
          <Link
            href="/terms"
            className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:bg-panel-raised hover:text-ink"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:bg-panel-raised hover:text-ink"
          >
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
