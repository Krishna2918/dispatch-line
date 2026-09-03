"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { roleLabel } from "@/hooks/format";
import { useDemoSession } from "@/hooks/useDemoSession";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  authenticateDemo,
  findAccountByEmail,
  type DemoAccount,
} from "@/lib/demo-accounts";
import { DEMO_DISPATCHER } from "@/lib/demo-data";
import { PRODUCT_NAME } from "@/lib/site";
import type { Profile } from "@/lib/types";

export function DemoLogin() {
  const router = useRouter();
  const { enterAs } = useDemoSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const enter = (staff: Profile) => {
    enterAs(staff);
    router.replace("/dashboard");
  };

  const fill = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const known = findAccountByEmail(email);
    if (!known) {
      setError("We don’t recognize that email. Use a seeded demo account or continue with demo.");
      setBusy(false);
      return;
    }
    const staff = authenticateDemo(email, password);
    if (!staff) {
      setError("Incorrect password.");
      setBusy(false);
      return;
    }
    enter(staff);
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12">
      <p className="enter-up font-mono text-[11px] uppercase tracking-[0.28em] text-amber">
        {PRODUCT_NAME} · Staff sign-in
      </p>
      <h1
        className="enter-up mt-3 text-3xl font-semibold tracking-tight text-ink"
        style={{ "--enter-delay": "50ms" } as React.CSSProperties}
      >
        Sign in to the desk
      </h1>
      <p
        className="enter-up mt-3 max-w-md text-[15px] leading-6 text-muted"
        style={{ "--enter-delay": "90ms" } as React.CSSProperties}
      >
        Individual login. One shared inbox. Your name stays on the desk — drivers
        only see the company line.{" "}
        <Link href="/pricing" className="text-amber hover:text-amber-hot">
          See pricing
        </Link>
        .
      </p>

      <form
        onSubmit={onSubmit}
        className="enter-up mt-8 space-y-4 rounded-[2rem] border border-line bg-panel px-5 py-6"
        style={{ "--enter-delay": "120ms" } as React.CSSProperties}
        noValidate
      >
        <div>
          <label htmlFor="login-email" className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="sarah.chen@dispatchline.demo"
            className="mt-1.5 w-full rounded-full border border-line bg-board px-4 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted/60 focus:border-amber/50 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--amber)_12%,transparent)]"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : "login-hint"}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Password
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="min-w-0 flex-1 rounded-full border border-line bg-board px-4 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted/60 focus:border-amber/50 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--amber)_12%,transparent)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="shrink-0 rounded-full border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:text-ink"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error ? (
          <p id="login-error" className="text-[13px] text-signal" role="alert">
            {error}
          </p>
        ) : (
          <p id="login-hint" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Seeded demo password: {DEMO_PASSWORD}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <button
            type="submit"
            disabled={busy}
            className="lift flex-1 rounded-full bg-amber px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-board hover:bg-amber-hot disabled:opacity-70"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => enter(DEMO_DISPATCHER)}
            className="lift flex-1 rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
          >
            Continue with demo
          </button>
        </div>
      </form>

      <p
        className="enter-up mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted"
        style={{ "--enter-delay": "160ms" } as React.CSSProperties}
      >
        Demo shortcuts
      </p>
      <ul className="mt-3 space-y-2">
        {DEMO_ACCOUNTS.map((account, index) => (
          <li
            key={account.staff.id}
            className="enter-up"
            style={{ "--enter-delay": `${190 + index * 50}ms` } as React.CSSProperties}
          >
            <div className="flex items-center gap-2 rounded-full border border-line bg-panel px-2 py-1.5">
              <button
                type="button"
                onClick={() => fill(account)}
                className="min-w-0 flex-1 rounded-full px-3 py-2 text-left hover:bg-panel-raised"
              >
                <span className="block truncate text-[14px] font-medium text-ink">
                  {account.staff.fullName}
                </span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  {roleLabel(account.staff.role)} · {account.email}
                </span>
              </button>
              <button
                type="button"
                onClick={() => enter(account.staff)}
                className="lift shrink-0 rounded-full bg-amber/12 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-amber hover:bg-amber/20"
              >
                Enter
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
