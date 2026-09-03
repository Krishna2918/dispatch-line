"use client";

import { useCallback, useEffect, useState } from "react";
import { getDemoStaff, setDemoStaff } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export const DEMO_ENTERED_KEY = "dispatchline.demo.entered";

export function hasDemoEntered(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(DEMO_ENTERED_KEY) === "1";
}

export function markDemoEntered(): void {
  sessionStorage.setItem(DEMO_ENTERED_KEY, "1");
}

export function useDemoSession() {
  const [staff, setStaffState] = useState<Profile>(() => getDemoStaff());
  const [entered, setEntered] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStaffState(getDemoStaff());
    setEntered(hasDemoEntered());
    setHydrated(true);
  }, []);

  const setStaff = useCallback((next: Profile) => {
    setDemoStaff(next);
    markDemoEntered();
    setStaffState(next);
    setEntered(true);
  }, []);

  const enterAs = useCallback((next: Profile) => {
    setDemoStaff(next);
    markDemoEntered();
    setStaffState(next);
    setEntered(true);
  }, []);

  return { staff, setStaff, enterAs, entered, hydrated };
}
