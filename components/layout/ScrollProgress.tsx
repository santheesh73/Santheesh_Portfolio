"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { usePathname } from "next/navigation";

/** 1px cobalt line at the top edge, scaled by document scroll progress. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const setX = gsap.quickSetter(el, "scaleX");
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => setX(self.progress),
        onRefresh: (self) => setX(self.progress),
      });
      return () => st.kill();
    },
    { dependencies: [pathname] },
  );
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-px origin-left scale-x-0 bg-signal"
    />
  );
}
