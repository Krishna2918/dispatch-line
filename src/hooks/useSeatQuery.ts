"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { parseSeats } from "@/lib/pricing";

export function useSeatQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const seats = useMemo(() => parseSeats(searchParams.get("seats") ?? undefined), [searchParams]);

  const setSeats = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("seats", String(parseSeats(String(next))));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { seats, setSeats };
}
