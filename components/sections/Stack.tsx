"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { cn } from "@/lib/cn";

type Layer = { id: string; title: string; tools: string[] };
type ProjectRef = { slug: string; title: string };

/**
 * Stack as opposing marquees, one per layer. Scroll velocity (Lenis) speeds
 * them up; hovering a row slows it. Hovering or focusing a tool lights up the
 * projects that use it (cross-referenced from the content files).
 */
export function Stack({
  layers,
  usage,
  projects,
  index,
  total,
}: {
  layers: Layer[];
  usage: Record<string, string[]>;
  projects: ProjectRef[];
  index: number;
  total: number;
}) {
  const root = useRef<HTMLElement>(null);
  const [tool, setTool] = useState<string | null>(null);
  const used = new Set(tool ? (usage[tool] ?? []) : []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-marquee]", el);
      const state = rows.map((row, i) => ({
        row,
        inner: row.querySelector<HTMLElement>("[data-inner]")!,
        x: 0,
        dir: i % 2 ? 1 : -1,
        slow: 1,
      }));
      state.forEach((s) => {
        s.row.addEventListener("pointerenter", () => gsap.to(s, { slow: 0.15, duration: 0.6 }));
        s.row.addEventListener("pointerleave", () => gsap.to(s, { slow: 1, duration: 0.6 }));
      });
      let visible = false;
      const io = new IntersectionObserver(([e]) => (visible = Boolean(e?.isIntersecting)));
      io.observe(el);
      const tick = (_t: number, dt: number) => {
        if (!visible) return;
        const v = Math.min(Math.abs(getLenis()?.velocity ?? 0), 60);
        for (const s of state) {
          const half = s.inner.scrollWidth / 2;
          s.x += s.dir * (0.045 + v * 0.02) * dt * s.slow;
          if (s.x <= -half) s.x += half;
          if (s.x > 0) s.x -= half;
          s.inner.style.transform = `translate3d(${s.x}px,0,0)`;
        }
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        io.disconnect();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="stack-title" className="relative overflow-hidden bg-paper py-28 md:py-36">
      <div className="grid-12 mb-14 gap-y-6">
        <SectionLabel index={index} total={total} text="Stack" className="col-span-full" />
        <SplitReveal as="h2" id="stack-title" className="t-section col-span-full md:col-span-7">
          Tools, by layer.
        </SplitReveal>
        <p className="col-span-full max-w-[38ch] self-end text-ink-2 md:col-span-4 md:col-start-9">
          No scores. Point at a tool to see which projects use it.
        </p>
      </div>

      <div className="border-t border-ink">
        {layers.map((layer) => (
          <div key={layer.id} className="relative border-b border-rule">
            <h3 className="t-label absolute top-3 left-[var(--gutter)] z-10 bg-paper pr-3 text-ink-3-text">
              {layer.title}
            </h3>
            <div data-marquee className="overflow-hidden pt-10 pb-6 motion-reduce:overflow-visible">
              <div data-inner className="flex w-max motion-reduce:w-auto motion-reduce:flex-wrap">
                {[0, 1].map((copy) => (
                  <ul
                    key={copy}
                    aria-hidden={copy === 1 || undefined}
                    className={cn(
                      "flex shrink-0 items-baseline gap-[3vw] pr-[3vw] motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:gap-y-2 motion-reduce:px-[var(--gutter)]",
                      copy === 1 && "motion-reduce:hidden",
                    )}
                  >
                    {layer.tools.map((t) => {
                      const on = tool === t;
                      return (
                        <li key={t}>
                          <button
                            type="button"
                            tabIndex={copy === 1 ? -1 : 0}
                            onPointerEnter={() => setTool(t)}
                            onPointerLeave={() => setTool(null)}
                            onFocus={() => setTool(t)}
                            onBlur={() => setTool(null)}
                            data-cursor-tone={layer.id === "ai" ? "signal" : undefined}
                            className={cn(
                              "font-display text-[clamp(2.25rem,5.4vw,5.75rem)] leading-none font-semibold tracking-[-0.035em] whitespace-nowrap transition-colors duration-300",
                              on ? (layer.id === "ai" ? "text-signal" : "text-ink") : tool ? "text-ink-3" : "text-ink",
                            )}
                          >
                            {t}
                          </button>
                          <span aria-hidden="true" className="ml-[1.5vw] align-super font-mono text-xs text-ink-3-text">
                            {(usage[t] ?? []).length || ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-12 mt-10 gap-y-3" aria-live="polite">
        <p className="t-label col-span-full text-ink-3-text md:col-span-3">
          {tool ? `${tool} — used in` : "Projects"}
        </p>
        <ul className="col-span-full flex flex-wrap gap-x-6 gap-y-2 md:col-span-9">
          {projects.map((p) => (
            <li
              key={p.slug}
              className={cn(
                "t-label transition-colors duration-300",
                !tool ? "text-ink-2" : used.has(p.slug) ? "text-ink" : "text-ink-3/60",
              )}
            >
              {used.has(p.slug) && <span className="mr-1 text-signal">●</span>}
              {p.title}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
