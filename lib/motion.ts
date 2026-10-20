/**
 * Motion language. Every timing and ease in the site comes from here.
 *
 *   signal    = loose, probabilistic, organic   (the model)
 *   structure = exact, snapping, deterministic  (the engine)
 *
 * Rule: things arrive as signal and settle as structure.
 */
import { gsap } from "gsap";

export const EASE = {
  signal: "signal", // 0.65,0,0.35,1 — in/out drift
  structure: "expo.out", // snap into place
  out: "power3.out",
  linear: "none",
} as const;

export const DUR = {
  micro: 0.3,
  microFast: 0.25,
  microSlow: 0.4,
  reveal: 0.9,
  revealFast: 0.6,
  revealSlow: 1.2,
} as const;

export const STAGGER = {
  lines: 0.06,
  words: 0.03,
  chars: 0.015,
} as const;

/** How "noisy" a signal-state element is before it snaps to structure. */
export const SIGNAL_OFFSET = {
  y: 28,
  x: 10,
  rotate: 2.5,
  blur: 6,
} as const;

/** Glyph pool for scramble-then-resolve on mono labels. */
export const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\|_-";

/**
 * cubic-bezier(x1, y1, x2, y2) as an ease function: the same curve
 * `CustomEase.create("signal", "0.65,0,0.35,1")` produces, solved directly
 * (Newton steps on x, bisection fallback). Done by hand to keep CustomEase's
 * ~3 KB gzip out of every route's initial bundle.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
  const x = (t: number) => ((ax * t + bx) * t + cx) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const y = (t: number) => ((ay * t + by) * t + cy) * t;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let t = p;
    for (let i = 0; i < 6; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      const next = t - (x(t) - p) / d;
      if (next < 0 || next > 1) break;
      t = next;
    }
    if (Math.abs(x(t) - p) > 1e-5) {
      let lo = 0, hi = 1;
      for (let i = 0; i < 30; i++) {
        t = (lo + hi) / 2;
        if (x(t) < p) lo = t;
        else hi = t;
      }
    }
    return y(t);
  };
}

let easesRegistered = false;
export function registerEases() {
  if (easesRegistered) return;
  gsap.registerEase("signal", cubicBezier(0.65, 0, 0.35, 1));
  easesRegistered = true;
}
