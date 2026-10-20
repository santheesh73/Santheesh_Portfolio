import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/about", "/lab"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const cases = projects.map((p) => ({
    url: `${SITE_URL}/work/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...cases];
}
