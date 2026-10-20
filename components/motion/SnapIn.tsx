"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, SIGNAL_OFFSET } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

/**
 * Signal → structure for a block: arrives offset, rotated and blurred,
 * then snaps exactly onto its grid position.
 */
export function SnapIn({
  children,
  className,
  delay = 0,
  seed = 1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Deterministic per-instance jitter so a group doesn't move in lockstep. */
  seed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const s = Math.sin(seed * 12.9898) * 43758.5453;
      const r = s - Math.floor(s); // 0..1
      const dir = r > 0.5 ? 1 : -1;
      gsap.from(el, {
        x: dir * SIGNAL_OFFSET.x * (0.5 + r),
        y: SIGNAL_OFFSET.y * (0.6 + r * 0.6),
        rotate: dir * SIGNAL_OFFSET.rotate * r,
        filter: `blur(${SIGNAL_OFFSET.blur}px)`,
        opacity: 0,
        duration: DUR.reveal,
        delay,
        ease: EASE.structure,
        clearProps: "filter",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
