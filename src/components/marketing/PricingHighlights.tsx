export function PricingHighlights() {
  return (
    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Plan highlights">
      <li className="rounded-full border border-amber bg-amber px-3.5 py-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-board">
        per user
      </li>
      <li className="rounded-full border border-line bg-panel-raised px-3.5 py-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-ink">
        per month
      </li>
      <li className="rounded-full border border-amber bg-amber px-3.5 py-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-board">
        unlimited messages
      </li>
    </ul>
  );
}

export function PricingFinePrint() {
  return (
    <p className="text-[12px] leading-5 text-muted/80">
      Unlimited messages per user on the software — inbox and drivers included,
      no per-text fee on DispatchLine. Carrier SMS (Telnyx/RingCentral) is
      separate if you go live. Manufactured by BIT Solutions. Demo checkout
      until billing is connected.
    </p>
  );
}
