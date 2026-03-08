import { describe, it, expect } from "vitest";
import { Regime, REGIME_NAMES, REGIME_COLORS } from "../types.js";

describe("Regime", () => {
  it("has correct numeric values", () => {
    expect(Regime.VeryLow).toBe(0);
    expect(Regime.Low).toBe(1);
    expect(Regime.Normal).toBe(2);
    expect(Regime.High).toBe(3);
    expect(Regime.Extreme).toBe(4);
  });

  it("has names for all regimes", () => {
    expect(REGIME_NAMES[Regime.VeryLow]).toBe("Very Low");
    expect(REGIME_NAMES[Regime.Low]).toBe("Low");
    expect(REGIME_NAMES[Regime.Normal]).toBe("Normal");
    expect(REGIME_NAMES[Regime.High]).toBe("High");
    expect(REGIME_NAMES[Regime.Extreme]).toBe("Extreme");
  });

  it("has colors for all regimes", () => {
    for (const regime of [Regime.VeryLow, Regime.Low, Regime.Normal, Regime.High, Regime.Extreme]) {
      expect(REGIME_COLORS[regime]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("has exactly 5 regime values", () => {
    const numericValues = Object.values(Regime).filter(
      (v) => typeof v === "number"
    );
    expect(numericValues).toHaveLength(5);
  });

  it("has contiguous regime values starting at 0", () => {
    const numericValues = Object.values(Regime)
      .filter((v): v is number => typeof v === "number")
      .sort((a, b) => a - b);
    expect(numericValues).toEqual([0, 1, 2, 3, 4]);
  });

  it("REGIME_NAMES covers exactly all regime values", () => {
    const regimeValues = Object.values(Regime).filter(
      (v): v is number => typeof v === "number"
    );
    const nameKeys = Object.keys(REGIME_NAMES).map(Number);
    expect(nameKeys.sort()).toEqual(regimeValues.sort());
  });

  it("REGIME_COLORS covers exactly all regime values", () => {
    const regimeValues = Object.values(Regime).filter(
      (v): v is number => typeof v === "number"
    );
    const colorKeys = Object.keys(REGIME_COLORS).map(Number);
    expect(colorKeys.sort()).toEqual(regimeValues.sort());
  });

  it("REGIME_NAMES values are non-empty strings", () => {
    for (const name of Object.values(REGIME_NAMES)) {
      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it("REGIME_COLORS values are unique", () => {
    const colors = Object.values(REGIME_COLORS);
    const unique = new Set(colors);
    expect(unique.size).toBe(colors.length);
  });
});
