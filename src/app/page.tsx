import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-board">
      <div className="px-3 pt-3">
        <header className="enter-up mx-auto flex h-14 w-full max-w-5xl items-center gap-3 rounded-full border border-line bg-panel/90 px-5">
          <span className="size-2 rounded-full bg-amber" aria-hidden />
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-amber">
            Dispatch Line
          </p>
        </header>
      </div>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16">
        <p
          className="enter-up font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
          style={{ "--enter-delay": "40ms" } as React.CSSProperties}
        >
          Trucking / logistics desk
        </p>
        <h1
          className="enter-up mt-3 max-w-xl text-4xl font-semibold tracking-tight text-ink"
          style={{ "--enter-delay": "80ms" } as React.CSSProperties}
        >
          Shared SMS inbox for the dispatch floor.
        </h1>
        <p
          className="enter-up mt-4 max-w-lg text-[16px] leading-7 text-muted"
          style={{ "--enter-delay": "120ms" } as React.CSSProperties}
        >
          Multiple staff see the same driver threads. Drivers never install an
          app — they just text. Internal notes stay on the desk.
        </p>

        <div
          className="enter-up mt-8 flex flex-wrap gap-3"
          style={{ "--enter-delay": "160ms" } as React.CSSProperties}
        >
          <Link
            href="/login"
            className="lift rounded-full bg-amber px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-board hover:bg-amber-hot"
          >
            Open demo desk
          </Link>
          <Link
            href="/inbox"
            className="lift rounded-full border border-line px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:border-amber/50"
          >
            Skip to inbox
          </Link>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-3">
          {[
            ["Shared threads", "One conversation per driver. Whole desk sees it."],
            ["Staff notes", "Private comments in the same thread. Drivers never see them."],
            ["Mass broadcast", "Tag a lane, blast SMS. Replies return 1:1, not a group."],
          ].map(([title, copy], index) => (
            <li
              key={title}
              className="enter-up rounded-[2.5rem] border border-line bg-panel px-6 py-6"
              style={{ "--enter-delay": `${200 + index * 70}ms` } as React.CSSProperties}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
                {title}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-muted">{copy}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="px-5 pb-4">
        <p className="mx-auto max-w-5xl rounded-full border border-line bg-panel/70 px-5 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          Demo mode · no Twilio · no Supabase
        </p>
      </footer>
    </div>
  );
}
