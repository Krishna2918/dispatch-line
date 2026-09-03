"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDemoSession } from "@/hooks/useDemoSession";
import { PRODUCT_NAME } from "@/lib/site";
import { TryDemoButton } from "./TryDemoButton";

const guestLinks = [
  { href: "/demo", label: "Demo" },
  { href: "/login", label: "Sign in" },
] as const;

const signedInLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/demo", label: "Demo" },
] as const;

function navClass(active: boolean) {
  return `rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] ${
    active
      ? "bg-amber/12 text-amber"
      : "text-muted hover:bg-panel-raised hover:text-ink"
  }`;
}

export function MarketingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { entered, hydrated, signOut } = useDemoSession();
  const showSignedIn = hydrated && entered;

  return (
    <div className="px-3 pt-3">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 rounded-full border border-line bg-panel/90 px-4 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="size-2 shrink-0 rounded-full bg-amber" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-amber">
            {PRODUCT_NAME}
          </span>
        </Link>
        <nav aria-label="Product" className="flex items-center gap-1">
          {showSignedIn
            ? signedInLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navClass(pathname === link.href)}
                >
                  {link.label}
                </Link>
              ))
            : guestLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navClass(pathname === link.href)}
                >
                  {link.label}
                </Link>
              ))}
          {showSignedIn ? (
            <button
              type="button"
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:bg-panel-raised hover:text-ink"
            >
              Sign out
            </button>
          ) : (
            <TryDemoButton className="lift hidden rounded-full bg-amber px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-board hover:bg-amber-hot sm:inline-flex">
              Try demo
            </TryDemoButton>
          )}
        </nav>
      </header>
    </div>
  );
}
