"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { gsap, loadFlip, ScrollTrigger } from "@/lib/gsap";
import { EASE, SCRAMBLE_GLYPHS } from "@/lib/motion";
import { markHidden, markRevealed } from "@/lib/pageReveal";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { useLenis } from "./LenisProvider";

type Ctx = {
  navigate: (href: string, label?: string) => void;
  navigateFlip: (href: string, source: HTMLElement, id: string) => void;
};
const TransitionCtx = createContext<Ctx>({ navigate: () => {}, navigateFlip: () => {} });
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
  const backdrop = useRef<HTMLDivElement>(null);
  const flip = useRef<{ id: string; clone: HTMLElement; source: HTMLElement } | null>(null);

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

  /**
   * Shared-element transition into a case study (GSAP Flip). The clicked plate's
   * media is cloned into a fixed layer above a paper backdrop, the route
   * changes underneath, then Flip.fit moves the clone onto the case hero's
   * `[data-flip-target=id]` and hands over. A persistent overlay was chosen over
   * the View Transitions API: in Next 15 that needs an experimental flag and
   * React canary, while this works in every browser today.
   */
  const navigateFlip = useCallback(
    (href: string, source: HTMLElement, id: string) => {
      const target = new URL(href, location.href);
      if (prefersReducedMotion() || !backdrop.current || target.pathname === current.current) {
        navigate(href, id);
        return;
      }
      void loadFlip();
      scrolls.current.set(current.current, window.scrollY);
      const rect = source.getBoundingClientRect();
      const clone = source.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("video").forEach((v) => v.removeAttribute("autoplay"));
      Object.assign(clone.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: "0",
        zIndex: "109",
        filter: "none",
        transform: "none",
      });
      document.body.appendChild(clone);
      source.style.visibility = "hidden";
      flip.current = { id, clone, source };
      pending.current = target.pathname + target.search;
      markHidden();
      lenisRef.current?.stop();
      gsap.set(backdrop.current, { visibility: "visible", pointerEvents: "auto" });
      gsap.fromTo(
        backdrop.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: EASE.signal },
      );
      gsap.to(clone, {
        scale: 1.03,
        duration: 0.35,
        ease: EASE.signal,
        onComplete: () => {
          router.push(pending.current!, { scroll: false });
          safety.current = window.setTimeout(() => landFlip(), 2500);
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, navigate],
  );

  const landFlip = useCallback(() => {
    const f = flip.current;
    if (!f) return;
    if (safety.current) window.clearTimeout(safety.current);
    flip.current = null;
    pending.current = null;
    const target = document.querySelector<HTMLElement>(`[data-flip-target="${f.id}"]`);
    const finish = () => {
      if (target) target.style.visibility = "";
      f.clone.remove();
      gsap.set(backdrop.current, { visibility: "hidden", pointerEvents: "none" });
      lenisRef.current?.start();
      ScrollTrigger.refresh();
    };
    markRevealed();
    gsap.to(backdrop.current, { autoAlpha: 0, duration: 0.5, delay: 0.2, ease: EASE.signal });
    if (!target) {
      gsap.to(f.clone, { autoAlpha: 0, duration: 0.3, onComplete: finish });
      return;
    }
    target.style.visibility = "hidden";
    gsap.set(f.clone, { scale: 1 });
    loadFlip()
      .then((Flip) =>
        Flip.fit(f.clone, target, {
          duration: 0.8,
          ease: EASE.structure,
          scale: false,
          onComplete: finish,
        }),
      )
      .catch(finish);
  }, []);

  // Intercept internal link clicks before Next's <Link> handles them.
  useEffect(() => {
    history.scrollRestoration = "manual";
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      if (a.dataset.transition === "none") return;
      if (a.dataset.transition === "flip") {
        const source = a.querySelector<HTMLElement>("[data-flip-source]");
        if (source && a.dataset.flipId) {
          e.preventDefault();
          e.stopPropagation();
          navigateFlip(a.href, source, a.dataset.flipId);
          return;
        }
      }
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
  }, [navigate, navigateFlip]);

  // Route committed.
  useEffect(() => {
    const prev = current.current;
    current.current = pathname;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (prev === pathname) return;

    if (flip.current) {
      scrollToY(0);
      requestAnimationFrame(() => requestAnimationFrame(landFlip));
      return;
    }
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
  }, [pathname, lift, scrollToY, landFlip]);

  return (
    <TransitionCtx.Provider value={{ navigate, navigateFlip }}>
      {children}
      <div
        ref={backdrop}
        aria-hidden="true"
        className="invisible fixed inset-0 z-[108] bg-paper"
        style={{ pointerEvents: "none" }}
      />
      <div
        ref={root}
        aria-hidden="true"
        className="invisible fixed inset-0 z-[110] overflow-hidden"
        style={{ pointerEvents: "none" }}
      >
        <div data-panel className="absolute inset-0 bg-signal" />
        <div data-panel className="tone-ink absolute inset-0 flex items-center justify-center bg-ink">
          <span
            ref={label}
            className="px-4 text-center font-mono text-[clamp(2.25rem,6vw,6rem)] leading-none font-medium tracking-[-0.02em] text-paper"
          />
        </div>
      </div>
    </TransitionCtx.Provider>
  );
}
