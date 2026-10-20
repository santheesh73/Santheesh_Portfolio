"use client";

import { useIST } from "@/lib/useIST";
import { cn } from "@/lib/cn";

/** Live IST clock. Renders a fixed-width placeholder until mounted. */
export function Clock({ className, prefix = "IST" }: { className?: string; prefix?: string }) {
  const now = useIST();
  return (
    <span className={cn("t-label tabular-nums", className)}>
      {prefix} <time suppressHydrationWarning>{now ?? "--:--:--"}</time>
    </span>
  );
}
