"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE, SIGNAL_OFFSET } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

/** Tiles arrive loose (offset, tilted, blurred) and snap onto the grid in batches. */
export function SnapGrid({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]", root.current);
      gsap.set(tiles, { autoAlpha: 0 });
      ScrollTrigger.batch(tiles, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            {
              autoAlpha: 0,
              y: SIGNAL_OFFSET.y,
              x: () => gsap.utils.random(-SIGNAL_OFFSET.x, SIGNAL_OFFSET.x),
              rotate: () => gsap.utils.random(-SIGNAL_OFFSET.rotate, SIGNAL_OFFSET.rotate),
              filter: `blur(${SIGNAL_OFFSET.blur}px)`,
            },
            {
              autoAlpha: 1,
              y: 0,
              x: 0,
              rotate: 0,
              filter: "blur(0px)",
              duration: 0.9,
              ease: EASE.structure,
              stagger: 0.04,
              clearProps: "filter,transform",
            },
          ),
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className={cn("grid-12 grid-flow-dense", className)}>
      {children}
    </div>
  );
}
