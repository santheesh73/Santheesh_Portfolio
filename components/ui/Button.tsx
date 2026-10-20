import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "ink" | "outline" | "signal";

const base =
  "group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-6 py-3 font-mono text-xs font-medium tracking-[0.12em] uppercase transition-colors duration-300";
const variants: Record<Variant, string> = {
  ink: "bg-ink text-paper hover:bg-signal",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  signal: "bg-signal text-sheet hover:bg-ink",
};

function Inner({ children, arrow }: { children: ReactNode; arrow?: string }) {
  return (
    <>
      <span className="relative">{children}</span>
      {arrow && (
        <span
          aria-hidden="true"
          className="relative inline-block transition-transform duration-300 ease-[var(--ease-structure)] group-hover:translate-x-1"
        >
          {arrow}
        </span>
      )}
    </>
  );
}

export function Button({
  variant = "ink",
  arrow,
  className,
  children,
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; arrow?: string }) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}

export function ButtonLink({
  variant = "ink",
  arrow = "→",
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; arrow?: string }) {
  return (
    <Link className={cn(base, variants[variant], className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}
