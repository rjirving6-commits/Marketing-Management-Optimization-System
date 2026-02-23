/**
 * Simple Exponential Smoothing (SES) with configurable alpha.
 */

export function exponentialSmoothing(values: number[], alpha: number = 0.3): number[] {
  if (values.length === 0) return [];

  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

export function forecast(values: number[], steps: number = 7, alpha: number = 0.3): number[] {
  if (values.length === 0) return Array(steps).fill(0) as number[];

  // Double exponential smoothing (Holt's method) for trend-adjusted forecasts
  const beta = 0.1;
  let level = values[0];
  let trend = values.length > 1 ? values[1] - values[0] : 0;

  for (let i = 1; i < values.length; i++) {
    const prevLevel = level;
    level = alpha * values[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  const forecasts: number[] = [];
  for (let h = 1; h <= steps; h++) {
    forecasts.push(level + h * trend);
  }

  // Ensure non-negative for metrics that can't be negative
  return forecasts.map((v) => Math.max(0, v));
}
