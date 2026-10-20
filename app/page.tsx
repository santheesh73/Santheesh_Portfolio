import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { profile } from "@/content/profile";

export default function Home() {
  return (
    <>
      <Hero
        name={profile.name}
        thesis={profile.thesis}
        roles={profile.roles}
        location={`${profile.location.city}, ${profile.location.country}`}
      />
      {/* P4 replaces everything below with the home narrative. */}
      <section className="grid-12 min-h-[80dvh] content-center gap-y-6 py-24">
        <p className="t-section col-span-full max-w-[18ch]">{profile.philosophy}</p>
        <nav className="t-label col-span-full flex flex-wrap gap-6">
          <Link href="/work" className="underline underline-offset-4">
            Work
          </Link>
          <Link href="/work/pulse" className="underline underline-offset-4">
            Pulse
          </Link>
          <Link href="/about" className="underline underline-offset-4">
            About
          </Link>
        </nav>
      </section>
      <section
        id="contact"
        data-tone="ink"
        className="grid-12 min-h-[70dvh] content-center bg-ink py-24 text-paper"
      >
        <p className="t-section col-span-full">{profile.taglines.contact}</p>
      </section>
    </>
  );
}
