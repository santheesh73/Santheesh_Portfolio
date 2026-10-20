import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import { getProject, projects } from "@/content/projects";
import { ArchitectureDiagram } from "@/components/work/ArchitectureDiagram";
import { ProjectMedia } from "@/components/work/ProjectMedia";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.pitch };
}

// P1 draft template: content check only. The designed case-study template lands in P5.
export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { default: Body } = (await import(`@/content/work/${slug}.mdx`)) as {
    default: ComponentType<{ components?: MDXComponents }>;
  };

  const components: MDXComponents = {
    Architecture: () =>
      project.architecture ? (
        <ArchitectureDiagram
          architecture={project.architecture}
          title={project.title}
          className="my-10"
        />
      ) : null,
    Guarantees: () =>
      project.guarantees.length ? (
        <ol className="measure my-8 divide-y divide-rule border-y border-rule">
          {project.guarantees.map((g, i) => (
            <li key={g} className="grid grid-cols-[3rem_1fr] py-4">
              <span className="t-label pt-1 text-ink-3-text">
                G{String(i + 1).padStart(2, "0")}
              </span>
              <span>{g}</span>
            </li>
          ))}
        </ol>
      ) : null,
  };

  return (
    <article className="grid-12 py-28">
      <header className="col-span-full mb-12">
        <p className="t-label text-ink-3-text">Case study</p>
        <h1 className="t-section mt-4">{project.title}</h1>
        <p className="t-lede mt-6 max-w-[40ch] text-ink-2">{project.pitch}</p>
      </header>
      <div
        data-flip-target={project.slug}
        className="relative col-span-full mb-16 aspect-[16/10] overflow-hidden border border-rule"
      >
        <ProjectMedia project={project} sizes="100vw" priority className="h-full w-full" />
      </div>
      <div className="col-span-full lg:col-span-10 lg:col-start-2">
        <Body components={components} />
      </div>
    </article>
  );
}
