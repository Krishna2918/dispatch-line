"use client";

import { clampSeats, formatCad, MAX_SEATS, MIN_SEATS, monthlyTotalCad } from "@/lib/pricing";

type Props = {
  seats: number;
  onChange: (seats: number) => void;
  id?: string;
};

export function SeatStepper({ seats, onChange, id = "seat-count" }: Props) {
  const value = clampSeats(seats);
  const total = monthlyTotalCad(value);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label
            htmlFor={id}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted"
          >
            Seats
          </label>
          <p className="mt-1 text-[14px] text-muted">
            How many people need a desk login.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Fewer seats"
            disabled={value <= MIN_SEATS}
            onClick={() => onChange(value - 1)}
            className="lift size-11 rounded-full border border-line bg-panel-raised font-mono text-lg text-ink hover:border-amber/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
          >
            −
          </button>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={MIN_SEATS}
            max={MAX_SEATS}
            value={value}
            aria-valuemin={MIN_SEATS}
            aria-valuemax={MAX_SEATS}
            aria-valuenow={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-11 w-16 rounded-full border border-line bg-board text-center font-mono text-[15px] text-ink outline-none focus:border-amber/60"
          />
          <button
            type="button"
            aria-label="More seats"
            disabled={value >= MAX_SEATS}
            onClick={() => onChange(value + 1)}
            className="lift size-11 rounded-full border border-line bg-panel-raised font-mono text-lg text-ink hover:border-amber/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
          >
            +
          </button>
        </div>
      </div>
      <p
        className="rounded-full border border-amber/35 bg-amber/10 px-4 py-3 text-center font-mono text-[13px] uppercase tracking-[0.14em] text-amber"
        aria-live="polite"
      >
        {value} {value === 1 ? "user" : "users"} = {formatCad(total)} CAD/month
      </p>
    </div>
  );
}
