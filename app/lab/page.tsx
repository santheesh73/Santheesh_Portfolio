import type { Metadata } from "next";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Scramble } from "@/components/motion/Scramble";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { SnapGrid } from "@/components/lab/SnapGrid";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { getProject, labProjects } from "@/content/projects";
import { SLOP_RULES_SOURCE, slopRules } from "@/content/lab";

export const metadata: Metadata = {
  title: "Lab",
  description: "Smaller experiments and tools: the Orchestrate skill and the internals of Frontend Craft.",
};

const CRAFT_PARTS = [
  { name: "Contract", line: "A design direction stored in .craft/, so it survives every session." },
  { name: "Checks", line: "The craft CLI and its Slop Lint rules." },
  { name: "Proof", line: "No receipt, no claim. Agents report only what a generated report supports." },
  { name: "Benchmark", line: "A paired evaluation harness against a baseline." },
];

export default function Page() {
  const craft = getProject("frontend-craft");
  return (
    <div className="pb-32">
      <header className="grid-12 gap-y-6 pt-[calc(var(--header-h)+4rem)] pb-16 md:pt-[calc(var(--header-h)+7rem)]">
        <div data-enter className="col-span-full">
          <SectionLabel text="Lab · experiments & tools" />
        </div>
        <SplitReveal as="h1" trigger="mount" className="t-hero col-span-full">
          Lab.
        </SplitReveal>
        <p data-enter className="t-lede col-span-full max-w-[40ch] text-ink-2 md:col-span-7">
          Smaller tools, and the parts inside the bigger ones. Same rule everywhere: the model describes, code
          decides.
        </p>
      </header>

      <SnapGrid className="gap-[var(--gutter)] md:gap-4">
        {labProjects.map((p) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}`}
            data-tile
            data-transition="flip"
            data-flip-id={p.slug}
            data-cursor="View case"
            className="group col-span-full flex flex-col border border-ink bg-sheet md:col-span-8 md:row-span-2"
          >
            <div data-flip-source className="relative aspect-[16/10] overflow-hidden border-b border-rule">
              <ProjectMedia project={p} sizes="(min-width: 768px) 66vw, 100vw" className="h-full w-full" />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Chip status={p.status} />
                <span className="t-label text-ink-2">{p.stack.join(" · ")}</span>
              </div>
              <p className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-none font-semibold tracking-[-0.035em] group-hover:text-signal">
                {p.title}
              </p>
              <p className="max-w-[48ch] text-ink-2">{p.pitch}</p>
            </div>
          </Link>
        ))}

        <section
          data-tile
          aria-labelledby="craft-parts"
          className="col-span-full flex flex-col justify-between gap-6 bg-ink p-5 text-paper md:col-span-4 md:row-span-2 md:p-6"
        >
          <div className="flex flex-col gap-3">
            <p className="t-label text-paper/60">Frontend Craft · internals</p>
            <h2 id="craft-parts" className="t-display-sm">
              Four parts.
            </h2>
          </div>
          <ol className="flex flex-col divide-y divide-paper/15 border-y border-paper/15">
            {CRAFT_PARTS.map((c, i) => (
              <li key={c.name} className="grid grid-cols-[2.25rem_1fr] gap-x-2 py-3">
                <span className="t-label pt-1 text-paper/50 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="font-display text-xl font-semibold">{c.name}</span>
                  <span className="mt-1 block text-sm text-paper/70">{c.line}</span>
                </span>
              </li>
            ))}
          </ol>
          {craft && (
            <Link href={`/work/${craft.slug}`} className="t-label w-fit underline decoration-paper/30 underline-offset-4 hover:decoration-paper">
              Frontend Craft case study →
            </Link>
          )}
        </section>

        <header data-tile className="col-span-full mt-16 flex flex-wrap items-end justify-between gap-4 md:mt-20">
          <h2 className="t-section">Slop Lint.</h2>
          <p className="t-label max-w-[44ch] text-ink-3-text md:text-right">
            The {slopRules.length} rules the craft CLI checks a frontend against · {SLOP_RULES_SOURCE}
          </p>
        </header>

        {slopRules.map((r, i) => (
          <article
            key={r.id}
            data-tile
            className="group col-span-full flex min-h-40 flex-col justify-between gap-6 border border-rule bg-paper p-4 transition-colors hover:border-ink sm:col-span-6 md:col-span-4 lg:col-span-3"
          >
            <div className="flex items-start justify-between gap-3">
              <Scramble as="h3" trigger="hover" text={r.id} className="text-ink" />
              <span className="t-label text-ink-3-text tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <p className="text-sm text-ink-2">{r.description}</p>
          </article>
        ))}
      </SnapGrid>
    </div>
  );
}
