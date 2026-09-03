import {
  DEMO_STAFF_ROSTER,
  STAFF_ALEX,
  STAFF_DAVID,
  STAFF_MORGAN,
  STAFF_PRIYA,
  STAFF_SARAH,
} from "./demo-data";
import { DEMO_PASSWORD } from "./site";
import type { Profile } from "./types";

export { DEMO_PASSWORD };

export type DemoAccount = {
  email: string;
  aliases: string[];
  staff: Profile;
};

function slugEmail(fullName: string) {
  return `${fullName.toLowerCase().replace(/\s+/g, ".")}@dispatchline.demo`;
}

const FIRST_ALIASES: Record<string, string[]> = {
  [STAFF_SARAH]: ["sarah@dispatchline.demo", "sarah.chen@trans99.demo"],
  [STAFF_DAVID]: ["david@dispatchline.demo", "david.singh@trans99.demo"],
  [STAFF_ALEX]: ["alex@dispatchline.demo", "alex.rivera@trans99.demo"],
  [STAFF_PRIYA]: ["priya@dispatchline.demo", "priya.shah@trans99.demo"],
  [STAFF_MORGAN]: ["morgan@dispatchline.demo", "morgan.lee@trans99.demo"],
};

export const DEMO_ACCOUNTS: DemoAccount[] = DEMO_STAFF_ROSTER.map((staff) => {
  const email = slugEmail(staff.fullName);
  return {
    email,
    aliases: [email, ...(FIRST_ALIASES[staff.id] ?? [])],
    staff,
  };
});

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function findAccountByEmail(email: string): DemoAccount | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return DEMO_ACCOUNTS.find((account) => account.aliases.includes(normalized)) ?? null;
}

export function authenticateDemo(email: string, password: string): Profile | null {
  const account = findAccountByEmail(email);
  if (!account) return null;
  if (password !== DEMO_PASSWORD) return null;
  return account.staff;
}
