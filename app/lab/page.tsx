import type { Metadata } from "next";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const metadata: Metadata = { title: "Lab" };

// Placeholder shell for route-transition testing; designed in P5.
export default function Page() {
  return (
    <section className="grid-12 min-h-dvh content-center gap-y-8 py-28">
      <p data-enter className="t-label col-span-full text-ink-3-text">
        /lab
      </p>
      <SplitReveal as="h1" trigger="mount" className="t-hero col-span-full">
        Lab
      </SplitReveal>
      <Link data-enter href="/" className="t-label col-span-full underline underline-offset-4">
        ← Index
      </Link>
    </section>
  );
}
