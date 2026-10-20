"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/motion";
import { heroState, ENTROPY_REST } from "@/lib/heroState";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { hasWebGL } from "@/lib/webgl";
import { SignalStatic } from "@/components/webgl/SignalStatic";
import { useTransitionRouter } from "@/components/providers/TransitionProvider";

const SignalField = dynamic(() => import("@/components/webgl/SignalField"), { ssr: false });

const LOST = ["404"];
const HOME = ["→ HOME"];

/**
 * 404: the particle field spells "404" as loose signal. Any scroll, swipe, click
 * or key compiles it into "→ HOME"; the next click goes there.
 */
export function NotFoundField() {
  const [mode, setMode] = useState<"pending" | "webgl" | "static">("pending");
  const [lines, setLines] = useState(LOST);
  const [locked, setLocked] = useState(false);
  const caption = useRef<HTMLSpanElement>(null);
  const { navigate } = useTransitionRouter();

  useEffect(() => {
    const reduced = prefersReducedMotion();
    setMode(reduced || !hasWebGL() ? "static" : "webgl");
    heroState.active = true;
    heroState.entropy = reduced ? 0 : ENTROPY_REST;
    heroState.arrival = reduced ? 0 : 1;
    if (caption.current) caption.current.textContent = heroState.entropy.toFixed(2);
    const t = reduced ? null : gsap.to(heroState, { arrival: 0, duration: 2, ease: EASE.signal, delay: 0.2 });
    return () => {
      t?.kill();
      heroState.active = false;
    };
  }, []);

  const compile = () => {
    if (locked) return;
    setLocked(true);
    setLines(HOME);
    if (prefersReducedMotion()) {
      heroState.entropy = 0;
      if (caption.current) caption.current.textContent = "0.00";
      return;
    }
    gsap.killTweensOf(heroState);
    heroState.arrival = 0.55;
    gsap.to(heroState, {
      arrival: 0,
      entropy: 0,
      duration: 1.4,
      ease: EASE.structure,
      onUpdate: () => {
        if (caption.current) caption.current.textContent = heroState.entropy.toFixed(2);
      },
    });
  };

  // Scroll / swipe / key compiles the field (the page itself does not scroll far).
  useEffect(() => {
    if (locked) return;
    const go = () => compile();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown"].includes(e.key)) go();
    };
    window.addEventListener("wheel", go, { passive: true, once: true });
    window.addEventListener("touchmove", go, { passive: true, once: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", go);
      window.removeEventListener("touchmove", go);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  return (
    <section aria-labelledby="nf-title" className="relative h-[100svh] min-h-[560px] overflow-hidden" data-cursor-tone="signal">
      <div aria-hidden="true" className="absolute inset-0">
        {mode === "webgl" && <SignalField lines={lines} offset={-0.02} />}
        {mode === "static" && <SignalStatic lines={lines} offset={-0.02} />}
      </div>
      {/* the whole field is one control: compile, then go home */}
      <button
        type="button"
        aria-label={locked ? "Go to the index" : "Compile the field into a link home"}
        data-cursor={locked ? "Home" : "Compile"}
        onClick={() => (locked ? navigate("/", "Index") : compile())}
        className="absolute inset-0 cursor-pointer focus-visible:outline-offset-[-8px]"
      />

      <div className="grid-12 pointer-events-none absolute inset-x-0 bottom-0 items-end gap-y-6 pb-10">
        <div className="col-span-full flex flex-col gap-4 md:col-span-7">
          <p className="t-label text-ink-3-text">
            {locked ? "structure · locked" : "signal"} · entropy <span ref={caption} className="text-signal tabular-nums">0.84</span>
          </p>
          <h1 id="nf-title" className="t-display-sm max-w-[22ch]">
            <span className="sr-only">404. </span>This page isn&apos;t part of the system.
          </h1>
          <p className="t-label text-ink-2">{locked ? "Click the field to go home." : "Scroll or click to compile."}</p>
        </div>
        <div className="pointer-events-auto col-span-full md:col-span-5 md:text-right">
          <Link href="/" data-transition-label="Index" className="t-label underline decoration-rule underline-offset-4 hover:decoration-ink">
            Back to the index →
          </Link>
        </div>
      </div>
    </section>
  );
}
