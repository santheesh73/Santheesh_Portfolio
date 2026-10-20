import { z } from "zod";

import { isTodo, TODO_PREFIX, type Todo } from "./helpers";

export { TODO_PREFIX, isTodo, known, CATEGORY_LABEL, type Todo } from "./helpers";

const todo = z.custom<Todo>(isTodo, { message: `must start with "${TODO_PREFIX}"` });
const text = z.string().min(1);
const maybe = <T extends z.ZodTypeAny>(schema: T) => z.union([schema, todo]);
const url = z.url({ protocol: /^https$/ });

export const StatusSchema = z.enum(["live", "repository", "team", "progress"]);
export type ProjectStatus = z.infer<typeof StatusSchema>;

export const CategorySchema = z.enum(["ai-product", "devtool", "platform"]);
export type ProjectCategory = z.infer<typeof CategorySchema>;

/** model = probabilistic (cobalt), engine = deterministic (ink), io = data in/out. */
export const NodeKindSchema = z.enum(["model", "engine", "io", "store"]);
export type NodeKind = z.infer<typeof NodeKindSchema>;

export const ArchitectureSchema = z
  .object({
    nodes: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          label: text,
          detail: z.string().optional(),
          kind: NodeKindSchema,
          /** column / row on the diagram's grid (0-based) */
          col: z.number().int().min(0).max(5),
          row: z.number().int().min(0).max(3),
        }),
      )
      .min(2),
    edges: z.array(z.tuple([z.string(), z.string()])).min(1),
  })
  .superRefine((a, ctx) => {
    const ids = new Set(a.nodes.map((n) => n.id));
    for (const [from, to] of a.edges) {
      if (!ids.has(from) || !ids.has(to))
        ctx.addIssue({ code: "custom", message: `edge ${from}→${to} references unknown node` });
    }
  });
export type Architecture = z.infer<typeof ArchitectureSchema>;

export const MediaSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("image"),
    src: z.string().startsWith("/media/"),
    width: z.number().int(),
    height: z.number().int(),
    alt: text,
    credit: z.string().optional(),
  }),
  z.object({
    kind: z.literal("video"),
    src: z.string().startsWith("/media/"),
    poster: z.string().startsWith("/media/"),
    width: z.number().int(),
    height: z.number().int(),
    alt: text,
    credit: z.string().optional(),
  }),
  /** Typographic "spec plate" rendered in code — used when there is no real UI to show. */
  z.object({ kind: z.literal("plate"), alt: text }),
]);
export type Media = z.infer<typeof MediaSchema>;

export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: text,
  /** One line, plain voice. */
  pitch: text,
  /** Short paragraph for indexes and OG. */
  summary: text,
  status: StatusSchema,
  category: CategorySchema,
  /** where it is listed: main work index or the lab */
  shelf: z.enum(["work", "lab"]),
  year: maybe(z.string().regex(/^\d{4}$/)),
  /** "Solo" or "Built with a team; my role: …" */
  team: z.enum(["solo", "team"]),
  role: maybe(text),
  roleSource: z.string().optional(),
  stack: z.array(text).min(1),
  links: z.object({
    repo: url,
    live: url.optional(),
    /** Repo is private or unreachable publicly: keep the URL on record but do not link it. */
    repoHidden: z.boolean().default(false),
  }),
  context: maybe(text).optional(),
  facts: z.array(text).default([]),
  guarantees: z.array(text).default([]),
  architecture: ArchitectureSchema.optional(),
  media: MediaSchema,
  /** Open questions for this project; listed in TODO_CONTENT.md, never rendered. */
  todos: z.array(todo).default([]),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProfileSchema = z.object({
  name: text,
  headline: text,
  roles: z.array(text),
  location: z.object({ city: text, region: text, country: text, timezone: text }),
  email: z.email(),
  links: z.object({ github: url, linkedin: url }),
  builds: z.array(text),
  focus: z.array(z.object({ title: text, detail: text })),
  philosophy: text,
  taglines: z.object({ motto: text, contact: text }),
  thesis: text,
  bootLog: z.array(text),
  principles: z.array(z.object({ title: text, detail: text })),
  bio: z.array(text),
  portrait: maybe(z.string().startsWith("/")),
  resume: maybe(z.string().startsWith("/")),
  education: z.array(z.object({ title: text, org: text, years: text })).or(todo),
  experience: z.array(z.object({ title: text, org: text, years: text })).or(todo),
  githubSignals: z.object({
    asOf: text,
    publicRepos: z.number().int(),
    stars: z.number().int(),
    achievements: z.array(text),
  }),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const StackLayerSchema = z.object({
  id: z.string(),
  title: text,
  tools: z.array(z.object({ name: text, aliases: z.array(text).default([]) })).min(1),
});
export type StackLayer = z.infer<typeof StackLayerSchema>;
