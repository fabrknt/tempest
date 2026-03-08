import { Regime, type FeeConfig } from "./types.js";

/**
 * Default fee configuration — piecewise-linear vol→fee mapping.
 *
 * Breakpoints (vol in bps, fee in bps):
 *   0 →  1 bps fee   (very-low vol)
 * 200 →  5 bps fee   (low vol)
 * 500 → 30 bps fee   (normal vol)
 * 1500 → 60 bps fee  (high vol)
 * 3000 → 100 bps fee (extreme vol)
 * 10000 → 100 bps fee (cap)
 */
export const DEFAULT_FEE_CONFIG: FeeConfig = {
  vol0: 0n,
  fee0: 1,
  vol1: 200n,
  fee1: 5,
  vol2: 500n,
  fee2: 30,
  vol3: 1500n,
  fee3: 60,
  vol4: 3000n,
  fee4: 100,
  vol5: 10000n,
  fee5: 100,
};

/**
 * Classify a volatility reading (in bps) into a {@link Regime}.
 */
export function classifyRegime(volBps: number): Regime {
  if (volBps < 200) return Regime.VeryLow;
  if (volBps < 500) return Regime.Low;
  if (volBps < 1500) return Regime.Normal;
  if (volBps < 3000) return Regime.High;
  return Regime.Extreme;
}

/**
 * Piecewise-linear interpolation of vol (in bps) to a fee (in bps).
 *
 * Between each pair of breakpoints the fee is linearly interpolated.
 * Below vol0 the fee is fee0; above vol5 the fee is fee5.
 */
export function interpolateFee(
  volBps: number,
  config: FeeConfig = DEFAULT_FEE_CONFIG,
): number {
  // Build ordered breakpoint pairs from config
  const breakpoints: Array<{ vol: number; fee: number }> = [
    { vol: Number(config.vol0), fee: config.fee0 },
    { vol: Number(config.vol1), fee: config.fee1 },
    { vol: Number(config.vol2), fee: config.fee2 },
    { vol: Number(config.vol3), fee: config.fee3 },
    { vol: Number(config.vol4), fee: config.fee4 },
    { vol: Number(config.vol5), fee: config.fee5 },
  ];

  // Below first breakpoint
  if (volBps <= breakpoints[0].vol) {
    return breakpoints[0].fee;
  }

  // Above last breakpoint
  if (volBps >= breakpoints[breakpoints.length - 1].vol) {
    return breakpoints[breakpoints.length - 1].fee;
  }

  // Find the segment and interpolate
  for (let i = 1; i < breakpoints.length; i++) {
    const lo = breakpoints[i - 1];
    const hi = breakpoints[i];
    if (volBps >= lo.vol && volBps < hi.vol) {
      const t = (volBps - lo.vol) / (hi.vol - lo.vol);
      return lo.fee + t * (hi.fee - lo.fee);
    }
  }

  // Fallback (should not reach here)
  return breakpoints[breakpoints.length - 1].fee;
}
