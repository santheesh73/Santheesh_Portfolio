"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { useTransitionRouter } from "@/components/providers/TransitionProvider";

/**
 * Infinite loop through case studies: scrolling past the end fills a rule and the
 * next title compiles from loose to tight; at the end the transition fires.
 * Reduced motion: a plain link.
 */
export function NextProject({ slug, title, pitch, position }: { slug: string; title: string; pitch: string; position: string }) {
  const root = useRef<HTMLElement>(null);
  const { navigate } = useTransitionRouter();
  const href = `/work/${slug}`;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(el);
      // Fire only after the reader has actually scrolled through the section; a
      // route change can briefly report progress 1 before the new page has settled.
      let fired = false;
      let sawStart = false;
      let userScrolled = false;
      const onInput = () => (userScrolled = true);
      const inputs = ["wheel", "touchmove", "keydown"] as const;
      inputs.forEach((t) => window.addEventListener(t, onInput, { passive: true }));
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
            onUpdate: (self) => {
              if (self.progress < 0.9) sawStart = true;
              if (userScrolled && sawStart && !fired && self.progress > 0.995 && self.direction === 1) {
                fired = true;
                navigate(href, title);
              }
            },
          },
        })
        .fromTo(q("[data-fill]"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
        .fromTo(q("[data-title]"), { letterSpacing: "0.04em", opacity: 0.25, y: 40 }, { letterSpacing: "-0.045em", opacity: 1, y: 0, duration: 1 }, 0);
      return () => inputs.forEach((t) => window.removeEventListener(t, onInput));
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Next project" className="relative motion-safe:h-[200svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-8 overflow-hidden px-[var(--gutter)]">
        <p className="t-label flex justify-between text-ink-3-text">
          <span>Next project · {position}</span>
          <span className="hidden md:inline motion-reduce:hidden">Keep scrolling</span>
        </p>
        <Link href={href} data-transition-label={title} data-cursor="Next" className="block">
          <span
            data-title
            className="block font-display text-[clamp(3.5rem,15vw,17rem)] leading-[0.88] font-semibold tracking-[-0.045em] break-words"
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
