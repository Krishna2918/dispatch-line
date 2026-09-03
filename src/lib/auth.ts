import { DEMO_DISPATCHER } from "./demo-data";
import { asProfile, type Profile, type Staff } from "./types";

const STAFF_KEY = "dispatch-line-staff";

export function getDemoStaff(): Profile {
  if (typeof window === "undefined") return DEMO_DISPATCHER;
  try {
    const raw = window.localStorage.getItem(STAFF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Staff & Partial<Profile>;
      if (parsed?.id && (parsed.name || parsed.fullName)) {
        return asProfile({
          id: parsed.id,
          name: parsed.name ?? parsed.fullName ?? "Dispatcher",
          role: parsed.role === "admin" ? "admin" : "dispatcher",
        });
      }
    }
  } catch {
    /* ignore */
  }
  return DEMO_DISPATCHER;
}

export function setDemoStaff(profile: Staff | Profile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAFF_KEY, JSON.stringify(asProfile(profile)));
}
