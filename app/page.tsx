import Link from "next/link";

// P0 placeholder. The real home narrative lands in P3/P4.
export default function Home() {
  return (
    <section className="grid-12 min-h-dvh content-center gap-y-8 py-24">
      <p className="t-label text-ink-3-text col-span-full">[ build P0 ] signal → structure</p>
      <h1 className="t-hero col-span-full">
        Santheesh
        <br />S<span className="text-signal">.</span>
      </h1>
      <p className="t-lede text-ink-2 col-span-full max-w-[32ch] md:col-span-6 md:col-start-7">
        AI is one part of the system. I engineer the rest.
      </p>
      <Link href="/styleguide" className="t-label col-span-full underline underline-offset-4">
        Styleguide →
      </Link>
    </section>
  );
}
