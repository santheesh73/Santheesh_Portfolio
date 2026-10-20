import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// Static woff copies of the site's display + mono faces (satori cannot read woff2).
const font = (file: string) => readFile(join(process.cwd(), "lib/og-fonts", file));

const C = { paper: "#F4F5F7", ink: "#0A0C14", ink2: "#474D60", rule: "#DCE0E8", signal: "#2B45F5" };

/** OG card in the site's type and palette: blueprint columns, mono kicker, display title. */
export async function renderOG({ kicker, title, line }: { kicker: string; title: string; line: string }) {
  const [display, mono] = await Promise.all([
    font("bricolage-grotesque-latin-600-normal.woff"),
    font("jetbrains-mono-latin-500-normal.woff"),
  ]);
  const size = title.length > 14 ? 112 : 150;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: C.paper, padding: "56px 64px", position: "relative", fontFamily: "Display" }}>
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: 64 + ((1200 - 128) / 12) * (i + 1), width: 1, background: C.rule }} />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Mono", fontSize: 20, letterSpacing: 2.4, color: C.ink2, textTransform: "uppercase" }}>
          <span>{kicker}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 10, background: C.signal }} />
            signal → structure
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: size, lineHeight: 0.9, letterSpacing: -size * 0.04, color: C.ink }}>{title}</div>
          <div style={{ fontSize: 34, lineHeight: 1.25, color: C.ink2, maxWidth: 900 }}>{line}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${C.ink}`, paddingTop: 18, fontFamily: "Mono", fontSize: 20, letterSpacing: 2.4, color: C.ink, textTransform: "uppercase" }}>
          <span>Santheesh S · AI Software Engineer</span>
          <span>Tiruppur, IN</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Display", data: display, weight: 600, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
