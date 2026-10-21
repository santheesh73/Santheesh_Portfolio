"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

export type MenuItem = {
  href: string;
  label: string;
  note: string;
  preview: { kind: "image"; src: string; alt: string } | { kind: "text"; lines: string[] };
};

const FOCUSABLE = "a[href], button:not([disabled])";

/**
 * Full-screen overlay: huge staggered nav items with a preview per item.
 * Traps focus, closes on Escape and on navigation, returns focus to the toggle.
 */
export function Menu({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [active, setActive] = useState(0);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      tl.current = gsap
        .timeline({ paused: true })
        .set(el, { visibility: "visible" })
        .fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: EASE.signal },
        )
        .fromTo(
          q("[data-item]"),
          { yPercent: 110 },
          { yPercent: 0, duration: DUR.revealFast, ease: EASE.structure, stagger: STAGGER.lines },
          0.25,
        )
        .fromTo(
          q("[data-fade]"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, stagger: 0.05 },
          0.35,
        );
    },
    { scope: root },
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const t = tl.current;
    const el = root.current;
    if (!t || !el) return;
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      getLenis()?.stop();
      if (prefersReducedMotion()) t.progress(1);
      else t.timeScale(1).play();
      requestAnimationFrame(() => el.querySelector<HTMLElement>(FOCUSABLE)?.focus());
    } else if (mounted) {
      getLenis()?.start();
      if (prefersReducedMotion()) t.progress(0);
      else t.timeScale(1.8).reverse();
      returnFocus.current?.focus?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on route change (not on mount: the menu loads lazily and may mount already open).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !root.current) return;
      const nodes = [...root.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const toggle = document.querySelector<HTMLElement>("[aria-controls='site-menu']");
      const ring = toggle ? [...nodes, toggle] : nodes;
      const i = ring.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey
        ? i <= 0
          ? ring.length - 1
          : i - 1
        : i === ring.length - 1
          ? 0
          : i + 1;
      e.preventDefault();
      ring[next]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const current = items[active];

  return (
    <div
      ref={root}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      inert={!open}
      data-tone="ink"
      className="tone-ink invisible fixed inset-0 z-[99] bg-ink text-paper"
    >
      <div className="grid-12 h-full content-center gap-y-10 pt-[var(--header-h)] pb-10">
        <nav aria-label="Primary" className="col-span-full md:col-span-7">
          <ul className="space-y-1">
            {items.map((item, i) => {
              const here = item.href === pathname;
              return (
                <li key={item.href} className="overflow-hidden">
                  <div data-item className="flex items-baseline gap-4">
                    <Link
                      href={item.href}
                      data-transition-label={item.label}
                      aria-current={here ? "page" : undefined}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className={cn(
                        "font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.04em] transition-colors duration-300",
                        active === i ? "text-paper" : "text-paper/35",
                        "hover:text-paper focus-visible:text-paper",
                      )}
                    >
                      {item.label}
                    </Link>
                    <span className="t-label hidden text-paper/50 sm:inline">{item.note}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
        <div data-fade className="col-span-5 hidden self-center md:block" aria-hidden="true">
          <div className="relative aspect-[16/10] overflow-hidden border border-paper/15">
            {items.map((item, i) => (
              <div
                key={item.href}
                className={cn(
                  "absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-structure)]",
                  active === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
                )}
              >
                {item.preview.kind === "image" ? (
                  <Image
                    src={item.preview.src}
                    alt=""
                    fill
                    sizes="40vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-end gap-1 bg-paper/[0.04] p-6">
                    {item.preview.lines.map((l) => (
                      <p key={l} className="font-mono text-sm text-paper/70">
                        {l}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="t-label mt-3 text-paper/50">{current?.note}</p>
        </div>
        <div
          data-fade
          className="t-label col-span-full flex flex-wrap gap-x-8 gap-y-2 border-t border-paper/15 pt-5 text-paper/60"
        >
          <span className="max-md:hidden">Press G for the blueprint grid</span>
          <span className="max-md:hidden">Esc to close</span>
          <span className="md:hidden">Tiruppur, India · IST</span>
        </div>
      </div>
    </div>
  );
}
