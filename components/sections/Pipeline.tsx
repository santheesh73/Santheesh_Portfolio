"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, SIGNAL_OFFSET } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { revealOnFocus } from "@/lib/revealOnFocus";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitReveal } from "@/components/motion/SplitReveal";
import type { PipelineStage } from "@/content/pipeline";
import { cn } from "@/lib/cn";

const BOX: Record<PipelineStage["kind"], string> = {
  model: "border-signal text-signal",
  seam: "border-ink border-dashed text-ink",
  engine: "border-ink bg-ink text-paper",
};

function StageCard({ stage, i, total }: { stage: PipelineStage; i: number; total: number }) {
  return (
    <article
      data-stage={i}
      aria-labelledby={`stage-${stage.id}`}
      className="relative flex flex-col gap-6"
      data-cursor-tone={stage.kind === "model" ? "signal" : undefined}
    >
      <div className="flex items-center gap-3">
        <span className={cn("t-label inline-flex border px-2 py-1", BOX[stage.kind])}>
          {stage.kindLabel}
        </span>
        <span className="t-label text-ink-3-text">
          Stage {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <h3
        id={`stage-${stage.id}`}
        className={cn("t-section", stage.kind === "model" ? "text-signal" : "text-ink")}
      >
        {stage.verb}.
      </h3>
      <p className="t-lede max-w-[28ch] text-ink-2">{stage.line}</p>
      <ul className="space-y-4 border-t border-rule pt-5">
        {stage.examples.map((ex) => (
          <li key={ex.slug + ex.fact} className="max-w-[44ch]">
            <Link
              href={`/work/${ex.slug}`}
              data-transition-label={ex.project}
              className="t-label text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
            >
              {ex.project} ↗
            </Link>
            <p className="mt-1.5 text-ink-2">{ex.fact}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * The clearest statement of the concept. Desktop: a pinned horizontal scene;
 * one document rides the drawn line while the stages pass under it and it is
 * read, validated, decided and explained. Mobile: a vertical sequence.
 */
export function Pipeline({
  stages,
  docs,
  index,
  total,
}: {
  stages: PipelineStage[];
  /** stage id → pre-rendered `<DocumentGlyph>` (server-rendered SVG, no client code) */
  docs: Record<string, ReactNode>;
  index: number;
  total: number;
}) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const q = gsap.utils.selector(el);
        const track = q("[data-track]")[0] as HTMLElement;
        const win = q("[data-window]")[0] as HTMLElement;
        const distance = () => track.scrollWidth - win.clientWidth;
        let current = 0;

        const swap = (next: number) => {
          if (next === current) return;
          const docs = q("[data-doc]");
          const out = docs[current];
          const inn = docs[next];
          current = next;
          setActive(next);
          gsap.to(out!, {
            autoAlpha: 0,
            x: -SIGNAL_OFFSET.x,
            rotate: -SIGNAL_OFFSET.rotate,
            filter: `blur(${SIGNAL_OFFSET.blur}px)`,
            duration: 0.3,
            ease: EASE.signal,
          });
          gsap.fromTo(
            inn!,
            {
              autoAlpha: 0,
              x: SIGNAL_OFFSET.x * 2,
              y: SIGNAL_OFFSET.y / 2,
              rotate: SIGNAL_OFFSET.rotate,
              filter: `blur(${SIGNAL_OFFSET.blur}px)`,
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              rotate: 0,
              filter: "blur(0px)",
              duration: 0.6,
              ease: EASE.structure,
              delay: 0.08,
            },
          );
        };

        gsap.set(q("[data-doc]"), { autoAlpha: 0 });
        gsap.set(q("[data-doc]")[0]!, { autoAlpha: 1 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.6}`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const n = stages.length;
              swap(Math.min(n - 1, Math.floor(self.progress * n * 0.999)));
            },
          },
        });
        tl.to(track, { x: () => -distance(), duration: 1 }, 0);
        tl.fromTo(q("[data-wire]"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
        tl.fromTo(q("[data-progress]"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
        return revealOnFocus(el, track, tl.scrollTrigger!, distance);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="pipeline-title"
      className="relative overflow-hidden bg-paper-2 md:h-[100svh] motion-reduce:md:h-auto"
    >
      {/* top rule + section head */}
      <div className="grid-12 relative z-10 gap-y-4 pt-[calc(var(--header-h)+2rem)] md:absolute md:inset-x-0 md:top-0 motion-reduce:md:static">
        <SectionLabel
          index={index}
          total={total}
          text="The pipeline"
          className="col-span-full md:col-span-4"
        />
        <SplitReveal
          as="h2"
          id="pipeline-title"
          className="t-display-sm col-span-full md:col-span-6"
        >
          Read. Validate. Decide. Explain.
        </SplitReveal>
        <p className="col-span-full max-w-[40ch] text-ink-2 md:col-span-4 md:col-start-9 md:self-end">
          Every project follows the same shape. A model reads and explains; deterministic code
          decides.
        </p>
      </div>

      {/* Desktop: pinned horizontal scene */}
      <div data-viewport className="absolute inset-0 hidden md:block motion-reduce:md:hidden">
        {/* the wire the document travels along */}
        <div className="absolute inset-x-0 top-[80%] h-px bg-rule" aria-hidden="true" />
        <div
          data-wire
          className="absolute inset-x-0 top-[80%] h-px origin-left bg-ink"
          aria-hidden="true"
        />

        {/* the document, fixed in the frame */}
        <div
          className="absolute bottom-[20%] left-[var(--gutter)] z-10 w-[min(20vw,240px,30vh)]"
          aria-hidden="true"
        >
          <div className="relative aspect-[220/280]">
            {stages.map((s) => (
              <div key={s.id} data-doc className="absolute inset-0 shadow-[0_1px_0_var(--rule)]">
                {docs[s.id]}
              </div>
            ))}
          </div>
          <p className="t-label absolute top-full mt-3 whitespace-nowrap text-ink-2">
            Document · {stages[active]?.verb.toLowerCase()}
            <span className="text-ink-3-text"> — {stages[active]?.kindLabel.toLowerCase()}</span>
          </p>
        </div>

        {/* the moving track of stages, clipped right of the document so text never passes under it */}
        <div
          data-window
          className="absolute inset-y-0 right-0 left-[calc(var(--gutter)+min(20vw,240px,30vh)+3vw)] overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6vw)]"
        >
          <div data-track className="absolute top-[30%] left-0 flex gap-[8vw] pr-[12vw] pl-[6vw]">
            {stages.map((s, i) => (
              <div key={s.id} className="relative w-[46vw] max-w-[640px] shrink-0">
                {/* node on the wire */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[50svh] -left-[4vw] size-3 -translate-y-1/2 border",
                    s.kind === "model"
                      ? "rounded-full border-signal bg-signal"
                      : "border-ink bg-ink",
                  )}
                />
                <StageCard stage={s} i={i} total={stages.length} />
              </div>
            ))}
          </div>
        </div>

        {/* scene progress */}
        <div
          className="absolute inset-x-[var(--gutter)] bottom-8 flex items-center gap-4"
          aria-hidden="true"
        >
          <span className="t-label text-ink-3-text">read</span>
          <span className="relative h-px flex-1 bg-rule">
            <span data-progress className="absolute inset-0 origin-left bg-signal" />
          </span>
          <span className="t-label text-ink-3-text">explain</span>
        </div>
      </div>

      {/* Mobile: vertical sequence */}
      <ol className="grid-12 gap-y-16 py-16 md:hidden motion-reduce:md:grid">
        {stages.map((s, i) => (
          <li key={s.id} className="col-span-full grid grid-cols-[88px_1fr] gap-5">
            <div className="relative">
              <div className="aspect-[220/280] w-full" aria-hidden="true">
                {docs[s.id]}
              </div>
              {i < stages.length - 1 && (
                <span aria-hidden="true" className="absolute top-full left-1/2 h-16 w-px bg-ink" />
              )}
            </div>
            <StageCard stage={s} i={i} total={stages.length} />
          </li>
        ))}
      </ol>
    </section>
  );
}
