import type { Project } from "@/content/schema";
import { CATEGORY_LABEL } from "@/content/helpers";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { cn } from "@/lib/cn";

/**
 * Blueprint poster for projects without a UI to capture. Never imitates a
 * screenshot: the real architecture on a grid with mono specs. The title is
 * left to the surrounding plate or page heading.
 */
export function SpecPlate({ project, className }: { project: Project; className?: string }) {
  return (
    <div
      className={cn("relative flex h-full w-full flex-col justify-between overflow-hidden bg-sheet p-[4%]", className)}
      style={{
        backgroundImage:
          "linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)",
        backgroundSize: "calc(100% / 12) calc(100% / 8)",
        backgroundPosition: "-1px -1px",
      }}
    >
      <div className="flex items-start justify-between gap-4 font-mono text-[clamp(10px,0.8vw,11px)] tracking-[0.12em] text-ink-2 uppercase">
        <span>Spec plate — {project.slug}</span>
        <span>{project.stack.slice(0, 4).join(" · ")}</span>
      </div>
      {project.architecture ? (
        <div className="mx-auto w-[88%] opacity-90">
          <ArchitectureDiagram architecture={project.architecture} title={project.title} compact />
        </div>
      ) : (
        <p className="max-w-[30ch] font-mono text-[clamp(11px,1.1vw,14px)] text-ink-2">{project.summary}</p>
      )}
      <div className="flex items-end justify-between gap-4 font-mono text-[clamp(10px,0.8vw,11px)] tracking-[0.12em] text-ink-2 uppercase">
        <span>{CATEGORY_LABEL[project.category]}</span>
        <span>{project.architecture ? "Architecture" : "Summary"}</span>
      </div>
    </div>
  );
}
