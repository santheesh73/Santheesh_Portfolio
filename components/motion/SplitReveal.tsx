"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";
import { isRevealed, whenRevealed } from "@/lib/pageReveal";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** "scroll" reveals on viewport entry; "mount" plays immediately (after `delay`). */
  trigger?: "scroll" | "mount";
  delay?: number;
  /** Split depth. Lines always get masks; words add a second, finer stagger. */
  by?: "lines" | "words";
  id?: string;
};

/**
 * Masked line reveal: lines rise from 110% inside an overflow mask.
 * Text stays real, selectable HTML. Reduced motion: renders final state.
 */
export function SplitReveal({
  as: Tag = "div",
  children,
  className,
  trigger = "scroll",
  delay = 0,
  by = "lines",
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;
      if (prefersReducedMotion()) {
        el.dataset.split = "done";
        return;
      }
      let pending: (() => void) | null = null;
      let split: SplitText | null = null;
      const setup = contextSafe(() => {
        split = SplitText.create(el, {
          type: by === "words" ? "lines,words" : "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          // text stays as real DOM text in the split spans; aria-label on a plain element is not allowed
          aria: "none",
          onSplit(self) {
            el.dataset.split = "done";
            const targets = by === "words" ? self.words : self.lines;
            const play = () =>
              gsap.from(targets, {
                yPercent: 110,
                duration: DUR.reveal,
                ease: EASE.structure,
                stagger: by === "words" ? STAGGER.words : STAGGER.lines,
                delay,
                scrollTrigger:
                  trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
              });
            // Under the preloader / route curtain the text stays painted in place (it is
            // covered anyway, and stays an early LCP candidate); the from-state applies at the reveal.
            if (trigger === "mount" && !isRevealed()) {
              pending?.();
              pending = whenRevealed(() => {
                pending = null;
                play();
              });
              return;
            }
            return play();
          },
        });
      });
      // Scroll reveals split only when they come near the viewport: splitting every
      // headline at hydration is a long layout pass on slow phones.
      let io: IntersectionObserver | null = null;
      if (trigger === "scroll") {
        io = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            io?.disconnect();
            setup();
          },
          { rootMargin: "0px 0px 50% 0px" },
        );
        io.observe(el);
      } else setup();
      return () => {
        io?.disconnect();
        pending?.();
        split?.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-split="" className={cn(className)}>
      {children}
    </Tag>
  );
}
