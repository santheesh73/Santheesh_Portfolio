import type { MDXComponents } from "mdx/types";
import { caseStudyComponents } from "@/components/work/mdx";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...caseStudyComponents, ...components };
}
