"use client";

import { useRouter } from "next/navigation";
import { roleLabel } from "@/hooks/format";
import { useDemoSession } from "@/hooks/useDemoSession";
import { DEMO_STAFF_ROSTER } from "@/lib/demo-data";
import type { Profile } from "@/lib/types";

export function DemoLogin() {
  const router = useRouter();
  const { enterAs, setStaff } = useDemoSession();

  const enter = (staff: Profile) => {
    (enterAs ?? setStaff)(staff);
    router.replace("/inbox");
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12">
      <p className="enter-up font-mono text-[11px] uppercase tracking-[0.28em] text-amber">
        Dispatch Line · Demo
      </p>
      <h1
        className="enter-up mt-3 text-3xl font-semibold tracking-tight text-ink"
        style={{ "--enter-delay": "50ms" } as React.CSSProperties}
      >
        Enter the desk
      </h1>
      <p
        className="enter-up mt-3 max-w-md text-[15px] leading-6 text-muted"
        style={{ "--enter-delay": "90ms" } as React.CSSProperties}
      >
        Individual login, one shared inbox. Filters are views — never a private
        copy. No Twilio, no Supabase, no password.
      </p>

      <ul className="mt-8 space-y-2.5">
        {DEMO_STAFF_ROSTER.map((staff, index) => (
          <li
            key={staff.id}
            className="enter-up"
            style={{ "--enter-delay": `${130 + index * 60}ms` } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={() => enter(staff)}
              className="lift flex w-full items-center justify-between gap-4 rounded-full border border-line bg-panel px-5 py-3.5 text-left hover:border-amber/45 hover:bg-panel-raised"
            >
              <span>
                <span className="block text-[15px] font-medium text-ink">
                  {staff.fullName}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {roleLabel(staff.role)}
                </span>
              </span>
              <span className="rounded-full bg-amber/12 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-amber">
                Enter
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
