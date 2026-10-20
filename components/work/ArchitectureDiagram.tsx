import type { Architecture, NodeKind } from "@/content/schema";
import { cn } from "@/lib/cn";

const W = 156;
const H = 66;
const GX = 196;
const GY = 112;
const PAD = 24;

const KIND_LABEL: Record<NodeKind, string> = {
  model: "MODEL",
  engine: "ENGINE",
  io: "I/O",
  store: "STORE",
};

type Pt = { x: number; y: number };

function pos(col: number, row: number): Pt {
  return { x: PAD + col * GX, y: PAD + 18 + row * GY };
}

function edgePath(a: Pt, b: Pt): string {
  if (a.x === b.x) {
    const down = b.y > a.y;
    const x = a.x + W / 2;
    return `M${x} ${down ? a.y + H : a.y} V${down ? b.y : b.y + H}`;
  }
  const x1 = a.x + W;
  const y1 = a.y + H / 2;
  const x2 = b.x;
  const y2 = b.y + H / 2;
  if (y1 === y2) return `M${x1} ${y1} H${x2}`;
  const mx = x1 + (x2 - x1) / 2;
  return `M${x1} ${y1} H${mx} V${y2} H${x2}`;
}

/**
 * Architecture as a blueprint: model nodes in cobalt, deterministic nodes in ink.
 * Static SVG (server-rendered); strokes carry `data-draw` so a client wrapper can
 * scrub stroke-dashoffset on scroll.
 */
export function ArchitectureDiagram({
  architecture,
  title,
  className,
  compact = false,
}: {
  architecture: Architecture;
  title: string;
  className?: string;
  /** Plate use: no caption, no minimum width, decorative. */
  compact?: boolean;
}) {
  const { nodes, edges } = architecture;
  const maxCol = Math.max(...nodes.map((n) => n.col));
  const maxRow = Math.max(...nodes.map((n) => n.row));
  const minRow = Math.min(...nodes.map((n) => n.row));
  const vbW = PAD * 2 + maxCol * GX + W;
  const top = PAD + 18 + minRow * GY - 30;
  const vbH = (maxRow - minRow) * GY + H + 60;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <figure className={cn("not-prose", className)}>
      <div
        className={compact ? "" : "overflow-x-auto overscroll-x-contain"}
        // the full diagram scrolls sideways on narrow screens, so keyboards must be able to reach it
        tabIndex={compact ? undefined : 0}
        role={compact ? undefined : "region"}
        aria-label={compact ? undefined : "Architecture diagram"}
      >
        <svg
          viewBox={`0 ${top} ${vbW} ${vbH}`}
          className={cn("block h-auto w-full", !compact && "min-w-[640px]")}
          role={compact ? undefined : "img"}
          aria-hidden={compact || undefined}
          aria-label={compact ? undefined : `${title} architecture: ${nodes.map((n) => n.label).join(", ")}`}
        >
          <defs>
            <marker
              id="arr"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
            </marker>
          </defs>
          <g fill="none" stroke="var(--ink)" strokeWidth="1.1">
            {edges.map(([from, to]) => {
              const a = byId.get(from)!;
              const b = byId.get(to)!;
              const isModel = a.kind === "model" || b.kind === "model";
              return (
                <path
                  key={`${from}-${to}`}
                  data-draw="edge"
                  d={edgePath(pos(a.col, a.row), pos(b.col, b.row))}
                  markerEnd={`url(#arr-${title.replace(/\W/g, "")}${compact ? "-c" : ""})`}
                  stroke={isModel ? "var(--signal)" : "var(--ink)"}
                  strokeDasharray={isModel ? "3 3" : undefined}
                />
              );
            })}
          </g>
          {nodes.map((n) => {
            const p = pos(n.col, n.row);
            const model = n.kind === "model";
            const stroke = model
              ? "var(--signal)"
              : n.kind === "io"
                ? "var(--ink-3)"
                : "var(--ink)";
            return (
              <g key={n.id} data-draw="node" data-kind={n.kind}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={W}
                  height={H}
                  rx={n.kind === "io" ? 0 : 3}
                  fill={model ? "var(--signal-2)" : "var(--sheet)"}
                  fillOpacity={model ? 0.35 : 1}
                  stroke={stroke}
                  strokeWidth={model ? 1.4 : 1.1}
                  strokeDasharray={n.kind === "io" ? "4 3" : undefined}
                />
                {n.kind === "store" && (
                  <line
                    x1={p.x}
                    x2={p.x + W}
                    y1={p.y + 7}
                    y2={p.y + 7}
                    stroke="var(--ink)"
                    strokeWidth="1"
                  />
                )}
                <text
                  x={p.x + 10}
                  y={p.y - 7}
                  fontFamily="var(--font-mono)"
                  fontSize="8.5"
                  letterSpacing="1"
                  fill={model ? "var(--signal)" : "var(--ink-3-text)"}
                >
                  {KIND_LABEL[n.kind]}
                </text>
                <text
                  x={p.x + 10}
                  y={p.y + (n.detail ? 28 : 38)}
                  fontFamily="var(--font-display)"
                  fontSize="14"
                  fontWeight="600"
                  fill="var(--ink)"
                >
                  {n.label}
                </text>
                {n.detail && (
                  <text
                    x={p.x + 10}
                    y={p.y + 47}
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    fill="var(--ink-2)"
                  >
                    {n.detail.length > 26 ? n.detail.slice(0, 25) + "…" : n.detail}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {!compact && (
      <figcaption className="t-label mt-4 flex flex-wrap gap-x-6 gap-y-1 text-ink-3-text">
        <span>FIG. — {title} architecture</span>
        <span className="text-signal">▪ model</span>
        <span className="text-ink">▪ deterministic</span>
      </figcaption>
      )}
    </figure>
  );
}
