export const PRICE_PER_USER_CAD = 55;
export const PRICE_CURRENCY = "CAD";
export const MIN_SEATS = 1;
export const MAX_SEATS = 99;

export function clampSeats(value: number): number {
  if (!Number.isFinite(value)) return MIN_SEATS;
  return Math.min(MAX_SEATS, Math.max(MIN_SEATS, Math.trunc(value)));
}

export function parseSeats(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  return clampSeats(Number.parseInt(raw ?? String(MIN_SEATS), 10));
}

export function monthlyTotalCad(seats: number): number {
  return clampSeats(seats) * PRICE_PER_USER_CAD;
}

export function formatCad(amount: number): string {
  return `$${new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(amount)}`;
}
