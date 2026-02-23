/**
 * Basic statistical functions operating on number arrays.
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

export function zScore(value: number, values: number[]): number {
  const avg = mean(values);
  const sd = stddev(values);
  if (sd === 0) return 0;
  return (value - avg) / sd;
}

export function zScores(values: number[]): number[] {
  const avg = mean(values);
  const sd = stddev(values);
  if (sd === 0) return values.map(() => 0);
  return values.map((v) => (v - avg) / sd);
}
