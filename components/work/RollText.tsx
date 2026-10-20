import { cn } from "@/lib/cn";

/**
 * Letters roll on hover of the nearest `.group`: each char is stacked twice and
 * slides up with a per-letter delay. Screen readers get the plain text once.
 */
export function RollText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-block", className)}>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden="true" className="relative inline-block overflow-hidden align-bottom">
          <span
            className="inline-block transition-transform duration-500 ease-[var(--ease-structure)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
          <span
            className="absolute top-full left-0 inline-block transition-transform duration-500 ease-[var(--ease-structure)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
        </span>
      ))}
    </span>
  );
}
