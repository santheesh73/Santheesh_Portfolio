import { describe, expect, it } from "vitest";
import { formatIST } from "./time";

describe("formatIST", () => {
  it("offsets UTC by +05:30", () => {
    expect(formatIST(new Date("2026-10-20T00:00:00Z"))).toBe("05:30:00");
  });
  it("wraps past midnight", () => {
    expect(formatIST(new Date("2026-10-20T20:15:42Z"))).toBe("01:45:42");
  });
});
