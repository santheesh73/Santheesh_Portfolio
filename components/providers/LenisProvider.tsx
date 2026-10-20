"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { setLenis as setGlobalLenis } from "@/lib/lenis";
import { afterIdle } from "@/lib/idle";

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
    let teardown: (() => void) | null = null;
    // Created once the page has loaded and gone idle: constructing Lenis measures
    // the document, which is a long forced layout during hydration on slow phones.
    const cancel = afterIdle(() => {
      const instance = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false,
      });
      lenisRef.current = instance;
      setLenis(instance);
      setGlobalLenis(instance);
      // The preloader may already be running; hold scroll until it finishes.
      if (document.documentElement.classList.contains("is-booting")) instance.stop();

      instance.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      teardown = () => {
        gsap.ticker.remove(raf);
        instance.destroy();
        setGlobalLenis(null);
        lenisRef.current = null;
        setLenis(null);
      };
    });
    return () => {
      cancel();
      teardown?.();
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
