import { Suspense } from "react";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Pipeline } from "@/components/sections/Pipeline";
import { WorkReel } from "@/components/sections/WorkReel";
import { Stack } from "@/components/sections/Stack";
import { Signals } from "@/components/sections/Signals";
import { profile } from "@/content/profile";
import { featuredProjects, projects, workProjects } from "@/content/projects";
import { stack } from "@/content/stack";
import { toolUsage } from "@/content/crossref";
import { PIPELINE } from "@/content/pipeline";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { DocumentGlyph } from "@/components/pipeline/DocumentGlyph";

// Each section sits in its own Suspense boundary so React hydrates them in
// separate tasks (shorter main-thread blocks) instead of one long pass.
// Home sequence: hero 01, manifesto 02 … signals 06, contact footer 07 (rendered by the layout).
const TOTAL = 7;

export default function Home() {
  const gh = profile.githubSignals;
  return (
    <>
      <Hero
        name={profile.name}
        thesis={profile.thesis}
        roles={profile.roles}
        location={`${profile.location.city}, ${profile.location.country}`}
      />
      <Suspense>
        <Manifesto sentence={profile.philosophy} source="github.com/santheesh73" index={2} total={TOTAL} />
      </Suspense>
      <Suspense>
        <Pipeline
          stages={PIPELINE}
          docs={Object.fromEntries(PIPELINE.map((s) => [s.id, <DocumentGlyph key={s.id} variant={s.doc} />]))}
          index={3}
          total={TOTAL}
        />
      </Suspense>
      <Suspense>
        <WorkReel
          projects={featuredProjects}
          media={Object.fromEntries(
            featuredProjects.map((p) => [
              p.slug,
              <ProjectMedia key={p.slug} project={p} sizes="(min-width: 768px) 56vw, 100vw" className="h-full w-full" />,
            ]),
          )}
          totalWork={workProjects.length}
          index={4}
          total={TOTAL}
        />
      </Suspense>
      <Suspense>
        <Stack
          layers={stack.map((l) => ({ id: l.id, title: l.title, tools: l.tools.map((t) => t.name) }))}
          usage={toolUsage(stack, projects)}
          projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
          index={5}
          total={TOTAL}
        />
      </Suspense>
      <Suspense>
        <Signals
          asOf={gh.asOf}
          repos={gh.publicRepos}
          stars={gh.stars}
          achievements={gh.achievements}
          github={profile.links.github}
          index={6}
          total={TOTAL}
        />
      </Suspense>
    </>
  );
}
