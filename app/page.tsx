import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Scramble } from "@/components/motion/Scramble";

// P2 placeholder. The real home narrative lands in P3/P4.
export default function Home() {
  return (
    <>
      <section className="grid-12 min-h-dvh content-center gap-y-8 py-24">
        <Scramble
          as="p"
          text="[ build P2 ] signal → structure"
          trigger="mount"
          className="col-span-full text-ink-3-text"
        />
        <SplitReveal as="h1" trigger="mount" className="t-hero col-span-full">
          Santheesh S<span className="text-signal">.</span>
        </SplitReveal>
        <p
          data-enter
          className="t-lede col-span-full max-w-[32ch] text-ink-2 md:col-span-6 md:col-start-7"
        >
          AI is one part of the system. I engineer the rest.
        </p>
        <nav data-enter className="t-label col-span-full flex flex-wrap gap-6">
          <Link href="/work" className="underline underline-offset-4">
            Work
          </Link>
          <Link href="/work/pulse" className="underline underline-offset-4">
            Pulse
          </Link>
          <Link href="/about" className="underline underline-offset-4">
            About
          </Link>
          <Link href="/styleguide" className="underline underline-offset-4">
            Styleguide
          </Link>
        </nav>
      </section>
      <section
        id="contact"
        data-tone="ink"
        className="grid-12 min-h-[70dvh] content-center bg-ink py-24 text-paper"
      >
        <p className="t-section col-span-full">Let&apos;s build something useful.</p>
      </section>
    </>
  );
}
