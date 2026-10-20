"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

type Mode = { label: string | null; signal: boolean; active: boolean; dark: boolean };

/**
 * Ink dot + lagging ring, pointer:fine only. The ring grows over interactive
 * elements and shows a label from `data-cursor="View case"`; it turns cobalt over
 * anything marked `data-cursor-tone="signal"` (model-related things).
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>({
    label: null,
    signal: false,
    active: false,
    dark: false,
  });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const reduced = prefersReducedMotion();
    const lag = reduced ? 0.001 : 0.45;
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3.out" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3.out" });
    const rx = gsap.quickTo(ring.current, "x", { duration: lag, ease: "power3.out" });
    const ry = gsap.quickTo(ring.current, "y", { duration: lag, ease: "power3.out" });
    let shown = false;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const target = t?.closest<HTMLElement>(
        "[data-cursor], a, button, [role='button'], summary, label",
      );
      const toned = t?.closest<HTMLElement>("[data-cursor-tone]");
      setMode({
        label: target?.dataset.cursor ?? null,
        signal: toned?.dataset.cursorTone === "signal",
        active: Boolean(target),
        dark: Boolean(t?.closest("[data-tone='ink']")),
      });
    };
    const leave = () => {
      shown = false;
      gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.2 });
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;
  const big = Boolean(mode.label);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120]">
      <div
        ref={ring}
        className="invisible absolute top-0 left-0 opacity-0"
        style={{ willChange: "transform" }}
      >
        <div
          className={cn(
            "flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-[var(--ease-structure)]",
            mode.signal ? "border-signal" : mode.dark ? "border-paper" : "border-ink",
            big ? "size-24" : mode.active ? "size-12" : "size-8",
            big && (mode.signal ? "bg-signal" : mode.dark ? "bg-paper" : "bg-ink"),
          )}
        >
          {big && (
            <span
              className={cn(
                "px-2 text-center font-mono text-[10px] leading-tight tracking-[0.12em] uppercase",
                mode.dark && !mode.signal ? "text-ink" : "text-paper",
              )}
            >
              {mode.label}
            </span>
          )}
        </div>
      </div>
      <div ref={dot} className="invisible absolute top-0 left-0 opacity-0">
        <div
          className={cn(
            "size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity",
            mode.signal ? "bg-signal" : mode.dark ? "bg-paper" : "bg-ink",
            big && "opacity-0",
          )}
        />
      </div>
    </div>
  );
}
