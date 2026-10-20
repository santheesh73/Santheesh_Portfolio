"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

const COLS = 12;

/**
 * Hairline column guides that draw in on load. Press G to switch to
 * "blueprint mode": stronger guides plus column coordinates.
 */
export function BlueprintGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [blueprint, setBlueprint] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".bp-col", {
        scaleY: 0,
        duration: 1.4,
        ease: EASE.structure,
        stagger: { each: 0.05, from: "center" },
        delay: 0.2,
      });
    },
    { scope: ref },
  );

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
