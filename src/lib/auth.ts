import { DEMO_DISPATCHER, DEMO_STAFF_ROSTER } from "./demo-data";
import { asProfile, type Profile, type Staff } from "./types";

const STAFF_KEY = "dispatch-line-staff-session";

function readStore(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function getDemoStaff(): Profile {
  const storage = readStore();
  if (!storage) return DEMO_DISPATCHER;
  try {
    const raw = storage.getItem(STAFF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Staff & Partial<Profile>;
      if (parsed?.id) {
        const roster = DEMO_STAFF_ROSTER.find((row) => row.id === parsed.id);
        if (roster) return roster;
        return asProfile({
          id: parsed.id,
          name: parsed.name ?? parsed.fullName ?? "Dispatcher",
          role: parsed.role,
        });
      }
    }
  } catch {
    /* ignore */
  }
  return DEMO_DISPATCHER;
}

export function setDemoStaff(profile: Staff | Profile) {
  const storage = readStore();
  if (!storage) return;
  const next = asProfile(profile);
  const roster = DEMO_STAFF_ROSTER.find((row) => row.id === next.id);
  storage.setItem(STAFF_KEY, JSON.stringify(roster ?? next));
}
