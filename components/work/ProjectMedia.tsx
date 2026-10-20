"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Project } from "@/content/schema";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { SpecPlate } from "./SpecPlate";
import { cn } from "@/lib/cn";

/**
 * Project media at a fixed aspect: looping muted video (plays only while in
 * view, poster only under reduced motion), image, or a spec plate.
 */
export function ProjectMedia({
  project,
  className,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
}: {
  project: Project;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const m = project.media;

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className={cn("relative overflow-hidden bg-paper-2", className)}>
      {m.kind === "video" && (
        <>
          <Image src={m.poster} alt="" fill sizes={sizes} priority={priority} className="object-cover object-top" />
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover object-top"
            muted
            loop
            playsInline
            preload="none"
            poster={m.poster}
            aria-label={m.alt}
          >
            <source src={m.src.replace(/\.mp4$/, ".webm")} type="video/webm" />
            <source src={m.src} type="video/mp4" />
          </video>
        </>
      )}
      {m.kind === "image" && (
        <Image src={m.src} alt={m.alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
      )}
      {m.kind === "plate" && <SpecPlate project={project} />}
    </div>
  );
}
