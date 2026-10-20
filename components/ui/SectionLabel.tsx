import { Scramble } from "@/components/motion/Scramble";
import { cn } from "@/lib/cn";

/** Mono section marker: `[ 02 / 07 ] THESIS`. The index is shown only for real sequences. */
export function SectionLabel({
  index,
  total,
  text,
  className,
  tone = "ink",
}: {
  index?: number;
  total?: number;
  text: string;
  className?: string;
  tone?: "ink" | "paper";
}) {
  const seq = index && total ? `[ ${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")} ]  ` : "";
  return (
    <Scramble
      as="p"
      text={`${seq}${text}`}
      className={cn(tone === "paper" ? "text-paper/60" : "text-ink-3-text", "whitespace-pre", className)}
    />
  );
}
