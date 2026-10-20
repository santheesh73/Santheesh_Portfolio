import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import { getProject, nextProject, projects } from "@/content/projects";
import { CATEGORY_LABEL, known } from "@/content/schema";
import { ArchitectureDiagram } from "@/components/work/ArchitectureDiagram";
import { DrawOnScroll } from "@/components/work/DrawOnScroll";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { ProgressRail } from "@/components/work/ProgressRail";
import { NextProject } from "@/components/work/NextProject";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.summary };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { default: Body } = (await import(`@/content/work/${slug}.mdx`)) as {
    default: ComponentType<{ components?: MDXComponents }>;
  };
  const next = nextProject(slug);
  const order = projects.findIndex((p) => p.slug === slug) + 1;
  const nextOrder = projects.findIndex((p) => p.slug === next.slug) + 1;

  const year = known(project.year);
  const role = known(project.role);
  const context = known(project.context);
  const meta: { k: string; v: React.ReactNode }[] = [
    { k: "Status", v: <Chip status={project.status} /> },
    { k: "Category", v: CATEGORY_LABEL[project.category] },
    ...(year ? [{ k: "Year", v: year }] : []),
    ...(project.team === "team"
      ? [{ k: "Team", v: role ? `Built with a team; my role: ${role}` : "Built with a team" }]
      : role
        ? [{ k: "Role", v: role }]
        : []),
    { k: "Stack", v: project.stack.join(" · ") },
    ...(context ? [{ k: "Context", v: context }] : []),
  ];
  const links = [
    ...(project.links.live ? [{ label: "Live site", href: project.links.live }] : []),
    ...(!project.links.repoHidden ? [{ label: "Repository", href: project.links.repo }] : []),
  ];

  const components: MDXComponents = {
    Architecture: () =>
      project.architecture ? (
        <DrawOnScroll>
          <ArchitectureDiagram architecture={project.architecture} title={project.title} className="my-10" />
        </DrawOnScroll>
      ) : null,
    Guarantees: () =>
      project.guarantees.length ? (
        <ol className="measure my-8 divide-y divide-rule border-y border-rule">
          {project.guarantees.map((g, i) => (
            <li key={g} className="grid grid-cols-[3rem_1fr] py-4">
              <span className="t-label pt-1 text-ink-3-text">G{pad(i + 1)}</span>
              <span>{g}</span>
            </li>
          ))}
        </ol>
      ) : null,
  };

  return (
    <>
      <article>
        <header className="grid-12 gap-y-6 pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
          <div data-enter className="col-span-full">
            <SectionLabel text={`Case study · ${pad(order)} / ${pad(projects.length)}`} />
          </div>
          <SplitReveal as="h1" trigger="mount" className="t-section col-span-full max-w-[14ch]">
            {project.title}
          </SplitReveal>
          <p data-enter className="t-lede col-span-full max-w-[40ch] text-ink-2 md:col-span-8">
            {project.pitch}
          </p>
          <div
            data-flip-target={project.slug}
            className="relative col-span-full mt-6 aspect-[16/10] overflow-hidden border border-rule md:aspect-[16/9]"
          >
            <ProjectMedia project={project} sizes="100vw" priority className="h-full w-full" />
          </div>
          {project.media.kind !== "plate" && project.media.credit && (
            <p className="t-label col-span-full text-ink-3-text">{project.media.credit}</p>
          )}
        </header>

        <section aria-label="Project details" className="grid-12 mt-12 gap-y-0">
          <dl className="col-span-full grid border-t border-ink sm:grid-cols-2 lg:col-span-9 lg:col-start-3 lg:grid-cols-3">
            {meta.map((m) => (
              <div key={m.k} className="flex flex-col gap-2 border-b border-rule py-5 pr-6">
                <dt className="t-label text-ink-3-text">{m.k}</dt>
                <dd className="text-ink">{m.v}</dd>
              </div>
            ))}
            {links.length > 0 && (
              <div className="flex flex-col gap-2 border-b border-rule py-5 pr-6">
                <dt className="t-label text-ink-3-text">Links</dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-1">
                  {links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="Open ↗"
                      className="underline decoration-rule underline-offset-4 hover:decoration-ink"
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <div className="grid-12 pb-32">
          <aside className="col-span-2 hidden lg:block">
            <ProgressRail bodyId="case-body" />
          </aside>
          <div id="case-body" className="col-span-full lg:col-span-9 lg:col-start-3">
            <Body components={components} />
          </div>
        </div>
      </article>
      <NextProject slug={next.slug} title={next.title} pitch={next.pitch} position={`${pad(nextOrder)} / ${pad(projects.length)}`} />
    </>
  );
}
