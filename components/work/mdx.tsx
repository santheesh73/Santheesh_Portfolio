import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

/**
 * Base MDX element mapping for case studies. Project-aware components
 * (Architecture, Guarantees) are injected per page in app/work/[slug].
 */
export const caseStudyComponents: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="t-display-sm mt-24 mb-8 scroll-mt-28" id={slugify(children)}>
      {children}
    </h2>
  ),
  p: ({ children }) => <p className="measure text-ink-2 mb-5">{children}</p>,
  ul: ({ children }) => <ul className="measure text-ink-2 mb-6 space-y-2">{children}</ul>,
  li: ({ children }) => (
    <li className="before:bg-ink relative pl-6 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-3">
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="text-ink font-medium">{children}</strong>,
  code: ({ children }) => (
    <code className="bg-paper-2 text-ink rounded-xs px-1.5 py-0.5 font-mono text-[0.88em]">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="t-lede border-signal text-ink my-10 max-w-[30ch] border-l-2 pl-6">
      {children}
    </blockquote>
  ),
  /** Unknown content: never rendered. Tracked in TODO_CONTENT.md. */
  Todo: () => null,
  Architecture: () => null,
  Guarantees: () => null,
};

export function slugify(children: ReactNode): string {
  const text =
    typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
