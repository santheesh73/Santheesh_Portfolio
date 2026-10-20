import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { projects, featuredProjects, nextProject, FEATURED } from "./projects";
import { profile } from "./profile";
import { stack } from "./stack";
import { toolUsage } from "./crossref";
import { known, isTodo } from "./schema";

describe("content", () => {
  it("parses and keeps the featured order", () => {
    expect(featuredProjects.map((p) => p.slug)).toEqual([...FEATURED]);
  });

  it("has an MDX case study for every project", () => {
    for (const p of projects) {
      expect(existsSync(path.join(__dirname, "work", `${p.slug}.mdx`)), p.slug).toBe(true);
    }
  });

  it("references media files that exist", () => {
    for (const p of projects) {
      if (p.media.kind === "plate") continue;
      const files = [p.media.src, ...(p.media.kind === "video" ? [p.media.poster] : [])];
      for (const f of files)
        expect(existsSync(path.join(process.cwd(), "public", f)), f).toBe(true);
    }
  });

  it("loops next-project through the whole work shelf", () => {
    const seen = new Set<string>();
    let s = "pulse";
    for (let i = 0; i < 20; i++) {
      seen.add(s);
      s = nextProject(s).slug;
    }
    expect(seen.size).toBe(projects.filter((p) => p.shelf === "work").length);
  });

  it("cross-references every stack tool against at least the data shape", () => {
    const usage = toolUsage(stack, projects);
    expect(usage["FastAPI"]).toContain("minchal");
    expect(usage["WebLLM"]).toEqual(["orion"]);
    expect(usage["Gemma"]).toContain("ahal");
  });

  it("hides TODO values", () => {
    expect(isTodo(profile.portrait)).toBe(true);
    expect(known(profile.portrait)).toBeUndefined();
    expect(known(profile.email)).toBe("santheesh737@gmail.com");
  });
});
