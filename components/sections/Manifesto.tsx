"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { SectionLabel } from "@/components/ui/SectionLabel";

const MARKED = new Set(["component", "reliable"]);

/**
 * Pinned manifesto. The sentence starts in grey (--ink-3-text, for contrast); each word turns --ink as
 * you scroll (read → decided). "component" and "reliable" get a cobalt
 * underline that draws in when they are reached.
 */
export function Manifesto({ sentence, source, index, total }: { sentence: string; source: string; index: number; total: number }) {
  const root = useRef<HTMLElement>(null);
  const words = sentence.split(" ");

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(el);
      const wordEls = q("[data-word]");
      // start one step darker than --ink-3 so the unread words still pass AA for large text
      gsap.set(wordEls, { color: "var(--ink-3-text)" });
      gsap.set(q("[data-underline]"), { scaleX: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.3}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
        },
      });
      wordEls.forEach((w, i) => {
        tl.to(w, { color: "var(--ink)", duration: 1 }, i * 0.6);
        const line = (w as HTMLElement).querySelector("[data-underline]");
        if (line) tl.to(line, { scaleX: 1, duration: 1.4, ease: "power2.out" }, i * 0.6 + 0.4);
      });
      tl.to({}, { duration: 1.5 }); // hold the finished sentence before unpinning
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="manifesto-title"
      className="relative flex min-h-[100svh] flex-col justify-center bg-paper py-24"
    >
      <div className="grid-12 gap-y-10">
        <SectionLabel index={index} total={total} text="Thesis" className="col-span-full" />
        <h2 id="manifesto-title" className="t-section col-span-full max-w-[17ch] text-ink lg:col-span-11">
          {words.map((w, i) => {
            const clean = w.replace(/[^a-z]/gi, "").toLowerCase();
            const marked = MARKED.has(clean);
            return (
              <span key={i}>
                <span data-word className="relative inline-block">
                  {w}
                  {marked && (
                    <span
                      data-underline
                      aria-hidden="true"
                      className="absolute right-0 -bottom-[0.06em] left-0 h-[0.07em] origin-left bg-signal"
                    />
                  )}
                </span>{" "}
              </span>
            );
          })}
        </h2>
        <div className="col-span-full flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-4 md:col-span-6 md:col-start-7">
          <p className="t-label text-ink-3-text">Source — {source}</p>
          <p className="t-label text-ink-2">read → decide</p>
        </div>
      </div>
    </section>
  );
}
