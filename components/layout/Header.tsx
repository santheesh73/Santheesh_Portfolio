"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Clock } from "./Clock";
import dynamic from "next/dynamic";
import type { MenuItem } from "./Menu";

// The overlay loads right after hydration rather than with the first paint.
const Menu = dynamic(() => import("./Menu").then((m) => m.Menu), { ssr: false });
import { ThemeToggle } from "./ThemeToggle";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/lab", label: "Lab" },
];

/**
 * Top bar: wordmark left, live IST clock centre, page links (desktop), theme
 * and Menu right. Transparent over the top of the page; once scrolled it gets
 * a solid ground and a hairline so content never runs under the wordmark.
 * Flips to the ink tone while it sits over any section marked data-tone="ink".
 */
export function Header({ name, items }: { name: string; items: MenuItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLElement>(null);

  // Scroll state, measured live (no cached trigger positions, so late layout
  // shifts can't leave it stale): solid ground once scrolled, ink tone while
  // the bar's lower edge sits over an ink section.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      const probe = (bar.current?.offsetHeight ?? 64) - 8;
      const sections = document.querySelectorAll<HTMLElement>("main [data-tone='ink'], footer[data-tone='ink']");
      setDark(
        [...sections].some((s) => {
          const r = s.getBoundingClientRect();
          return r.top <= probe && r.bottom > probe;
        }),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <>
      <header
        ref={bar}
        className={cn(
          "grid-12 fixed inset-x-0 top-0 z-[100] h-[var(--header-h)] items-center border-b transition-colors duration-300",
          // over ink surfaces (and the open menu) the bar takes the ink tone; tone-ink keeps it deep in dark mode
          (dark || open) && "tone-ink",
          dark || open ? "text-paper" : "text-ink",
          scrolled && !open
            ? dark
              ? "border-paper/15 bg-ink"
              : "border-rule bg-paper"
            : "border-transparent bg-transparent",
        )}
      >
        <Link
          href="/"
          data-transition-label="Index"
          className="col-span-2 flex flex-col leading-none md:col-span-4"
        >
          <span className="font-display text-lg font-semibold tracking-[-0.02em]">
            {name}
            <span className="sr-only">, home</span>
          </span>
          <span className="t-label mt-1 hidden opacity-60 sm:block">AI software engineer</span>
        </Link>
        <div className="col-span-4 hidden justify-center md:flex">
          <Clock className="opacity-80" />
        </div>
        <div className="col-span-2 flex items-center justify-end gap-5 md:col-span-4 md:gap-8">
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex gap-6">
              {NAV.map((n) => {
                const current = pathname === n.href || pathname.startsWith(`${n.href}/`);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      data-transition-label={n.label}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "t-label block py-3 underline-offset-[6px] transition-opacity hover:underline",
                        current ? "underline" : "opacity-70 hover:opacity-100",
                      )}
                    >
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <ThemeToggle />
          <Magnetic>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
              className="t-label group flex items-center gap-3 py-3"
              data-cursor={open ? "Close" : undefined}
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span aria-hidden="true" className="relative block h-2.5 w-6">
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-300",
                    open ? "top-1/2 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-300",
                    open ? "top-1/2 -rotate-45" : "bottom-0",
                  )}
                />
              </span>
            </button>
          </Magnetic>
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} items={items} />
    </>
  );
}
