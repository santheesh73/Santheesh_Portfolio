"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE } from "@/lib/motion";
import { ENTROPY_REST, heroState } from "@/lib/heroState";
import { whenRevealed } from "@/lib/pageReveal";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Scramble } from "@/components/motion/Scramble";
import { Chip } from "@/components/ui/Chip";
import { Clock } from "@/components/layout/Clock";
import { SignalStatic } from "@/components/webgl/SignalStatic";

const SignalField = dynamic(() => import("@/components/webgl/SignalField"), { ssr: false });

type Props = {
  name: string;
  thesis: string;
  roles: string[];
  location: string;
};

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hero. A particle field spells the name as loose signal; scrolling compiles it:
 * entropy is scrubbed from 0.84 to 0.00 and the points lock onto an exact grid.
 * The headline is real HTML (the LCP element) and never waits on WebGL.
 */
export function Hero({ name, thesis, roles, location }: Props) {
  const root = useRef<HTMLElement>(null);
  const caption = useRef<HTMLSpanElement>(null);
  const stateLabel = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<"pending" | "webgl" | "static">("pending");
  const lines = useRef(name.toUpperCase().split(" ")).current;

  useEffect(() => {
    setMode(prefersReducedMotion() || !hasWebGL() ? "static" : "webgl");
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      heroState.entropy = ENTROPY_REST;
      const write = (e: number) => {
        if (caption.current) caption.current.textContent = e.toFixed(2);
        if (stateLabel.current)
          stateLabel.current.textContent = e < 0.005 ? "structure · locked" : "signal";
      };

      if (prefersReducedMotion()) {
        heroState.arrival = 0;
        heroState.entropy = 0;
        write(0);
        return;
      }

      heroState.arrival = 1;
      const stopWaiting = whenRevealed(() => {
        gsap.to(heroState, { arrival: 0, duration: 2.4, ease: EASE.signal, delay: 0.1 });
      });

      const io = new IntersectionObserver(([entry]) => {
        heroState.active = Boolean(entry?.isIntersecting);
      });
      io.observe(el);

      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (ctx) => {
        const desktop = Boolean(ctx.conditions?.desktop);
        const proxy = { e: ENTROPY_REST };
        gsap.to(proxy, {
          e: 0,
          ease: "none",
          onUpdate: () => {
            heroState.entropy = proxy.e;
            write(proxy.e);
          },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: desktop ? "+=100%" : "+=70%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
          },
        });
      });
      ScrollTrigger.refresh();
      return () => {
        stopWaiting();
        io.disconnect();
        mm.revert();
        heroState.active = false;
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[560px] overflow-hidden"
      data-cursor-tone="signal"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {mode === "webgl" && <SignalField lines={lines} />}
        {mode === "static" && <SignalStatic lines={lines} />}
      </div>

      {/* registration marks + margin annotations */}
      <span
        aria-hidden="true"
        className="crosshair top-[calc(var(--header-h)+12px)] left-[var(--gutter)]"
      />
      <span
        aria-hidden="true"
        className="crosshair top-[calc(var(--header-h)+12px)] right-[var(--gutter)]"
      />
      <span aria-hidden="true" className="crosshair right-[var(--gutter)] bottom-6" />
      <div
        aria-hidden="true"
        className="t-label absolute top-1/2 left-[var(--gutter)] hidden origin-left -translate-y-1/2 -rotate-90 text-ink-3-text lg:block"
        style={{ translate: "8px 0" }}
      >
        FIG.01 — Signal field
      </div>

      <div className="grid-12 pointer-events-none relative z-10 h-full content-end gap-y-6 pb-[max(2rem,5svh)]">
        <div className="col-span-full flex items-center justify-between gap-4 md:col-span-6 md:col-start-7 md:justify-end">
          <p className="t-label text-ink-2" aria-live="off">
            <span ref={stateLabel}>signal</span> · entropy{" "}
            <span ref={caption} className="text-signal tabular-nums">
              {ENTROPY_REST.toFixed(2)}
            </span>{" "}
            → 0.00
          </p>
        </div>

        <h1 id="hero-title" className="col-span-full md:col-span-8">
          <span className="sr-only">{name}. </span>
          <SplitReveal as="span" trigger="mount" className="t-display-sm block">
            {thesis.split(/(?<=\.)\s+/).map((sentence) => (
              <span key={sentence} className="block text-balance">
                {sentence}
              </span>
            ))}
          </SplitReveal>
        </h1>

        <div className="pointer-events-auto col-span-full flex flex-col gap-3 md:col-span-4 md:col-start-9 md:items-end md:self-end md:text-right">
          <Scramble
            as="p"
            trigger="mount"
            text={roles.join(" · ")}
            className="text-ink"
            delay={0.2}
          />
          <p className="t-label flex flex-wrap gap-x-3 text-ink-2 md:justify-end">
            <span>{location}</span>
            <Clock />
          </p>
          <Chip status="open" />
        </div>
      </div>
    </section>
  );
}
