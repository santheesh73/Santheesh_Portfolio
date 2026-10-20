/**
 * Zod-free content helpers, safe to import from client components
 * (content/schema.ts pulls in zod, which must stay on the server).
 */
import type { ProjectCategory } from "./schema";

/**
 * Unknown facts are written as `TODO(santheesh): …` strings. They pass validation,
 * get listed in TODO_CONTENT.md, and are never rendered (see `known()`).
 */
export const TODO_PREFIX = "TODO(santheesh):";
export type Todo = `TODO(santheesh):${string}`;

export const isTodo = (v: unknown): v is Todo => typeof v === "string" && v.startsWith(TODO_PREFIX);

/** Returns the value only if it is a real, filled-in fact. */
export function known<T>(v: T | Todo | undefined | null): T | undefined {
  if (v === undefined || v === null || isTodo(v)) return undefined;
  return v;
}

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  "ai-product": "AI products",
  devtool: "Developer tools",
  platform: "Platforms",
};
