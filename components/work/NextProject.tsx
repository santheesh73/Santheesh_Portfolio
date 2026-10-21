"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Loop through case studies: scrolling through fills a rule and the next title
 * compiles from loose to tight; the title is the link. Reduced motion: a plain link.
 */
export function NextProject({ slug, title, pitch, position }: { slug: string; title: string; pitch: string; position: string }) {
  const root = useRef<HTMLElement>(null);
  const href = `/work/${slug}`;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(el);
      // The rule fills and the title compiles as the reader scrolls through. It never
      // navigates on its own: the contact footer sits below, and readers must reach it.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.3 },
        })
        .fromTo(q("[data-fill]"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
        .fromTo(q("[data-title]"), { letterSpacing: "0.04em", opacity: 0.5, y: 40 }, { letterSpacing: "-0.045em", opacity: 1, y: 0, duration: 1 }, 0);
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Next project" className="relative motion-safe:h-[150svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-8 overflow-hidden px-[var(--gutter)]">
        <p className="t-label flex justify-between text-ink-3-text">
          <span>Next project · {position}</span>
          <span className="hidden md:inline">Open the case study →</span>
        </p>
        <Link href={href} data-transition-label={title} data-cursor="Next" className="block">
          <span
            data-title
            className="block font-display text-[clamp(3rem,9vw,10rem)] leading-[0.88] font-semibold tracking-[-0.045em] break-words"
          >
            {title}
          </span>
        </Link>
        <p className="max-w-[44ch] text-ink-2">{pitch}</p>
        <div aria-hidden="true" className="relative h-px bg-rule">
          <span data-fill className="absolute inset-0 origin-left scale-x-0 bg-ink motion-reduce:hidden" />
        </div>
      </div>
    </section>
  );
}
