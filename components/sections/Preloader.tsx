"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, SCRAMBLE_GLYPHS } from "@/lib/motion";
import { markRevealed } from "@/lib/pageReveal";
import { getLenis } from "@/lib/lenis";

import { BOOT_KEY } from "@/lib/boot";
const MIN = 1.1; // s, shortest count
const MAX = 1.3; // s, longest we wait on load before finishing anyway

/**
 * Boot sequence, first visit per session only (≤ 2.2 s). Mono log from the
 * GitHub README, a 000 → 100 counter whose digits jitter (signal) and then snap
 * into a ruled grid (structure), then the ink curtain splits to reveal the page.
 * Server-rendered so it covers the first paint; an inline script hides it
 * before paint for returning visits and reduced motion.
 */
export function Preloader({ log }: { log: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const skip = html.classList.contains("booted") || !html.classList.contains("js-motion");
    if (skip || !root.current) {
      setGone(true);
      markRevealed();
      return;
    }
    html.classList.add("is-booting");
    getLenis()?.stop();
    const el = root.current;
    const q = gsap.utils.selector(el);
    const digits = q("[data-digit]") as HTMLElement[];
    const counter = { v: 0 };
    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    const start = performance.now();

    const jitter = () => {
      digits.forEach((d) =>
        gsap.set(d, {
          x: gsap.utils.random(-14, 14),
          y: gsap.utils.random(-10, 10),
          rotate: gsap.utils.random(-6, 6),
          filter: `blur(${gsap.utils.random(0, 2.5)}px)`,
        }),
      );
    };
    const render = () => {
      const s = String(Math.round(counter.v)).padStart(3, "0");
      digits.forEach((d, i) => (d.textContent = s[i] ?? "0"));
    };

    const tl = gsap.timeline({ paused: true });
    // Log lines resolve one after another.
    q("[data-log]").forEach((line, i) => {
      tl.fromTo(
        line,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.32,
          ease: "none",
          scrambleText: { text: log[i] ?? "", chars: SCRAMBLE_GLYPHS, speed: 1 },
        },
        i * 0.3,
      );
    });
    tl.to(
      counter,
      {
        v: 92,
        duration: MIN,
        ease: "power2.inOut",
        onUpdate: () => {
          render();
          jitter();
        },
      },
      0,
    );
    tl.add(() => {
      tl.pause();
      const finish = () => {
        gsap
          .timeline({
            onComplete: () => {
              try {
                sessionStorage.setItem(BOOT_KEY, "1");
              } catch {}
              html.classList.add("booted");
              html.classList.remove("is-booting");
              getLenis()?.start();
              setGone(true);
            },
          })
          .to(counter, { v: 100, duration: 0.18, ease: "none", onUpdate: render })
          // structure: digits snap exactly into their cells, rules draw in
          .to(digits, {
            x: 0,
            y: 0,
            rotate: 0,
            filter: "blur(0px)",
            duration: 0.3,
            ease: EASE.structure,
            stagger: 0.03,
          })
          .fromTo(
            q("[data-rule]"),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.3, ease: EASE.structure },
            "<",
          )
          .fromTo(
            q("[data-rule-v]"),
            { scaleY: 0 },
            { scaleY: 1, duration: 0.3, ease: EASE.structure },
            "<",
          )
          .add(markRevealed, "+=0.02")
          .to(q("[data-half='top']"), { yPercent: -100, duration: 0.6, ease: EASE.signal }, "<")
          .to(q("[data-half='bottom']"), { yPercent: 100, duration: 0.6, ease: EASE.signal }, "<");
      };
      const waited = (performance.now() - start) / 1000;
      if (loaded || waited >= MIN + MAX) finish();
      else {
        const creep = gsap.to(counter, {
          v: 99,
          duration: MAX,
          ease: "power1.out",
          onUpdate: () => {
            render();
            jitter();
          },
        });
        const done = () => {
          creep.kill();
          finish();
        };
        const t = window.setTimeout(done, MAX * 1000);
        window.addEventListener(
          "load",
          () => {
            window.clearTimeout(t);
            done();
          },
          { once: true },
        );
      }
    }, MIN);
    tl.play();

    return () => {
      window.removeEventListener("load", onLoad);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <div ref={root} data-preloader aria-hidden="true" className="fixed inset-0 z-[130]">
      <div data-half="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-half="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="absolute inset-0 flex flex-col justify-between p-[var(--gutter)] text-paper">
        <div className="space-y-1.5 pt-6 font-mono text-xs tracking-[0.08em] text-paper/80 md:text-sm">
          {log.map((line) => (
            <p key={line} data-log className="invisible">
              {line}
            </p>
          ))}
        </div>
        <div className="flex items-end justify-between gap-6">
          <p className="t-label text-paper/60">Santheesh S — signal → structure</p>
          <div className="relative grid grid-cols-3 font-display text-[clamp(5rem,16vw,15rem)] leading-[0.85] font-semibold tabular-nums">
            <span
              data-rule
              className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-paper/40"
            />
            <span
              data-rule
              className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-paper/40"
            />
            {[0, 1, 2].map((i) => (
              <span key={i} className="relative flex w-[0.62em] justify-center py-[0.08em]">
                <span
                  data-rule-v
                  className="absolute top-0 left-0 h-full w-px origin-top scale-y-0 bg-paper/40"
                />
                {i === 2 && (
                  <span
                    data-rule-v
                    className="absolute top-0 right-0 h-full w-px origin-bottom scale-y-0 bg-paper/40"
                  />
                )}
                <span data-digit className="inline-block">
                  0
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
