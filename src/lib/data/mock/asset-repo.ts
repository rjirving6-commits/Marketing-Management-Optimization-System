import type {
  Asset,
  AssetFilters,
  AssetWithMetrics,
  DerivedMetrics,
  MetricSnapshot,
  TrendDirection,
} from "../types";
import type { AssetRepository } from "../repositories";
import { store } from "./store";
import { mean, linearRegression, anomalyScore } from "@/lib/ml";

function computeDerivedMetrics(
  history: MetricSnapshot[]
): DerivedMetrics | null {
  if (history.length < 2) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const recent = sorted.slice(-7);
  const older = sorted.slice(-14, -7);

  const avgRecentCtr =
    recent.reduce((s, m) => s + m.ctr, 0) / recent.length;
  const avgOlderCtr =
    older.length > 0
      ? older.reduce((s, m) => s + m.ctr, 0) / older.length
      : avgRecentCtr;

  const velocityPct =
    avgOlderCtr > 0
      ? ((avgRecentCtr - avgOlderCtr) / avgOlderCtr) * 100
      : 0;

  let trendDirection: TrendDirection = "flat";
  if (velocityPct > 5) trendDirection = "up";
  else if (velocityPct < -5) trendDirection = "down";

  // Scroll stop rate: mean(clicks/impressions) over recent 7 days
  const scrollStopRate = mean(
    recent.map((m) => (m.impressions > 0 ? m.clicks / m.impressions : 0))
  );

  // Hook retention: mean(conversions/clicks) over recent 7 days
  const hookRetention = mean(
    recent.map((m) => (m.clicks > 0 ? m.conversions / m.clicks : 0))
  );

  // Fatigue score using exponential decay model with regression slope
  const ctrSeries = sorted.map((m) => m.ctr);
  const regression = linearRegression(ctrSeries);
  const peakCtr = Math.max(...ctrSeries);
  const daysRunning = sorted.length;
  const decayRate = Math.max(0, -regression.slope);
  const fatigueScore = Math.min(
    100,
    Math.round(
      (1 - Math.exp(-decayRate * daysRunning * 10)) * 70 +
        Math.min(daysRunning, 30) * 1.0
    )
  );

  // Half-life: days until CTR dropped to 50% of peak (null if not yet)
  let halfLife: number | null = null;
  const halfPeak = peakCtr * 0.5;
  const peakIdx = sorted.findIndex((m) => m.ctr === peakCtr);
  for (let i = peakIdx + 1; i < sorted.length; i++) {
    if (sorted[i].ctr <= halfPeak) {
      halfLife = i - peakIdx;
      break;
    }
  }

  // Predicted fatigue date: linear regression on CTR → find x where line crosses 50% of peak
  let predictedFatigueDate: string | null = null;
  if (peakCtr > 0 && regression.slope < 0) {
    const targetCtr = peakCtr * 0.5;
    const xAtTarget = (targetCtr - regression.intercept) / regression.slope;
    const daysFromNow = Math.ceil(xAtTarget - (sorted.length - 1));
    if (daysFromNow > 0 && daysFromNow < 365) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysFromNow);
      predictedFatigueDate = futureDate.toISOString().split("T")[0];
    }
  }

  // Anomaly score from CTR series
  const anomaly = anomalyScore(ctrSeries);

  return {
    fatigueScore,
    assetHalfLife: halfLife,
    performanceVelocity: Math.round(velocityPct * 100) / 100,
    scrollStopRate: Math.round(scrollStopRate * 10000) / 10000,
    hookRetention: Math.round(hookRetention * 10000) / 10000,
    trendDirection,
    predictedFatigueDate,
    anomalyScore: anomaly,
  };
}

