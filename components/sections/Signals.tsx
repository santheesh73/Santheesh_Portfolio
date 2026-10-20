import { SectionLabel } from "@/components/ui/SectionLabel";
import { Scramble } from "@/components/motion/Scramble";

/** GitHub readout. Static numbers with their date; no count-up theatrics. */
export function Signals({
  asOf,
  repos,
  stars,
  achievements,
  github,
  index,
  total,
}: {
  asOf: string;
  repos: number;
  stars: number;
  achievements: string[];
  github: string;
  index: number;
  total: number;
}) {
  const rows = [
    { k: "Public repositories", v: String(repos) },
    { k: "Stars", v: String(stars) },
  ];
  return (
    <section aria-labelledby="signals-title" className="bg-paper-2 py-24 md:py-32">
      <div className="grid-12 gap-y-10">
        <div className="col-span-full flex flex-col gap-6 md:col-span-4">
          <SectionLabel index={index} total={total} text="GitHub signals" />
          <h2 id="signals-title" className="t-display-sm">
            Public record.
          </h2>
          <p className="t-label text-ink-3-text">As of {asOf} · github.com/santheesh73</p>
        </div>
        <dl className="col-span-full grid grid-cols-2 border-t border-ink md:col-span-8">
          {rows.map((r) => (
            <div key={r.k} className="border-b border-rule py-6 pr-6 odd:border-r">
              <dt className="t-label text-ink-2">{r.k}</dt>
              <dd className="mt-3 font-mono text-[clamp(3.5rem,8vw,7.5rem)] leading-none font-medium tracking-[-0.04em] tabular-nums">
                <Scramble
                  as="span"
                  text={r.v}
                  className="!text-[length:inherit] !tracking-[inherit]"
                />
              </dd>
            </div>
          ))}
          <div className="col-span-2 border-b border-rule py-6">
            <dt className="t-label text-ink-2">Achievements</dt>
            <dd className="mt-3 flex flex-wrap gap-x-8 gap-y-2 font-display text-[clamp(1.5rem,2.6vw,2.5rem)] font-semibold tracking-[-0.02em]">
              {achievements.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </dd>
          </div>
        </dl>
        <div className="col-span-full pt-5 md:col-span-8 md:col-start-5">
          <a
            href={github}
            target="_blank"
            rel="noreferrer"
            data-cursor="Open ↗"
            className="t-label underline decoration-rule underline-offset-4 hover:decoration-ink"
          >
            Open GitHub profile ↗
          </a>
        </div>
      </div>
    </section>
  );
}
