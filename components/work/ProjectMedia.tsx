import type { Project } from "@/content/schema";
import { SpecPlate } from "./SpecPlate";
import { InViewVideo } from "./InViewVideo";
import { cn } from "@/lib/cn";
import { imgProps } from "@/lib/img";

/**
 * Project media at a fixed aspect: looping muted video (plays only while in
 * view, poster only under reduced motion), image, or a spec plate.
 * A server component: images go through the Next image optimizer (`lib/img`),
 * so no image runtime ships to the client. Client components receive it
 * pre-rendered as a prop.
 */
export function ProjectMedia({
  project,
  className,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
}: {
  project: Project;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const m = project.media;
  const img = (src: string, alt: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...imgProps(src, { sizes, priority })} alt={alt} className="absolute inset-0 h-full w-full object-cover object-top" />
  );

  return (
    <div className={cn("relative overflow-hidden bg-paper-2", className)}>
      {m.kind === "video" && (
        <>
          {img(m.poster, "")}
          <InViewVideo src={m.src} label={m.alt} />
        </>
      )}
      {m.kind === "image" && img(m.src, m.alt)}
      {m.kind === "plate" && <SpecPlate project={project} />}
    </div>
  );
}
