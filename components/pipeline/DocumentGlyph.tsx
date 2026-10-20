/**
 * The travelling "document" of the Pipeline scene, drawn as line art.
 * bill → invoice (fields extracted) → invoice (rules checked) → repo tree (explained).
 * Model marks are cobalt; deterministic marks are ink.
 */
export type DocVariant = "bill" | "fields" | "rules" | "tree";

const INK = "var(--ink)";
const SIG = "var(--signal)";
const RULE = "var(--rule)";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 220 280" className="h-full w-full" role="img" aria-label={label}>
      <rect x="0.5" y="0.5" width="219" height="279" fill="var(--sheet)" stroke={INK} />
      <path d="M190 0.5 V30 H219.5" fill="none" stroke={INK} />
      {children}
    </svg>
  );
}

const lines = (y0: number, n: number, w: number[], color = RULE) =>
  Array.from({ length: n }, (_, i) => (
    <line key={i} x1="20" x2={20 + (w[i % w.length] ?? 120)} y1={y0 + i * 14} y2={y0 + i * 14} stroke={color} strokeWidth="5" />
  ));

export function DocumentGlyph({ variant }: { variant: DocVariant }) {
  switch (variant) {
    case "bill":
      return (
        <Frame label="An electricity bill photo">
          <text x="20" y="34" fontFamily="var(--font-mono)" fontSize="11" fill={INK}>ELECTRICITY BILL</text>
          {lines(56, 3, [140, 100, 120])}
          <rect x="20" y="104" width="180" height="62" fill="none" stroke={RULE} />
          <text x="30" y="126" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-2)">UNITS</text>
          <text x="30" y="152" fontFamily="var(--font-display)" fontSize="22" fontWeight="600" fill={INK}>░░░ kWh</text>
          {lines(186, 5, [170, 130, 150, 90, 160])}
          {/* model's reading frame */}
          <rect x="14" y="98" width="192" height="74" fill="none" stroke={SIG} strokeDasharray="4 3" strokeWidth="1.5" />
          <text x="150" y="94" fontFamily="var(--font-mono)" fontSize="8" fill={SIG}>READ</text>
        </Frame>
      );
    case "fields":
      return (
        <Frame label="An invoice with extracted fields">
          <text x="20" y="34" fontFamily="var(--font-mono)" fontSize="11" fill={INK}>TAX INVOICE</text>
          {[
            ["GSTIN", 60],
            ["INVOICE NO", 96],
            ["HSN", 132],
            ["AMOUNT", 168],
          ].map(([k, y]) => (
            <g key={k as string}>
              <text x="20" y={y as number} fontFamily="var(--font-mono)" fontSize="8" fill="var(--ink-2)">{k}</text>
              <rect x="20" y={(y as number) + 6} width="180" height="18" fill="var(--signal-2)" fillOpacity="0.45" stroke={SIG} />
              <line x1="28" x2={90 + ((y as number) % 70)} y1={(y as number) + 15} y2={(y as number) + 15} stroke={SIG} strokeWidth="4" />
            </g>
          ))}
          {lines(214, 4, [150, 110, 160, 80])}
        </Frame>
      );
    case "rules":
      return (
        <Frame label="Extracted fields checked by deterministic rules">
          <text x="20" y="34" fontFamily="var(--font-mono)" fontSize="11" fill={INK}>RULES 01–18</text>
          {Array.from({ length: 9 }, (_, i) => {
            const y = 56 + i * 22;
            const flagged = i === 3 || i === 7;
            return (
              <g key={i}>
                <rect x="20" y={y} width="14" height="14" fill="none" stroke={INK} />
                {flagged ? (
                  <path d={`M23 ${y + 3} L31 ${y + 11} M31 ${y + 3} L23 ${y + 11}`} stroke={INK} strokeWidth="1.6" />
                ) : (
                  <path d={`M23 ${y + 7} L26 ${y + 11} L32 ${y + 3}`} fill="none" stroke={INK} strokeWidth="1.6" />
                )}
                <line x1="44" x2={110 + ((i * 37) % 80)} y1={y + 7} y2={y + 7} stroke={flagged ? INK : RULE} strokeWidth="5" />
              </g>
            );
          })}
        </Frame>
      );
    case "tree":
      return (
        <Frame label="A repository tree with an explanation">
          <text x="20" y="34" fontFamily="var(--font-mono)" fontSize="11" fill={INK}>repo/</text>
          {[
            [0, "app/"],
            [1, "engine/"],
            [2, "rules.py"],
            [1, "gemini/"],
            [0, "tests/"],
            [0, "README.md"],
          ].map(([d, name], i) => (
            <text key={i} x={28 + (d as number) * 14} y={56 + i * 16} fontFamily="var(--font-mono)" fontSize="10" fill={INK}>
              {(d as number) > 0 ? "└ " : "├ "}
              {name}
            </text>
          ))}
          <rect x="20" y="158" width="180" height="100" fill="var(--signal-2)" fillOpacity="0.35" stroke={SIG} />
          <text x="30" y="176" fontFamily="var(--font-mono)" fontSize="8" fill={SIG}>EXPLAIN</text>
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1="30" x2={30 + [150, 130, 156, 90][i]!} y1={192 + i * 16} y2={192 + i * 16} stroke={SIG} strokeWidth="4" />
          ))}
        </Frame>
      );
  }
}
