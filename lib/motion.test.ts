import { describe, expect, it } from "vitest";
import { cubicBezier } from "./motion";

describe("cubicBezier (the 'signal' ease)", () => {
  const signal = cubicBezier(0.65, 0, 0.35, 1);
  it("pins the ends and is symmetric about the midpoint", () => {
    expect(signal(0)).toBe(0);
    expect(signal(1)).toBe(1);
    expect(signal(0.5)).toBeCloseTo(0.5, 5);
    for (const p of [0.1, 0.25, 0.4]) expect(signal(p) + signal(1 - p)).toBeCloseTo(1, 5);
  });
  it("is slow at the start (ease in) and monotonic", () => {
    expect(signal(0.2)).toBeLessThan(0.1);
    let prev = 0;
    for (let p = 0.01; p <= 1; p += 0.01) {
      const v = signal(p);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = v;
    }
  });
  it("matches a linear bezier exactly", () => {
    const lin = cubicBezier(1 / 3, 1 / 3, 2 / 3, 2 / 3);
    for (const p of [0.13, 0.5, 0.77]) expect(lin(p)).toBeCloseTo(p, 5);
  });
});
