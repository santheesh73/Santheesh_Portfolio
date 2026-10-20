"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Muted loop that plays only while in view. No poster attribute: the optimized,
 * lazy poster <img> underneath shows until the first frame (and under reduced motion).
 */
export function InViewVideo({ src, label }: { src: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v || prefersReducedMotion()) return;
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
    <video
      ref={video}
      className="absolute inset-0 h-full w-full object-cover object-top"
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    >
      <source src={src.replace(/\.mp4$/, ".webm")} type="video/webm" />
      <source src={src} type="video/mp4" />
    </video>
  );
}
