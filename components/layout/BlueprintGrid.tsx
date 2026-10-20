"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

const COLS = 12;

/**
 * Hairline column guides that draw in on load (a CSS animation, staggered out
 * from the centre, so it costs no script at hydration). Press G to switch to
 * "blueprint mode": stronger guides plus column coordinates.
 */
export function BlueprintGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [blueprint, setBlueprint] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "g" && e.key !== "G") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      setBlueprint((b) => !b);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-blueprint={blueprint ? "on" : "off"}
      className="grid-12 pointer-events-none fixed inset-0 z-[1] h-dvh"
    >
      {Array.from({ length: COLS }, (_, i) => (
        <div
          key={i}
          style={{ "--bp-i": Math.abs(i - (COLS - 1) / 2) } as CSSProperties}
          className={cn(
            "bp-col relative h-full origin-top border-x transition-colors duration-500",
            i >= 4 && "max-md:hidden",
            blueprint ? "border-signal/25 bg-signal/[0.025]" : "border-rule/45",
          )}
        >
          {blueprint && (
            <span className="absolute top-[calc(var(--header-h)+8px)] left-1 font-mono text-[9px] tracking-widest text-signal">
              C{String(i + 1).padStart(2, "0")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
