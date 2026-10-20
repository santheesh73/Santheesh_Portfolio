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
  p: ({ children }) => <p className="measure mb-5 text-ink-2">{children}</p>,
  ul: ({ children }) => <ul className="measure mb-6 space-y-2 text-ink-2">{children}</ul>,
  li: ({ children }) => (
    <li className="relative pl-6 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-3 before:bg-ink">
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded-xs bg-paper-2 px-1.5 py-0.5 font-mono text-code text-ink">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="t-lede my-10 max-w-[30ch] border-l-2 border-signal pl-6 text-ink">
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
