import { describe, it, expect } from "vitest";
import { estimateIL } from "../lp.js";

describe("estimateIL", () => {
  it("returns 0 for zero or negative range width", () => {
    expect(estimateIL(5000, 100, 100)).toBe(0);
    expect(estimateIL(5000, 200, 100)).toBe(0);
  });

  it("returns higher IL for higher volatility", () => {
    const lowVol = estimateIL(2000, -1000, 1000, 30);
    const highVol = estimateIL(8000, -1000, 1000, 30);
    expect(highVol).toBeGreaterThan(lowVol);
  });

  it("returns lower IL for wider ranges", () => {
    const narrow = estimateIL(5000, -500, 500, 30);
    const wide = estimateIL(5000, -2000, 2000, 30);
    expect(narrow).toBeGreaterThan(wide);
  });

  it("returns higher IL for longer holding periods", () => {
    const short = estimateIL(5000, -1000, 1000, 7);
    const long = estimateIL(5000, -1000, 1000, 90);
    expect(long).toBeGreaterThan(short);
  });

  it("caps at 100%", () => {
    const il = estimateIL(50000, -1, 1, 365);
    expect(il).toBe(100);
  });

  it("defaults to 30-day holding period", () => {
    const explicit = estimateIL(5000, -1000, 1000, 30);
    const defaulted = estimateIL(5000, -1000, 1000);
    expect(explicit).toBe(defaulted);
  });

  it("returns 0 for zero volatility", () => {
    expect(estimateIL(0, -1000, 1000, 30)).toBe(0);
  });

  it("returns 0 for negative range (lower > upper)", () => {
    expect(estimateIL(5000, 1000, -1000)).toBe(0);
  });

  it("returns 0 for equal lower and upper ticks", () => {
    expect(estimateIL(5000, 500, 500)).toBe(0);
  });

  it("produces a finite positive number for typical inputs", () => {
    const il = estimateIL(3000, -500, 500, 14);
    expect(il).toBeGreaterThan(0);
    expect(il).toBeLessThanOrEqual(100);
    expect(Number.isFinite(il)).toBe(true);
  });

  it("returns result proportional to volBps squared", () => {
    const il1 = estimateIL(1000, -1000, 1000, 30);
    const il2 = estimateIL(2000, -1000, 1000, 30);
    // Doubling vol should quadruple IL (vol^2 relationship)
    expect(il2 / il1).toBeCloseTo(4, 1);
  });

  it("returns result proportional to holding period", () => {
    const il1 = estimateIL(3000, -1000, 1000, 30);
    const il2 = estimateIL(3000, -1000, 1000, 60);
    // Doubling time should double IL (linear in time)
    expect(il2 / il1).toBeCloseTo(2, 1);
  });

  it("handles very small range width (1 tick)", () => {
    const il = estimateIL(5000, 0, 1, 30);
    // Very narrow range => very high IL, capped at 100
    expect(il).toBe(100);
  });

  it("handles very large range width", () => {
    const il = estimateIL(1000, -50000, 50000, 30);
    // Very wide range => very low IL
    expect(il).toBeGreaterThanOrEqual(0);
    expect(il).toBeLessThan(1);
  });

  it("handles 1-day holding period", () => {
    const il = estimateIL(5000, -1000, 1000, 1);
    expect(il).toBeGreaterThan(0);
    expect(il).toBeLessThan(estimateIL(5000, -1000, 1000, 30));
  });

  it("handles 365-day holding period", () => {
    const il = estimateIL(5000, -1000, 1000, 365);
    expect(il).toBeGreaterThan(0);
    expect(il).toBeLessThanOrEqual(100);
  });
});
