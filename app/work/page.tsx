import type { Metadata } from "next";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { WorkIndex } from "@/components/work/WorkIndex";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { labProjects, workProjects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Every project: AI products, developer tools and platforms, each with its architecture.",
};

export default function Page() {
  return (
    <>
      <header className="grid-12 gap-y-6 pt-[calc(var(--header-h)+4rem)] pb-12 md:pt-[calc(var(--header-h)+7rem)]">
        <div data-enter className="col-span-full">
          <SectionLabel text={`Index · ${workProjects.length} projects`} />
        </div>
        <SplitReveal as="h1" trigger="mount" className="t-hero col-span-full">
          Work.
        </SplitReveal>
        <p data-enter className="t-lede col-span-full max-w-[38ch] text-ink-2 md:col-span-7">
          The model reads and explains. Deterministic code decides. Each project opens into a case study with its
          architecture.
        </p>
        <p data-enter className="t-label col-span-full self-end text-ink-3-text md:col-span-5 md:text-right">
          Smaller experiments live in the{" "}
          <Link href="/lab" className="hit text-ink underline decoration-rule underline-offset-4 hover:decoration-ink">
            Lab ({labProjects.length})
          </Link>
        </p>
      </header>
      <WorkIndex
        projects={workProjects}
        media={Object.fromEntries(
          workProjects.map((p) => [
            p.slug,
            <ProjectMedia key={p.slug} project={p} sizes="(min-width: 768px) 50vw, 100vw" className="h-full w-full" />,
          ]),
        )}
      />
    </>
  );
}
