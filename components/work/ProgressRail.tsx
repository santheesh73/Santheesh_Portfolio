"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";

type Item = { id: string; label: string };

/**
 * Sticky section rail for a case study: lists the body's h2s, fills a 1px line
 * with reading progress and marks the section in view.
 */
export function ProgressRail({ bodyId }: { bodyId: string }) {
  const root = useRef<HTMLElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const hs = document.querySelectorAll<HTMLHeadingElement>(`#${bodyId} h2[id]`);
    setItems([...hs].map((h) => ({ id: h.id, label: h.textContent ?? "" })));
  }, [bodyId]);

  useGSAP(
    () => {
      const body = document.getElementById(bodyId);
      if (!body || !items.length) return;
      const fill = root.current?.querySelector("[data-fill]");
      ScrollTrigger.create({
        trigger: body,
        start: "top 60%",
        end: "bottom 60%",
        onUpdate: (self) => gsap.set(fill!, { scaleY: self.progress }),
      });
      items.forEach((it, i) => {
        const h = document.getElementById(it.id);
        if (!h) return;
        ScrollTrigger.create({
          trigger: h,
          start: "top 60%",
          onEnter: () => setActive(i),
          onLeaveBack: () => setActive(Math.max(0, i - 1)),
        });
      });
    },
    { dependencies: [items, bodyId], scope: root },
  );

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -112, duration: 1.2 });
    else el.scrollIntoView();
  };

  if (!items.length) return null;
  return (
    <nav ref={root} aria-label="Case study sections" className="sticky top-[calc(var(--header-h)+2rem)] hidden lg:block">
      <div className="relative pl-5">
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-px bg-rule" />
        <span aria-hidden="true" data-fill className="absolute top-0 bottom-0 left-0 w-px origin-top scale-y-0 bg-signal" />
        <ol className="flex flex-col gap-3">
          {items.map((it, i) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                data-transition="none"
                aria-current={i === active ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(it.id);
                }}
                className={
                  "t-label block transition-colors " + (i === active ? "text-ink" : "text-ink-3-text hover:text-ink")
                }
              >
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span> {it.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
