"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

/** Subtle magnetic pull toward the pointer, capped at `strength` px (≤12). */
export function Magnetic({
  children,
  className,
  strength = 10,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
      const max = Math.min(strength, 12);
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        xTo(gsap.utils.clamp(-1, 1, dx) * max);
        yTo(gsap.utils.clamp(-1, 1, dy) * max);
      };
      const leave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "expo.out" });
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </span>
  );
}
