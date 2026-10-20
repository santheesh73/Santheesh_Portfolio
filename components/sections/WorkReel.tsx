"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import type { Project } from "@/content/schema";
import { ProjectPlate } from "@/components/work/ProjectPlate";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitReveal } from "@/components/motion/SplitReveal";

/** Pinned horizontal gallery of featured plates (desktop); vertical stack on mobile. */
export function WorkReel({
  projects,
  totalWork,
  index,
  total,
}: {
  projects: Project[];
  totalWork: number;
  index: number;
  total: number;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const track = el.querySelector<HTMLElement>("[data-track]")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        // plates arrive loose and settle as they enter (signal → structure)
        gsap.utils.toArray<HTMLElement>("[data-plate]", el).forEach((p, i) => {
          gsap.from(p, { rotate: i % 2 ? 1.5 : -1.5, y: 30, ease: "expo.out", duration: 1, scrollTrigger: { trigger: el, start: "top 70%", once: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="work-title" className="relative overflow-hidden bg-paper py-24 md:flex md:h-[100svh] md:items-center md:py-0">
      <div data-track className="flex flex-col gap-24 px-[var(--gutter)] md:flex-row md:items-center md:gap-[6vw] md:pr-[10vw]">
        <header className="flex shrink-0 flex-col gap-6 md:w-[26vw]">
          <SectionLabel index={index} total={total} text="Selected work" />
          <SplitReveal as="h2" id="work-title" className="t-section">
            Work.
          </SplitReveal>
          <p className="max-w-[34ch] text-ink-2">
            Five builds that show the pattern. Each one opens into a case study with its architecture.
          </p>
          <Link href="/work" className="t-label w-fit underline decoration-rule underline-offset-4 hover:decoration-ink">
            All {totalWork} projects →
          </Link>
        </header>
        {projects.map((p, i) => (
          <div key={p.slug} data-plate className="shrink-0 md:w-[min(56vw,62vh*1.6)]">
            <ProjectPlate project={p} index={i} sizes="(min-width: 768px) 56vw, 100vw" />
          </div>
        ))}
      </div>
    </section>
  );
}
