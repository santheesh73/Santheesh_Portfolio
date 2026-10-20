/**
 * Dot-matrix sampling of text. Renders lines of text to an offscreen canvas and
 * returns the centres of grid cells that fall inside the glyphs, in a pixel space
 * centred on (0, 0) with y up (matches an orthographic camera at zoom 1).
 */
export type Sample = { points: Float32Array; step: number; count: number };

export function fitFont(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  family: string,
  maxW: number,
  maxH: number,
): number {
  let size = 400;
  ctx.font = `700 ${size}px ${family}`;
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  size = Math.floor(size * Math.min(maxW / widest, maxH / (lines.length * 0.86 * size)));
  return Math.max(24, size);
}

export function sampleText({
  lines,
  family,
  width,
  height,
  target,
  fill = 0.9,
  heightShare = 0.56,
  offsetY = 0,
}: {
  lines: string[];
  family: string;
  width: number;
  height: number;
  /** Desired number of grid cells (roughly the particle count). */
  target: number;
  fill?: number;
  heightShare?: number;
  offsetY?: number;
}): Sample {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const size = fitFont(ctx, lines, family, width * fill, height * heightShare);
  const lineH = size * 0.86;
  ctx.font = `700 ${size}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000";
  const blockH = lineH * lines.length;
  const top = height / 2 - blockH / 2 - offsetY;
  lines.forEach((line, i) => ctx.fillText(line, width / 2, top + lineH * (i + 0.86)));

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Estimate inked area to choose a grid step that yields ~target cells.
  let inked = 0;
  for (let i = 3; i < data.length; i += 16) if (data[i]! > 128) inked++;
  inked *= 4;
  let step = Math.max(3, Math.round(Math.sqrt(inked / target)));

  // Never return more cells than the budget: a truncated list would drop whole rows.
  for (;;) {
    const out: number[] = [];
    for (let y = step / 2; y < canvas.height; y += step) {
      for (let x = step / 2; x < canvas.width; x += step) {
        const a = data[(Math.floor(y) * canvas.width + Math.floor(x)) * 4 + 3]!;
        if (a > 128) out.push(x - width / 2, height / 2 - y);
      }
    }
    if (out.length / 2 <= target || step > 64) {
      return { points: new Float32Array(out), step, count: out.length / 2 };
    }
    step += 1;
  }
}

/** The resolved CSS font-family string for the display face. */
export function displayFamily(): string {
  const probe = document.createElement("span");
  probe.style.fontFamily = "var(--font-display)";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  const fam = getComputedStyle(probe).fontFamily;
  probe.remove();
  return fam || "sans-serif";
}
