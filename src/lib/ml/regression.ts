/**
 * Simple linear regression on number arrays.
 */

import { mean } from "./statistics";

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  predict: (x: number) => number;
}

export function linearRegression(ys: number[], xs?: number[]): RegressionResult {
  const n = ys.length;
  if (n < 2) {
    return { slope: 0, intercept: ys[0] ?? 0, r2: 0, predict: () => ys[0] ?? 0 };
  }

  const xVals = xs ?? ys.map((_, i) => i);
  const xMean = mean(xVals);
  const yMean = mean(ys);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = xVals[i] - xMean;
    numerator += xDiff * (ys[i] - yMean);
    denominator += xDiff * xDiff;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // R-squared
  const ssRes = ys.reduce((sum, y, i) => {
    const predicted = slope * xVals[i] + intercept;
    return sum + (y - predicted) ** 2;
  }, 0);
  const ssTot = ys.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return {
    slope,
    intercept,
    r2,
    predict: (x: number) => slope * x + intercept,
  };
}
