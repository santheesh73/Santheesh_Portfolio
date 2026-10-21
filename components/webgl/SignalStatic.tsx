"use client";

import { onThemeChange } from "@/lib/theme";
import { useEffect, useRef } from "react";
import { displayFamily, sampleText } from "@/lib/sampleText";

/**
 * Fallback for reduced motion or no WebGL: the field already in its
 * "structure" state, drawn once on a 2D canvas. No animation.
 */
export function SignalStatic({ lines, offset }: { lines: string[]; offset?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    const draw = async () => {
      try {
        await document.fonts.load(`700 100px ${displayFamily()}`);
      } catch {}
      if (cancelled) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const narrow = rect.width < 768;
      const s = sampleText({
        lines: narrow ? lines : [lines.join(" ")],
        family: displayFamily(),
        width: rect.width,
        height: rect.height,
        target: narrow ? 4000 : 9000,
        fill: narrow ? 0.9 : 0.94,
        heightShare: narrow ? 0.5 : 0.42,
        offsetY: rect.height * (offset ?? (narrow ? 0.14 : 0.12)),
      });
      const css = getComputedStyle(document.documentElement);
      const ink = css.getPropertyValue("--ink").trim();
      const signal = css.getPropertyValue("--signal").trim();
      const r = Math.max(0.8, s.step * 0.31);
      ctx.scale(dpr, dpr);
      for (let i = 0; i < s.count; i++) {
        const x = s.points[i * 2]! + rect.width / 2;
        const y = rect.height / 2 - s.points[i * 2 + 1]!;
        ctx.fillStyle = (i * 7919) % 100 < 12 ? signal : ink;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    const stopTheme = onThemeChange(draw);
    return () => {
      cancelled = true;
      stopTheme();
      window.removeEventListener("resize", onResize);
    };
  }, [lines, offset]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
