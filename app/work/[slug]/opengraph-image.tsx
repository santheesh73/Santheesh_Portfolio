import { renderOG, OG_SIZE } from "@/lib/og";
import { getProject, projects } from "@/content/projects";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return [{ id: "og", alt: p ? `${p.title}: ${p.pitch}` : "Case study", size: OG_SIZE, contentType }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug)!;
  return renderOG({ kicker: "Case study", title: p.title, line: p.pitch });
}
