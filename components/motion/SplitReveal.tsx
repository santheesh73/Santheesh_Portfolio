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
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.dataset.split = "done";
        return;
      }
      const split = SplitText.create(el, {
        type: by === "words" ? "lines,words" : "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        aria: "auto",
        onSplit(self) {
          el.dataset.split = "done";
          const targets = by === "words" ? self.words : self.lines;
          const waitForPage = trigger === "mount" && !isRevealed();
          const tween = gsap.from(targets, {
            paused: waitForPage,
            yPercent: 110,
            duration: DUR.reveal,
            ease: EASE.structure,
            stagger: by === "words" ? STAGGER.words : STAGGER.lines,
            delay,
            scrollTrigger:
              trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
          });
          if (waitForPage) whenRevealed(() => tween.play());
          return tween;
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-split="" className={cn(className)}>
      {children}
    </Tag>
  );
}
