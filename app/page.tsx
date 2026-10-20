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
      <Manifesto sentence={profile.philosophy} source="github.com/santheesh73" index={2} total={TOTAL} />
      <Pipeline stages={PIPELINE} index={3} total={TOTAL} />
      <WorkReel projects={featuredProjects} totalWork={workProjects.length} index={4} total={TOTAL} />
      <Stack
        layers={stack.map((l) => ({ id: l.id, title: l.title, tools: l.tools.map((t) => t.name) }))}
        usage={toolUsage(stack, projects)}
        projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
        index={5}
        total={TOTAL}
      />
      <Signals
        asOf={gh.asOf}
        repos={gh.publicRepos}
        stars={gh.stars}
        achievements={gh.achievements}
        github={profile.links.github}
        index={6}
        total={TOTAL}
      />
    </>
  );
}
