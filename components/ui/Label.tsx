import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Static mono annotation (FIG.02 — DETERMINISTIC CORE). Use <Scramble> for animated ones. */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("t-label text-ink-3-text", className)}>{children}</span>;
}
