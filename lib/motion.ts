/**
 * Motion language. Every timing and ease in the site comes from here.
 *
 *   signal    = loose, probabilistic, organic   (the model)
 *   structure = exact, snapping, deterministic  (the engine)
 *
 * Rule: things arrive as signal and settle as structure.
 */
import { CustomEase } from "gsap/CustomEase";

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

let easesRegistered = false;
export function registerEases() {
  if (easesRegistered) return;
  CustomEase.create("signal", "0.65,0,0.35,1");
  easesRegistered = true;
}
