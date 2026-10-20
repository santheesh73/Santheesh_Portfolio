"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Clock } from "./Clock";
import { Menu, type MenuItem } from "./Menu";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/cn";

/**
 * Top bar: wordmark left, live IST clock centre, Menu right. Flips to paper
 * text while it sits over any section marked data-tone="ink".
 */
export function Header({ name, items }: { name: string; items: MenuItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const bar = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      setDark(false);
      const sections = document.querySelectorAll<HTMLElement>("main [data-tone='ink']");
      const triggers = [...sections].map((s) =>
        ScrollTrigger.create({
          trigger: s,
          start: "top top+=32",
          end: "bottom top+=32",
          onToggle: (self) => setDark(self.isActive),
        }),
      );
      return () => triggers.forEach((t) => t.kill());
    },
    { dependencies: [pathname] },
  );

  return (
    <>
      <header
        ref={bar}
        className={cn(
          "grid-12 fixed inset-x-0 top-0 z-[100] h-[var(--header-h)] items-center transition-colors duration-300",
          dark && !open ? "text-paper" : "text-ink",
          open && "text-paper",
        )}
      >
        <Link
          href="/"
          data-transition-label="Index"
          className="col-span-2 flex flex-col leading-none md:col-span-4"
          aria-label={`${name}, home`}
        >
          <span className="font-display text-lg font-semibold tracking-[-0.02em]">{name}</span>
          <span className="t-label mt-1 hidden opacity-60 sm:block">AI software engineer</span>
        </Link>
        <div className="col-span-4 hidden justify-center md:flex">
          <Clock className="opacity-80" />
        </div>
        <div className="col-span-2 flex justify-end md:col-span-4">
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
