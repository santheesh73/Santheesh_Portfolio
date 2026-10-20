import type { Metadata } from "next";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Clock } from "@/components/layout/Clock";
import { ButtonLink } from "@/components/ui/Button";
import { known } from "@/content/schema";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: profile.bio[0],
};

export default function Page() {
  const resume = known(profile.resume);
  const facts = [
    { k: "Based in", v: `${profile.location.city}, ${profile.location.region}, ${profile.location.country}` },
    { k: "Email", v: profile.email, href: `mailto:${profile.email}` },
    { k: "GitHub", v: "github.com/santheesh73", href: profile.links.github },
    { k: "LinkedIn", v: "in/santheesh-s", href: profile.links.linkedin },
  ];

  return (
    <div className="pb-32">
      <header className="grid-12 gap-y-6 pt-[calc(var(--header-h)+4rem)] pb-20 md:pt-[calc(var(--header-h)+7rem)]">
        <div data-enter className="col-span-full">
          <SectionLabel text="About · Santheesh S" />
        </div>
        <SplitReveal as="h1" trigger="mount" className="t-hero col-span-full">
          About.
        </SplitReveal>
      </header>

      <section aria-label="Bio" className="grid-12 gap-y-12 border-t border-ink pt-10">
        <div className="col-span-full flex flex-col gap-6 lg:col-span-7">
          {profile.bio.map((b, i) => (
            <SplitReveal
              key={i}
              as="p"
              className={i === 0 ? "t-lede max-w-[34ch] text-ink" : "max-w-[60ch] text-lg text-ink-2"}
            >
              {b}
            </SplitReveal>
          ))}
          {resume && (
            <ButtonLink href={resume} className="w-fit" data-transition="none">
              Resume (PDF)
            </ButtonLink>
          )}
        </div>
        <dl className="col-span-full grid content-start gap-y-5 md:grid-cols-2 md:gap-x-[var(--gutter)] lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
          {facts.map((f) => (
            <div key={f.k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-rule pb-4">
              <dt className="t-label text-ink-3-text">{f.k}</dt>
              <dd className="text-ink [overflow-wrap:anywhere]">
                {f.href ? (
                  <a
                    href={f.href}
                    target={f.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    data-transition="none"
                    className="underline decoration-rule underline-offset-4 hover:decoration-ink"
                  >
                    {f.v}
                  </a>
                ) : (
                  f.v
                )}
              </dd>
            </div>
          ))}
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-rule pb-4">
            <dt className="t-label text-ink-3-text">Local time</dt>
            <dd>
              <Clock className="text-ink" />
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="how" className="grid-12 mt-32 gap-y-10">
        <div className="col-span-full flex flex-col gap-4 md:col-span-4">
          <SectionLabel text="How I work" />
          <SplitReveal as="h2" id="how" className="t-section">
            Three rules.
          </SplitReveal>
        </div>
        <ol className="col-span-full border-t border-ink md:col-span-8">
          {profile.principles.map((p, i) => (
            <li key={p.title} className="grid gap-x-6 gap-y-3 border-b border-rule py-8 md:grid-cols-[4rem_1fr]">
              <span className="t-label pt-2 text-ink-3-text tabular-nums">
                {String(i + 1).padStart(2, "0")} / {String(profile.principles.length).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-3">
                <SplitReveal as="h3" className="t-display-sm">
                  {p.title}
                </SplitReveal>
                <p className="max-w-[58ch] text-ink-2">{p.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="focus" className="mt-32 bg-paper-2 py-24">
        <div className="grid-12 gap-y-10">
          <div className="col-span-full flex flex-col gap-4 md:col-span-4">
            <SectionLabel text="Current focus" />
            <SplitReveal as="h2" id="focus" className="t-section">
              Now.
            </SplitReveal>
          </div>
          <ul className="col-span-full grid gap-px bg-rule md:col-span-8 md:grid-cols-2">
            {profile.focus.map((f) => (
              <li key={f.title} className="flex flex-col gap-3 bg-paper-2 p-6">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">{f.title}</h3>
                <p className="text-ink-2">{f.detail}</p>
              </li>
            ))}
          </ul>
          <div className="col-span-full flex flex-col gap-4 md:col-span-8 md:col-start-5">
            <p className="t-label text-ink-3-text">What I build</p>
            <p className="font-display text-[clamp(1.5rem,3vw,2.75rem)] leading-tight font-semibold tracking-[-0.025em]">
              {profile.builds.join(" · ")}
            </p>
            <Link href="/work" className="t-label mt-4 w-fit underline decoration-rule underline-offset-4 hover:decoration-ink">
              See the work →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
