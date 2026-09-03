export function LegalArticle({
  kicker,
  title,
  lede,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber">{kicker}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-7 text-muted">{lede}</p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Last updated {updated}
      </p>
      <div className="legal-copy mt-10 space-y-8 text-[15px] leading-7 text-muted [&_h2]:font-mono [&_h2]:text-[12px] [&_h2]:font-medium [&_h2]:uppercase [&_h2]:tracking-[0.16em] [&_h2]:text-amber [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}
