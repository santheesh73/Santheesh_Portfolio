"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Clock } from "@/components/layout/Clock";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  heading: string;
  email: string;
  github: string;
  linkedin: string;
  motto: string;
  location: string;
  /** Position in the home sequence; the label drops the index on other routes. */
  homeIndex: number;
};

/** Global contact footer: the last section on every page. */
export function Contact({ heading, email, github, linkedin, motto, location, homeIndex }: Props) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  const home = pathname === "/";

  return (
    <footer
      id="contact"
      data-tone="ink"
      aria-labelledby="contact-title"
      className="relative z-[2] bg-ink text-paper"
    >
      <div className="grid-12 min-h-[92svh] content-between gap-y-16 pt-28 pb-8 md:pt-36">
        <div className="col-span-full flex flex-col gap-10">
          <SectionLabel
            tone="paper"
            index={home ? homeIndex : undefined}
            total={home ? homeIndex : undefined}
            text="Contact"
          />
          <SplitReveal as="h2" id="contact-title" className="t-hero max-w-[12ch] text-balance">
            {heading}
          </SplitReveal>
        </div>

        <div className="col-span-full grid gap-10 md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-7">
            <p className="t-label text-paper/60">Email</p>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
              <a
                href={`mailto:${email}`}
                data-transition="none"
                data-cursor="Write ↗"
                className="font-display text-[clamp(1.375rem,2.8vw,2.5rem)] font-semibold tracking-[-0.02em] break-all select-all hover:text-signal-2"
              >
                {email}
              </a>
              <button
                type="button"
                onClick={copy}
                className="t-label rounded-full border border-paper/30 px-4 py-2 transition-colors hover:border-paper focus-visible:border-paper"
              >
                <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
              </button>
            </div>
          </div>
          <ul className="flex flex-col gap-2 md:col-span-5 md:items-end">
            {[
              { label: "GitHub", href: github },
              { label: "LinkedIn", href: linkedin },
            ].map((l) => (
              <li key={l.label}>
                <Magnetic strength={12}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="Open ↗"
                    className="group inline-flex items-baseline gap-3 font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.95] font-semibold tracking-[-0.035em]"
                  >
                    {l.label}
                    <span
                      aria-hidden
                      className="text-[0.5em] text-paper/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-paper"
                    >
                      ↗
                    </span>
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </div>

        <div className="t-label col-span-full flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-paper/20 pt-5 text-paper/60">
          <span>© 2026 Santheesh S</span>
          <span className="hidden lg:inline">{motto}</span>
          <span>
            {location} · <Clock className="text-paper/60" />
          </span>
          <span className="hidden md:inline">Press G for the grid</span>
          <button type="button" onClick={toTop} className="underline-offset-4 hover:text-paper hover:underline">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
