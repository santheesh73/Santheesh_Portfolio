"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE } from "@/lib/motion";
import { whenRevealed } from "@/lib/pageReveal";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Re-mounts on every navigation. Plays the page's entrance for elements marked
 * [data-enter] once the preloader / route curtain has lifted.
 */
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const items = ref.current?.querySelectorAll("[data-enter]");
      if (!items?.length || prefersReducedMotion()) return;
      // Under the preloader / route curtain the items stay painted (they are covered,
      // and the case-study media stays an early LCP candidate); the from-state applies at the reveal.
      return whenRevealed(() => {
        gsap.from(items, {
          y: 24,
          autoAlpha: 0,
          duration: DUR.reveal,
          ease: EASE.structure,
          stagger: 0.06,
        });
      });
    },
    { scope: ref },
  );
  return <div ref={ref}>{children}</div>;
}
