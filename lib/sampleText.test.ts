import { describe, expect, it } from "vitest";
import { fitFont } from "./sampleText";

// Canvas-free check of the font fitting maths with a fake 2D context.
const fakeCtx = (charW: number) =>
  ({
    font: "",
    measureText(t: string) {
      const size = Number(/(\d+)px/.exec(this.font)?.[1] ?? 0);
      return { width: t.length * charW * (size / 100) };
    },
  }) as unknown as CanvasRenderingContext2D;

describe("fitFont", () => {
  it("fits the widest line to the max width", () => {
    const size = fitFont(fakeCtx(60), ["SANTHEESH S"], "x", 1200, 1000);
    // 11 chars × 0.6em ≤ 1200px → size ≤ 181
    expect(size).toBeLessThanOrEqual(182);
    expect(size).toBeGreaterThan(170);
  });
  it("is limited by height for many lines", () => {
    const size = fitFont(fakeCtx(60), ["A", "B", "C"], "x", 5000, 300);
    expect(size).toBeLessThanOrEqual(Math.ceil(300 / (3 * 0.86)));
  });
});