function matchesFilters(asset: Asset, filters?: AssetFilters): boolean {
  if (!filters) return true;
  if (filters.platform && asset.platform !== filters.platform) return false;
  if (filters.funnelStage && asset.funnelStage !== filters.funnelStage)
    return false;
  if (filters.assetType && asset.type !== filters.assetType) return false;
  if (filters.status && asset.status !== filters.status) return false;
  if (filters.campaignId && asset.campaignId !== filters.campaignId)
    return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const searchable = `${asset.name} ${asset.hook} ${asset.cta} ${asset.tags.join(" ")}`.toLowerCase();
    if (!searchable.includes(q)) return false;
  }
  return true;
}

function sortAssets(
  assets: AssetWithMetrics[],
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): AssetWithMetrics[] {
  if (!sortBy) return assets;

  const order = sortOrder === "desc" ? -1 : 1;

  return [...assets].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortBy) {
      case "name":
        aVal = a.asset.name;
        bVal = b.asset.name;
        break;
      case "ctr":
        aVal = a.latestMetrics?.ctr ?? 0;
        bVal = b.latestMetrics?.ctr ?? 0;
        break;
      case "cpl":
        aVal = a.latestMetrics?.cpl ?? 0;
        bVal = b.latestMetrics?.cpl ?? 0;
        break;
      case "spend":
        aVal = a.latestMetrics?.spend ?? 0;
        bVal = b.latestMetrics?.spend ?? 0;
        break;
      case "impressions":
        aVal = a.latestMetrics?.impressions ?? 0;
        bVal = b.latestMetrics?.impressions ?? 0;
        break;
      case "fatigue":
        aVal = a.derivedMetrics?.fatigueScore ?? 0;
        bVal = b.derivedMetrics?.fatigueScore ?? 0;
        break;
      case "createdAt":
        aVal = a.asset.createdAt;
        bVal = b.asset.createdAt;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return -1 * order;
    if (aVal > bVal) return 1 * order;
    return 0;
  });
}

export class MockAssetRepository implements AssetRepository {
  async getAll(filters?: AssetFilters): Promise<Asset[]> {
    return store.assets.filter((a) => matchesFilters(a, filters));
  }

  async getById(id: string): Promise<Asset | null> {
    return store.assets.find((a) => a.id === id) ?? null;
  }

  async getWithMetrics(filters?: AssetFilters): Promise<AssetWithMetrics[]> {
    const filtered = store.assets.filter((a) => matchesFilters(a, filters));

    const result = filtered.map((asset) => {
      const history = store.metrics
        .filter((m) => m.assetId === asset.id)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      const latestMetrics = history.length > 0 ? history[history.length - 1] : null;
      const campaign = store.campaigns.find((c) => c.id === asset.campaignId);

      return {
        asset,
        latestMetrics,
        derivedMetrics: computeDerivedMetrics(history),
        campaignName: campaign?.name ?? "Unknown",
        metricsHistory: history,
      };
    });

    return sortAssets(result, filters?.sortBy, filters?.sortOrder);
  }

  async getWithMetricsById(id: string): Promise<AssetWithMetrics | null> {
    const asset = store.assets.find((a) => a.id === id);
    if (!asset) return null;

    const history = store.metrics
      .filter((m) => m.assetId === id)
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    const latestMetrics = history.length > 0 ? history[history.length - 1] : null;
    const campaign = store.campaigns.find((c) => c.id === asset.campaignId);

    return {
      asset,
      latestMetrics,
      derivedMetrics: computeDerivedMetrics(history),
      campaignName: campaign?.name ?? "Unknown",
      metricsHistory: history,
    };
  }

  async create(
    data: Omit<Asset, "id" | "createdAt" | "updatedAt">
  ): Promise<Asset> {
    const now = new Date().toISOString();
    const asset: Asset = {
      ...data,
      id: `asset-${String(store.assets.length + 1).padStart(3, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    store.assets.push(asset);
    return asset;
  }

  async update(id: string, data: Partial<Asset>): Promise<Asset | null> {
    const idx = store.assets.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    store.assets[idx] = {
      ...store.assets[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return store.assets[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = store.assets.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    store.assets.splice(idx, 1);
    return true;
  }
}
