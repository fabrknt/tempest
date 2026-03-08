import { describe, it, expect } from "vitest";
import {
  classifyRegime,
  interpolateFee,
  DEFAULT_FEE_CONFIG,
} from "../fees.js";
import { Regime, type FeeConfig } from "../types.js";

// ---------------------------------------------------------------------------
// classifyRegime
// ---------------------------------------------------------------------------
describe("classifyRegime", () => {
  it("returns VeryLow for volBps = 0", () => {
    expect(classifyRegime(0)).toBe(Regime.VeryLow);
  });

  it("returns VeryLow for volBps just below 200", () => {
    expect(classifyRegime(199)).toBe(Regime.VeryLow);
    expect(classifyRegime(199.9)).toBe(Regime.VeryLow);
  });

  it("returns Low at the 200 boundary", () => {
    expect(classifyRegime(200)).toBe(Regime.Low);
  });

  it("returns Low for volBps just below 500", () => {
    expect(classifyRegime(499)).toBe(Regime.Low);
  });

  it("returns Normal at the 500 boundary", () => {
    expect(classifyRegime(500)).toBe(Regime.Normal);
  });

  it("returns Normal for volBps just below 1500", () => {
    expect(classifyRegime(1499)).toBe(Regime.Normal);
  });

  it("returns High at the 1500 boundary", () => {
    expect(classifyRegime(1500)).toBe(Regime.High);
  });

  it("returns High for volBps just below 3000", () => {
    expect(classifyRegime(2999)).toBe(Regime.High);
  });

  it("returns Extreme at the 3000 boundary", () => {
    expect(classifyRegime(3000)).toBe(Regime.Extreme);
  });

  it("returns Extreme for very high volBps", () => {
    expect(classifyRegime(10000)).toBe(Regime.Extreme);
    expect(classifyRegime(50000)).toBe(Regime.Extreme);
  });

  it("handles negative volBps (edge case)", () => {
    expect(classifyRegime(-1)).toBe(Regime.VeryLow);
  });
});

