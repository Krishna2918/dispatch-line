"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDemoSession } from "@/hooks/useDemoSession";
import { DEMO_DISPATCHER } from "@/lib/demo-data";
import { safeNextPath } from "@/lib/credentials";
import { PRODUCT_NAME } from "@/lib/site";

export function DemoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enterAs } = useDemoSession();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, password }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Invalid ID or password.");
        return;
      }

      const next = safeNextPath(searchParams.get("next"));
      if (next) {
        router.replace(next);
        return;
      }
      enterAs(DEMO_DISPATCHER);
      router.replace("/dashboard");
    } catch {
      setError("Invalid ID or password.");
    } finally {
      setBusy(false);
    }
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
        Enter the ID and password issued to you. There is no sign-up on this
        page.{" "}
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
          <label htmlFor="login-id" className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            ID / User ID
          </label>
          <input
            id="login-id"
            name="username"
            type="text"
            autoComplete="username"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            className="mt-1.5 w-full rounded-full border border-line bg-board px-4 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted/60 focus:border-amber/50 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--amber)_12%,transparent)]"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
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
              placeholder="Password"
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
        ) : null}

        <div className="pt-1">
          <button
            type="submit"
            disabled={busy}
            className="lift w-full rounded-full bg-amber px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-board hover:bg-amber-hot disabled:opacity-70"
          >
            Sign in
          </button>
        </div>
      </form>
    </main>
  );
}
