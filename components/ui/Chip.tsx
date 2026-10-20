import { cn } from "@/lib/cn";

export type Status = "live" | "repository" | "team" | "progress" | "open";

const STYLES: Record<Status, { label: string; dot: string; ring: string }> = {
  live: { label: "Live", dot: "bg-live", ring: "border-live/40 text-ink" },
  repository: { label: "Repository", dot: "bg-ink", ring: "border-rule text-ink" },
  team: { label: "Team build", dot: "bg-amber", ring: "border-amber/40 text-ink" },
  progress: { label: "In progress", dot: "bg-amber", ring: "border-amber/40 text-ink" },
  open: { label: "Open to roles & collaborations", dot: "bg-live", ring: "border-rule text-ink" },
};

/** Status chip. The only rounded-pill element besides buttons. */
export function Chip({
  status,
  label,
  className,
}: {
  status: Status;
  label?: string;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "bg-sheet/70 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.6875rem] font-medium tracking-[0.1em] uppercase",
        s.ring,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("relative size-1.5 rounded-full", s.dot)}>
        {(status === "live" || status === "open") && (
          <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", s.dot)} />
        )}
      </span>
      {label ?? s.label}
    </span>
  );
}