// ---------------------------------------------------------------------------
// interpolateFee
// ---------------------------------------------------------------------------
describe("interpolateFee", () => {
  it("returns fee0 at volBps = 0", () => {
    expect(interpolateFee(0)).toBe(DEFAULT_FEE_CONFIG.fee0);
  });

  it("returns fee0 for negative volBps", () => {
    expect(interpolateFee(-100)).toBe(DEFAULT_FEE_CONFIG.fee0);
  });

  it("returns fee5 at volBps = 10000 (cap)", () => {
    expect(interpolateFee(10000)).toBe(DEFAULT_FEE_CONFIG.fee5);
  });

  it("returns fee5 above 10000 (cap)", () => {
    expect(interpolateFee(50000)).toBe(DEFAULT_FEE_CONFIG.fee5);
  });

  it("returns exact fee at breakpoint vol1 = 200", () => {
    expect(interpolateFee(200)).toBe(DEFAULT_FEE_CONFIG.fee1);
  });

  it("returns exact fee at breakpoint vol2 = 500", () => {
    expect(interpolateFee(500)).toBe(DEFAULT_FEE_CONFIG.fee2);
  });

  it("returns exact fee at breakpoint vol3 = 1500", () => {
    expect(interpolateFee(1500)).toBe(DEFAULT_FEE_CONFIG.fee3);
  });

  it("returns exact fee at breakpoint vol4 = 3000", () => {
    expect(interpolateFee(3000)).toBe(DEFAULT_FEE_CONFIG.fee4);
  });

  it("interpolates midpoint between vol0(0) and vol1(200)", () => {
    // Midpoint vol=100 => fee = 1 + 0.5*(5-1) = 3
    expect(interpolateFee(100)).toBeCloseTo(3, 5);
  });

  it("interpolates midpoint between vol1(200) and vol2(500)", () => {
    // Midpoint vol=350 => fee = 5 + 0.5*(30-5) = 17.5
    expect(interpolateFee(350)).toBeCloseTo(17.5, 5);
  });

  it("interpolates midpoint between vol2(500) and vol3(1500)", () => {
    // Midpoint vol=1000 => fee = 30 + 0.5*(60-30) = 45
    expect(interpolateFee(1000)).toBeCloseTo(45, 5);
  });

  it("interpolates midpoint between vol3(1500) and vol4(3000)", () => {
    // Midpoint vol=2250 => fee = 60 + 0.5*(100-60) = 80
    expect(interpolateFee(2250)).toBeCloseTo(80, 5);
  });

  it("interpolates between vol4(3000) and vol5(10000)", () => {
    // fee4=100, fee5=100, so any point between should be 100
    expect(interpolateFee(5000)).toBeCloseTo(100, 5);
  });

  it("interpolation is monotonically non-decreasing with default config", () => {
    let prevFee = interpolateFee(0);
    for (let v = 50; v <= 10000; v += 50) {
      const fee = interpolateFee(v);
      expect(fee).toBeGreaterThanOrEqual(prevFee);
      prevFee = fee;
    }
  });

  it("accepts a custom FeeConfig", () => {
    const custom: FeeConfig = {
      vol0: 0n,
      fee0: 10,
      vol1: 100n,
      fee1: 20,
      vol2: 200n,
      fee2: 30,
      vol3: 300n,
      fee3: 40,
      vol4: 400n,
      fee4: 50,
      vol5: 500n,
      fee5: 60,
    };
    expect(interpolateFee(0, custom)).toBe(10);
    expect(interpolateFee(50, custom)).toBeCloseTo(15, 5);
    expect(interpolateFee(500, custom)).toBe(60);
    expect(interpolateFee(1000, custom)).toBe(60); // capped
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_FEE_CONFIG shape
// ---------------------------------------------------------------------------
describe("DEFAULT_FEE_CONFIG", () => {
  it("has 6 vol breakpoints as bigints", () => {
    expect(typeof DEFAULT_FEE_CONFIG.vol0).toBe("bigint");
    expect(typeof DEFAULT_FEE_CONFIG.vol1).toBe("bigint");
    expect(typeof DEFAULT_FEE_CONFIG.vol2).toBe("bigint");
    expect(typeof DEFAULT_FEE_CONFIG.vol3).toBe("bigint");
    expect(typeof DEFAULT_FEE_CONFIG.vol4).toBe("bigint");
    expect(typeof DEFAULT_FEE_CONFIG.vol5).toBe("bigint");
  });

  it("has 6 fee values as numbers", () => {
    expect(typeof DEFAULT_FEE_CONFIG.fee0).toBe("number");
    expect(typeof DEFAULT_FEE_CONFIG.fee1).toBe("number");
    expect(typeof DEFAULT_FEE_CONFIG.fee2).toBe("number");
    expect(typeof DEFAULT_FEE_CONFIG.fee3).toBe("number");
    expect(typeof DEFAULT_FEE_CONFIG.fee4).toBe("number");
    expect(typeof DEFAULT_FEE_CONFIG.fee5).toBe("number");
  });

  it("has vol breakpoints in strictly ascending order", () => {
    const vols = [
      DEFAULT_FEE_CONFIG.vol0,
      DEFAULT_FEE_CONFIG.vol1,
      DEFAULT_FEE_CONFIG.vol2,
      DEFAULT_FEE_CONFIG.vol3,
      DEFAULT_FEE_CONFIG.vol4,
      DEFAULT_FEE_CONFIG.vol5,
    ];
    for (let i = 1; i < vols.length; i++) {
      expect(vols[i]).toBeGreaterThan(vols[i - 1]);
    }
  });

  it("has non-negative fee values", () => {
    const fees = [
      DEFAULT_FEE_CONFIG.fee0,
      DEFAULT_FEE_CONFIG.fee1,
      DEFAULT_FEE_CONFIG.fee2,
      DEFAULT_FEE_CONFIG.fee3,
      DEFAULT_FEE_CONFIG.fee4,
      DEFAULT_FEE_CONFIG.fee5,
    ];
    for (const fee of fees) {
      expect(fee).toBeGreaterThanOrEqual(0);
    }
  });

  it("has fees in non-decreasing order", () => {
    const fees = [
      DEFAULT_FEE_CONFIG.fee0,
      DEFAULT_FEE_CONFIG.fee1,
      DEFAULT_FEE_CONFIG.fee2,
      DEFAULT_FEE_CONFIG.fee3,
      DEFAULT_FEE_CONFIG.fee4,
      DEFAULT_FEE_CONFIG.fee5,
    ];
    for (let i = 1; i < fees.length; i++) {
      expect(fees[i]).toBeGreaterThanOrEqual(fees[i - 1]);
    }
  });
});
