/**
 * Anomaly detection using z-score thresholds.
 */

import { mean, stddev, zScores } from "./statistics";

export interface AnomalyResult {
  index: number;
  value: number;
  zScore: number;
}

export function detectAnomalies(
  values: number[],
  threshold: number = 2.0
): AnomalyResult[] {
  if (values.length < 3) return [];

  const scores = zScores(values);
  const anomalies: AnomalyResult[] = [];

  for (let i = 0; i < values.length; i++) {
    if (Math.abs(scores[i]) >= threshold) {
      anomalies.push({
        index: i,
        value: values[i],
        zScore: scores[i],
      });
    }
  }

  return anomalies;
}

/**
 * Compute an anomaly score (0-100) for a time series.
 * Higher score = more anomalous recent behavior.
 */
export function anomalyScore(values: number[]): number {
  if (values.length < 5) return 0;

  const avg = mean(values);
  const sd = stddev(values);
  if (sd === 0) return 0;

  // Focus on the last 3 data points
  const recentValues = values.slice(-3);
  const recentZScores = recentValues.map((v) => Math.abs((v - avg) / sd));
  const maxRecentZ = Math.max(...recentZScores);

  // Map z-score to 0-100 scale: z=0 -> 0, z=2 -> 50, z=4+ -> 100
  return Math.min(100, Math.round(maxRecentZ * 25));
}
