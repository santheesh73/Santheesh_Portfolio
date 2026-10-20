"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

type LenisCtx = {
  lenis: Lenis | null;
  /** Scroll to a target; falls back to native scrolling when Lenis is off. */
  scrollTo: (target: number | string | HTMLElement, opts?: { immediate?: boolean }) => void;
};

const Ctx = createContext<LenisCtx>({ lenis: null, scrollTo: () => {} });

export function useLenis() {
  return useContext(Ctx);
}

/**
 * One Lenis instance for the app, ticked by gsap.ticker so Lenis and
 * ScrollTrigger share one clock. Disabled under prefers-reduced-motion.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = instance;
    setLenis(instance);

    instance.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Re-measure once fonts are in; pinned scenes depend on text metrics.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const scrollTo: LenisCtx["scrollTo"] = (target, opts) => {
    const l = lenisRef.current;
    if (l) {
      l.scrollTo(target, { immediate: opts?.immediate, duration: 1.4 });
      return;
    }
    if (typeof target === "number") window.scrollTo({ top: target });
    else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView();
    }
  };

  return <Ctx.Provider value={{ lenis, scrollTo }}>{children}</Ctx.Provider>;
}
