"use client";

import { useRef, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SCRAMBLE_GLYPHS } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";
import { isRevealed, whenRevealed } from "@/lib/pageReveal";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  trigger?: "scroll" | "mount" | "hover";
  delay?: number;
};

/**
 * Mono labels only: random glyphs resolve into the final text (noise → order).
 * Screen readers get the final text from a visually hidden copy; the animated span is aria-hidden.
 */
export function Scramble({
  text,
  as: Tag = "span",
  className,
  trigger = "scroll",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const target = inner.current;
      if (!el || !target || prefersReducedMotion()) return;

      const play = () =>
        gsap.to(target, {
          duration: Math.min(1.1, 0.35 + text.length * 0.025),
          delay: trigger === "hover" ? 0 : delay,
          ease: "none",
          scrambleText: { text, chars: SCRAMBLE_GLYPHS, revealDelay: 0.15, speed: 0.6 },
        });

      if (trigger === "mount") {
        // already revealed: play now; otherwise the final text sits under the cover until the reveal
        if (isRevealed()) {
          play();
          return;
        }
        return whenRevealed(() => {
          play();
        });
      } else if (trigger === "scroll") {
        gsap.set(target, { opacity: 0 });
        gsap.to(target, {
          opacity: 1,
          duration: 0.01,
          scrollTrigger: { trigger: el, start: "top 92%", once: true, onEnter: () => play() },
        });
      } else {
        const onEnter = () => play();
        el.addEventListener("pointerenter", onEnter);
        return () => el.removeEventListener("pointerenter", onEnter);
      }
    },
    { scope: ref, dependencies: [text] },
  );

  return (
    <Tag ref={ref} className={cn("t-label", className)}>
      <span className="sr-only">{text}</span>
      <span ref={inner} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
}
