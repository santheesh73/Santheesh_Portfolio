"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { Project } from "@/content/schema";
import { known } from "@/content/schema";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { Chip } from "@/components/ui/Chip";
import { ProjectMedia } from "./ProjectMedia";
import { RollText } from "./RollText";
import { cn } from "@/lib/cn";

/**
 * A work plate: 16:10 media, display title beneath it, mono
 * metadata row. Hover: RGB-split pulse on the media + rolling title letters.
 * Click: shared-element (Flip) transition into the case study.
 */
export function ProjectPlate({
  project,
  index,
  className,
  sizes,
}: {
  project: Project;
  index?: number;
  className?: string;
  sizes?: string;
}) {
  const media = useRef<HTMLDivElement>(null);
  const filterId = `rgb-${project.slug}`;

  const pulse = () => {
    const el = media.current;
    if (!el || prefersReducedMotion()) return;
    const r = document.querySelector(`#${filterId} [data-r]`);
    const b = document.querySelector(`#${filterId} [data-b]`);
    el.style.filter = `url(#${filterId})`;
    gsap.killTweensOf([r, b]);
    gsap
      .timeline({ onComplete: () => void (el.style.filter = "") })
      .fromTo([r, b], { attr: { dx: 0 } }, { attr: { dx: (i) => (i ? -7 : 7) }, duration: 0.18, ease: "power2.out" })
      .to([r, b], { attr: { dx: 0 }, duration: 0.5, ease: "expo.out" });
    gsap.fromTo(el.querySelector("[data-zoom]"), { scale: 1 }, { scale: 1.035, duration: 0.9, ease: "expo.out" });
  };
  const rest = () => {
    const el = media.current;
    if (!el) return;
    gsap.to(el.querySelector("[data-zoom]"), { scale: 1, duration: 0.8, ease: "expo.out" });
  };

  const year = known(project.year);
  const role = known(project.role);

  return (
    <article className={cn("relative", className)}>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="R" />
          <feOffset data-r in="R" dx="0" result="R2" />
          <feColorMatrix in="SourceGraphic" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="G" />
          <feColorMatrix in="SourceGraphic" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="B" />
          <feOffset data-b in="B" dx="0" result="B2" />
          <feBlend in="R2" in2="G" mode="screen" result="RG" />
          <feBlend in="RG" in2="B2" mode="screen" />
        </filter>
      </svg>
      <Link
        href={`/work/${project.slug}`}
        data-transition="flip"
        data-flip-id={project.slug}
        data-cursor="View case"
        className="group block focus-visible:outline-offset-8"
        onPointerEnter={pulse}
        onPointerLeave={rest}
        onFocus={pulse}
        onBlur={rest}
        aria-label={`${project.title}: ${project.pitch} View case study`}
      >
        <div ref={media} data-flip-source className="relative aspect-[16/10] overflow-hidden border border-rule">
          <div data-zoom className="absolute inset-0 will-change-transform">
            <ProjectMedia project={project} sizes={sizes} className="h-full w-full" />
          </div>
        </div>
        <div className="relative mt-5 font-display text-[clamp(2.75rem,6.4vw,7rem)] leading-[0.9] font-semibold tracking-[-0.04em] text-ink">
          <RollText text={project.title} />
        </div>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {index !== undefined && <span className="t-label text-ink-3-text">{String(index + 1).padStart(2, "0")}</span>}
        <Chip status={project.status} />
        {year && <span className="t-label text-ink-2">{year}</span>}
        {role && project.team === "team" && <span className="t-label text-ink-2">{role}</span>}
        <span className="t-label text-ink-2">{project.stack.slice(0, 4).join(" · ")}</span>
      </div>
      <p className="mt-3 max-w-[48ch] text-ink-2">{project.pitch}</p>
    </article>
  );
}
