"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, loadDrawSVG } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Draws an ArchitectureDiagram as it scrolls through the viewport: node outlines
 * trace in column by column, then the edges between them (stroke-dashoffset scrub).
 */
export function DrawOnScroll({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let ctx: gsap.Context | null = null;
    let cancelled = false;
    loadDrawSVG().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const q = gsap.utils.selector(el);
        const nodes = q("[data-draw='node']");
        const rects = q("[data-draw='node'] rect, [data-draw='node'] line");
        const labels = q("[data-draw='node'] text");
        const edges = q("[data-draw='edge']");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.5 },
        });
        // dashed strokes keep their dash pattern; only solid ones get drawn
        const solid = (els: Element[]) => els.filter((e) => !e.getAttribute("stroke-dasharray"));
        const dashed = (els: Element[]) => els.filter((e) => e.getAttribute("stroke-dasharray"));
        tl.from(solid(rects), { drawSVG: 0, fillOpacity: 0, duration: 1, stagger: 0.08 }, 0)
          .from(dashed(rects), { opacity: 0, duration: 0.6, stagger: 0.08 }, 0)
          .from(labels, { opacity: 0, y: 4, duration: 0.5, stagger: 0.03 }, 0.3)
          .from(solid(edges), { drawSVG: 0, duration: 0.8, stagger: 0.1 }, 0.6)
          .from(dashed(edges), { opacity: 0, duration: 0.6, stagger: 0.1 }, 0.6);
        void nodes;
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);
  return <div ref={root}>{children}</div>;
}
