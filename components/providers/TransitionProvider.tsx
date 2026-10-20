"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, SCRAMBLE_GLYPHS } from "@/lib/motion";
import { markHidden, markRevealed } from "@/lib/pageReveal";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { useLenis } from "./LenisProvider";

type Ctx = { navigate: (href: string, label?: string) => void };
const TransitionCtx = createContext<Ctx>({ navigate: () => {} });
export const useTransitionRouter = () => useContext(TransitionCtx);

const COVER = 0.3;
const STAGGER = 0.06;
const HOLD = 0.22;
const LIFT = 0.32;

function labelFor(href: string): string {
  const path = new URL(href, location.href).pathname;
  if (path === "/") return "Index";
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return last.replace(/-/g, " ");
}

/**
 * Route transitions. Intercepts same-origin link clicks (capture phase, before
 * Next's Link handler), wipes a cobalt-then-ink curtain up, flashes the
 * destination name, navigates, then lifts the curtain and releases the page's
 * entrance animations. 0.36 cover + 0.22 hold + 0.32 lift ≈ 0.9 s.
 *
 * Opt out per link with `data-transition="none"` (e.g. the Flip transition into
 * case studies handles its own choreography). Back/forward skip the curtain and
 * restore the previous scroll position.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lenis } = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pending = useRef<string | null>(null);
  const popNav = useRef(false);
  const scrolls = useRef(new Map<string, number>());
  const current = useRef(pathname);
  const firstRender = useRef(true);
  const safety = useRef<number | null>(null);
  const coveredAt = useRef(0);

  const scrollToY = useCallback((y: number) => {
    const l = lenisRef.current;
    if (l) l.scrollTo(y, { immediate: true, force: true });
    window.scrollTo(0, y);
  }, []);

  const lift = useCallback(() => {
    const el = root.current;
    if (!el) return;
    if (safety.current) window.clearTimeout(safety.current);
    const [cobalt, ink] = el.querySelectorAll<HTMLElement>("[data-panel]");
    // Hold the destination name on screen for HOLD before lifting.
    const wait = Math.max(0, coveredAt.current + HOLD * 1000 - performance.now()) / 1000;
    gsap
      .timeline({
        delay: wait,
        onStart: markRevealed,
        onComplete: () => {
          gsap.set(el, { visibility: "hidden", pointerEvents: "none" });
          lenisRef.current?.start();
        },
      })
      .to(label.current, { autoAlpha: 0, yPercent: -40, duration: 0.18, ease: "power2.in" }, 0)
      .to(ink!, { yPercent: -100, duration: LIFT, ease: EASE.signal }, 0.04)
      .to(cobalt!, { yPercent: -100, duration: LIFT, ease: EASE.signal }, 0.1);
  }, []);

  const navigate = useCallback(
    (href: string, name?: string) => {
      const target = new URL(href, location.href);
      if (target.pathname === current.current) {
        const l = lenisRef.current;
        const dest = target.hash || 0;
        if (l) l.scrollTo(dest);
        else if (target.hash) document.querySelector(target.hash)?.scrollIntoView();
        else window.scrollTo(0, 0);
        return;
      }
      scrolls.current.set(current.current, window.scrollY);
      const dest = target.pathname + target.search + target.hash;
      if (prefersReducedMotion() || !root.current) {
        router.push(dest);
        return;
      }
      const el = root.current;
      const [cobalt, ink] = el.querySelectorAll<HTMLElement>("[data-panel]");
      pending.current = dest;
      markHidden();
      lenisRef.current?.stop();
      const text = (name ?? labelFor(href)).toUpperCase();
      gsap.set(el, { visibility: "visible", pointerEvents: "auto" });
      gsap.set([cobalt, ink], { y: 0, yPercent: 100 });
      gsap.set(label.current, { autoAlpha: 0, yPercent: 0, textContent: text });
      gsap
        .timeline()
        .to(cobalt!, { yPercent: 0, duration: COVER, ease: EASE.signal }, 0)
        .to(ink!, { yPercent: 0, duration: COVER, ease: EASE.signal }, STAGGER)
        .to(
          label.current,
          {
            autoAlpha: 1,
            duration: HOLD + 0.1,
            ease: "none",
            scrambleText: { text, chars: SCRAMBLE_GLYPHS, speed: 1 },
          },
          COVER * 0.75,
        )
        .add(() => {
          coveredAt.current = performance.now();
          router.push(dest, { scroll: false });
          // Never leave the curtain down if the route stalls.
          safety.current = window.setTimeout(() => {
            pending.current = null;
            lift();
          }, 2500);
        }, COVER + STAGGER);
    },
    [router, lift],
  );

  // Intercept internal link clicks before Next's <Link> handles them.
  useEffect(() => {
    history.scrollRestoration = "manual";
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      if (a.dataset.transition === "none") return;
      const url = new URL(a.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // in-page anchor
      e.preventDefault();
      e.stopPropagation();
      navigate(a.href, a.dataset.transitionLabel);
    };
    const onPop = () => {
      popNav.current = true;
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, [navigate]);

  // Route committed.
  useEffect(() => {
    const prev = current.current;
    current.current = pathname;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (prev === pathname) return;

    if (pending.current) {
      const hash = new URL(pending.current, location.href).hash;
      pending.current = null;
      const anchor = hash ? document.querySelector<HTMLElement>(hash) : null;
      scrollToY(anchor ? anchor.getBoundingClientRect().top + window.scrollY : 0);
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        lift();
      });
      return;
    }
    // Back/forward or programmatic navigation: no curtain, restore scroll.
    const y = popNav.current ? (scrolls.current.get(pathname) ?? 0) : 0;
    popNav.current = false;
    markRevealed();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      scrollToY(y);
    });
  }, [pathname, lift, scrollToY]);

  return (
    <TransitionCtx.Provider value={{ navigate }}>
      {children}
      <div
        ref={root}
        aria-hidden="true"
        className="invisible fixed inset-0 z-[110] overflow-hidden"
        style={{ pointerEvents: "none" }}
      >
        <div data-panel className="absolute inset-0 bg-signal" />
        <div data-panel className="absolute inset-0 flex items-center justify-center bg-ink">
          <span
            ref={label}
            className="px-4 text-center font-mono text-[clamp(2.5rem,9vw,9rem)] leading-none font-medium tracking-[-0.02em] text-paper"
          />
        </div>
      </div>
    </TransitionCtx.Provider>
  );
}
