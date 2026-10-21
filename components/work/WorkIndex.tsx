"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Flip as FlipPlugin } from "gsap/Flip";
import { gsap, loadFlip, useGSAP } from "@/lib/gsap";
import { EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import type { ReactNode } from "react";
import type { Project, ProjectCategory } from "@/content/schema";
import { CATEGORY_LABEL, known } from "@/content/helpers";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";

type View = "list" | "grid";
type Filter = "all" | ProjectCategory;

const FILTERS: Filter[] = ["all", "ai-product", "devtool", "platform"];

/**
 * All work. List rows (with a media preview that trails the pointer) or a grid
 * of plates; switching views and filters re-flows the same elements with Flip.
 */
export function WorkIndex({
  projects,
  media,
}: {
  projects: Project[];
  /** slug → pre-rendered `<ProjectMedia>` */
  media: Record<string, ReactNode>;
}) {
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<(typeof FlipPlugin)["getState"]> | null>(null);
  const flip = useRef<typeof FlipPlugin | null>(null);
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<Filter>("all");
  const [hovered, setHovered] = useState<string | null>(null);

  const count = (f: Filter) =>
    f === "all" ? projects.length : projects.filter((p) => p.category === f).length;
  const shown = (p: Project) => filter === "all" || p.category === filter;

  useEffect(() => {
    loadFlip().then((F) => (flip.current = F));
  }, []);

  const capture = () => {
    // until Flip has loaded (or with reduced motion) the layout simply switches
    if (!root.current || !flip.current || prefersReducedMotion()) return;
    flipState.current = flip.current.getState(
      root.current.querySelectorAll("[data-item], [data-item-media], [data-item-title]"),
    );
  };
  const changeView = (v: View) => {
    if (v === view) return;
    capture();
    setHovered(null);
    setView(v);
  };
  const changeFilter = (f: Filter) => {
    if (f === filter) return;
    capture();
    setFilter(f);
  };

  // Re-flow after React has applied the new layout.
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !flip.current) return;
    flipState.current = null;
    flip.current.from(state, {
      duration: 0.8,
      ease: EASE.structure,
      absolute: true,
      nested: true,
      stagger: 0.025,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { autoAlpha: 0, y: 24, rotate: 1.5 },
          { autoAlpha: 1, y: 0, rotate: 0, duration: 0.6, ease: EASE.structure, stagger: 0.03 },
        ),
    });
  }, [view, filter]);

  // Pointer-trailing preview for list rows (fine pointers only).
  useGSAP(
    () => {
      const el = preview.current;
      if (!el || !window.matchMedia("(pointer: fine)").matches) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        xTo(e.clientX + 24);
        yTo(e.clientY - el.offsetHeight / 2);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const el = preview.current;
      if (!el) return;
      const on = view === "list" && hovered !== null;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: on ? 1 : 0 });
        return;
      }
      gsap.to(el, {
        autoAlpha: on ? 1 : 0,
        scale: on ? 1 : 0.92,
        rotate: on ? 0 : -2,
        duration: on ? 0.45 : 0.25,
        ease: on ? EASE.structure : EASE.signal,
        overwrite: "auto",
      });
    },
    { dependencies: [hovered, view], scope: root },
  );

  return (
    <div ref={root}>
      <div className="grid-12 sticky top-[var(--header-h)] z-20 gap-y-4 border-b border-rule bg-paper py-4">
        <div
          role="group"
          aria-label="Filter by category"
          className="col-span-full flex flex-wrap gap-2 md:col-span-9"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => changeFilter(f)}
              className={cn(
                "t-label rounded-full border px-4 py-2 transition-colors",
                filter === f
                  ? "border-ink bg-ink text-paper"
                  : "border-rule text-ink-2 hover:border-ink hover:text-ink",
              )}
            >
              {f === "all" ? "All" : CATEGORY_LABEL[f]}{" "}
              <span className="tabular-nums opacity-60">{count(f)}</span>
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="Layout"
          className="col-span-full flex gap-2 md:col-span-3 md:justify-end"
        >
          {(["list", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => changeView(v)}
              className={cn(
                "t-label rounded-full border px-4 py-2 transition-colors",
                view === v
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-3-text hover:text-ink",
              )}
            >
              {v === "list" ? "List" : "Grid"}
            </button>
          ))}
        </div>
      </div>

      <ul
        className={cn(
          "grid-12 pt-10 pb-32",
          view === "grid" ? "gap-x-[var(--gutter)] gap-y-20" : "gap-y-0",
        )}
        onPointerLeave={() => setHovered(null)}
      >
        {projects.map((p, i) => {
          const year = known(p.year);
          return (
            <li
              key={p.slug}
              data-item
              data-flip-id={`item-${p.slug}`}
              hidden={!shown(p)}
              className={cn(
                view === "grid"
                  ? "col-span-full md:col-span-6"
                  : "col-span-full border-b border-rule",
              )}
            >
              <Link
                href={`/work/${p.slug}`}
                data-transition={view === "grid" ? "flip" : undefined}
                data-flip-id={p.slug}
                data-transition-label={p.title}
                data-cursor="View case"
                onPointerEnter={() => setHovered(p.slug)}
                onFocus={() => setHovered(p.slug)}
                className={cn(
                  "group block",
                  view === "list" &&
                    "grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-6 md:grid-cols-[3rem_1fr_auto] md:py-8",
                )}
              >
                <div
                  data-item-media
                  data-flip-id={`media-${p.slug}`}
                  data-flip-source={view === "grid" ? "" : undefined}
                  className={cn(
                    "relative aspect-[16/10] overflow-hidden border border-rule",
                    view === "list" && "hidden",
                  )}
                >
                  {media[p.slug]}
                </div>
                <span
                  className={cn(
                    "t-label text-ink-3-text tabular-nums",
                    view === "grid" && "mt-5 block",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  data-item-title
                  data-flip-id={`title-${p.slug}`}
                  className={cn(
                    "block font-display font-semibold tracking-[-0.035em] transition-colors",
                    view === "list"
                      ? "text-[clamp(2rem,4.5vw,4.5rem)] leading-[0.95] group-hover:text-signal group-focus-visible:text-signal"
                      : "mt-1 text-[clamp(1.75rem,2.8vw,2.75rem)] leading-none",
                  )}
                >
                  {p.title}
                </span>
                <span
                  className={cn(
                    "flex flex-wrap items-center gap-x-4 gap-y-2",
                    view === "list"
                      ? "col-start-2 mt-3 md:col-start-3 md:mt-0 md:justify-end"
                      : "mt-4",
                  )}
                >
                  <span className="t-label text-ink-2">{CATEGORY_LABEL[p.category]}</span>
                  {year && <span className="t-label text-ink-2 tabular-nums">{year}</span>}
                  <Chip status={p.status} />
                </span>
                {view === "grid" && (
                  <span className="mt-3 block max-w-[48ch] text-ink-2">{p.pitch}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* trailing preview for list rows */}
      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-30 hidden aspect-[16/10] w-[min(26vw,380px)] overflow-hidden border border-rule bg-sheet opacity-0 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.45)] md:block"
      >
        {projects.map((p) => (
          <div
            key={p.slug}
            className={cn("absolute inset-0", hovered === p.slug ? "visible" : "invisible")}
          >
            {media[p.slug]}
          </div>
        ))}
      </div>
    </div>
  );
}
