"use client";

import { useEffect, useState } from "react";
import { formatIST } from "./time";

/** Live IST clock. Returns null until mounted to avoid hydration mismatch. */
export function useIST(): string | null {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(formatIST(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
