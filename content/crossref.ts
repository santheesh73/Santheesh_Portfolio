import type { Project, StackLayer } from "./schema";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Map each stack tool name → slugs of projects that use it (via name or aliases). */
export function toolUsage(layers: StackLayer[], list: Project[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const layer of layers) {
    for (const tool of layer.tools) {
      const keys = new Set([tool.name, ...tool.aliases].map(norm));
      out[tool.name] = list
        .filter((p) => p.stack.some((s) => keys.has(norm(s))))
        .map((p) => p.slug);
    }
  }
  return out;
}
