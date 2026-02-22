import { eq, and, ilike, or, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets, campaigns, metricSnapshots } from "@/lib/schema";
import type {
  Asset,
  AssetFilters,
  AssetWithMetrics,
  DerivedMetrics,
  MetricSnapshot,
  TrendDirection,
} from "../types";
import type { AssetRepository } from "../repositories";

function rowToAsset(row: typeof assets.$inferSelect): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Asset["type"],
    status: row.status as Asset["status"],
    platform: row.platform as Asset["platform"],
    campaignId: row.campaignId,
    audienceSegment: row.audienceSegment,
    icpPersona: row.icpPersona,
    funnelStage: row.funnelStage as Asset["funnelStage"],
    offerType: row.offerType as Asset["offerType"],
    creativeTheme: row.creativeTheme,
    hook: row.hook,
    cta: row.cta,
    bodyContent: row.bodyContent,
    version: row.version,
    parentAssetId: row.parentAssetId,
    fileUrl: row.fileUrl,
    thumbnailUrl: row.thumbnailUrl,
    landingPageUrl: row.landingPageUrl,
    tags: row.tags,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function rowToMetric(row: typeof metricSnapshots.$inferSelect): MetricSnapshot {
  return {
    id: row.id,
    assetId: row.assetId,
    date: row.date,
    impressions: row.impressions,
    reach: row.reach,
    clicks: row.clicks,
    landingPageClicks: row.landingPageClicks,
    conversions: row.conversions,
    leads: row.leads,
    demos: row.demos,
    spend: row.spend,
    cpm: row.cpm,
    ctr: row.ctr,
    cpc: row.cpc,
    conversionRate: row.conversionRate,
    cpl: row.cpl,
    costPerDemo: row.costPerDemo,
    roas: row.roas,
  };
}

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

  const peakCtr = Math.max(...sorted.map((m) => m.ctr));
  const latestCtr = sorted[sorted.length - 1].ctr;
  const declineRatio = peakCtr > 0 ? 1 - latestCtr / peakCtr : 0;
  const daysRunning = sorted.length;
  const fatigueScore = Math.min(
    100,
    Math.round(declineRatio * 60 + Math.min(daysRunning, 30) * 1.3)
  );

  let halfLife: number | null = null;
  const halfPeak = peakCtr * 0.5;
  const peakIdx = sorted.findIndex((m) => m.ctr === peakCtr);
  for (let i = peakIdx + 1; i < sorted.length; i++) {
    if (sorted[i].ctr <= halfPeak) {
      halfLife = i - peakIdx;
      break;
    }
  }

  return {
    fatigueScore,
    assetHalfLife: halfLife,
    performanceVelocity: Math.round(velocityPct * 100) / 100,
    scrollStopRate: 0.3 + Math.random() * 0.4,
    hookRetention: 0.4 + Math.random() * 0.35,
    trendDirection,
  };
}

function buildWhereConditions(filters?: AssetFilters) {
  const conditions = [];
  if (filters?.platform) conditions.push(eq(assets.platform, filters.platform));
  if (filters?.funnelStage)
    conditions.push(eq(assets.funnelStage, filters.funnelStage));
  if (filters?.assetType) conditions.push(eq(assets.type, filters.assetType));
  if (filters?.status) conditions.push(eq(assets.status, filters.status));
  if (filters?.campaignId)
    conditions.push(eq(assets.campaignId, filters.campaignId));
  if (filters?.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(assets.name, q),
        ilike(assets.hook, q),
        ilike(assets.cta, q)
      )
    );
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function sortAssetsWithMetrics(
  items: AssetWithMetrics[],
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): AssetWithMetrics[] {
  if (!sortBy) return items;
  const order = sortOrder === "desc" ? -1 : 1;

  return [...items].sort((a, b) => {
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

export class DrizzleAssetRepository implements AssetRepository {
  async getAll(filters?: AssetFilters): Promise<Asset[]> {
    const where = buildWhereConditions(filters);
    const rows = await db.select().from(assets).where(where);
    return rows.map(rowToAsset);
  }

  async getById(id: string): Promise<Asset | null> {
    const rows = await db.select().from(assets).where(eq(assets.id, id));
    return rows[0] ? rowToAsset(rows[0]) : null;
  }

  async getWithMetrics(filters?: AssetFilters): Promise<AssetWithMetrics[]> {
    const where = buildWhereConditions(filters);
    const assetRows = await db.select().from(assets).where(where);

    const result: AssetWithMetrics[] = [];

    for (const row of assetRows) {
      const history = await db
        .select()
        .from(metricSnapshots)
        .where(eq(metricSnapshots.assetId, row.id))
        .orderBy(asc(metricSnapshots.date));

      const metrics = history.map(rowToMetric);
      const latestMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;

      const campaignRows = await db
        .select({ name: campaigns.name })
        .from(campaigns)
        .where(eq(campaigns.id, row.campaignId));

      result.push({
        asset: rowToAsset(row),
        latestMetrics,
        derivedMetrics: computeDerivedMetrics(metrics),
        campaignName: campaignRows[0]?.name ?? "Unknown",
        metricsHistory: metrics,
      });
    }

    return sortAssetsWithMetrics(result, filters?.sortBy, filters?.sortOrder);
  }

  async getWithMetricsById(id: string): Promise<AssetWithMetrics | null> {
    const rows = await db.select().from(assets).where(eq(assets.id, id));
    if (!rows[0]) return null;

    const row = rows[0];
    const history = await db
      .select()
      .from(metricSnapshots)
      .where(eq(metricSnapshots.assetId, id))
      .orderBy(asc(metricSnapshots.date));

    const metrics = history.map(rowToMetric);
    const latestMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;

    const campaignRows = await db
      .select({ name: campaigns.name })
      .from(campaigns)
      .where(eq(campaigns.id, row.campaignId));

    return {
      asset: rowToAsset(row),
      latestMetrics,
      derivedMetrics: computeDerivedMetrics(metrics),
      campaignName: campaignRows[0]?.name ?? "Unknown",
      metricsHistory: metrics,
    };
  }

  async create(
    data: Omit<Asset, "id" | "createdAt" | "updatedAt">
  ): Promise<Asset> {
    const id = `asset-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const rows = await db
      .insert(assets)
      .values({
        id,
        name: data.name,
        type: data.type,
        status: data.status,
        platform: data.platform,
        campaignId: data.campaignId,
        audienceSegment: data.audienceSegment,
        icpPersona: data.icpPersona,
        funnelStage: data.funnelStage,
        offerType: data.offerType,
        creativeTheme: data.creativeTheme,
        hook: data.hook,
        cta: data.cta,
        bodyContent: data.bodyContent,
        version: data.version,
        parentAssetId: data.parentAssetId,
        fileUrl: data.fileUrl,
        thumbnailUrl: data.thumbnailUrl,
        landingPageUrl: data.landingPageUrl,
        tags: data.tags,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return rowToAsset(rows[0]);
  }

  async update(id: string, data: Partial<Asset>): Promise<Asset | null> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...updateData } = data;
    const values: Record<string, unknown> = {};

    if (updateData.name !== undefined) values.name = updateData.name;
    if (updateData.type !== undefined) values.type = updateData.type;
    if (updateData.status !== undefined) values.status = updateData.status;
    if (updateData.platform !== undefined) values.platform = updateData.platform;
    if (updateData.campaignId !== undefined) values.campaignId = updateData.campaignId;
    if (updateData.audienceSegment !== undefined) values.audienceSegment = updateData.audienceSegment;
    if (updateData.icpPersona !== undefined) values.icpPersona = updateData.icpPersona;
    if (updateData.funnelStage !== undefined) values.funnelStage = updateData.funnelStage;
    if (updateData.offerType !== undefined) values.offerType = updateData.offerType;
    if (updateData.creativeTheme !== undefined) values.creativeTheme = updateData.creativeTheme;
    if (updateData.hook !== undefined) values.hook = updateData.hook;
    if (updateData.cta !== undefined) values.cta = updateData.cta;
    if (updateData.bodyContent !== undefined) values.bodyContent = updateData.bodyContent;
    if (updateData.version !== undefined) values.version = updateData.version;
    if (updateData.parentAssetId !== undefined) values.parentAssetId = updateData.parentAssetId;
    if (updateData.fileUrl !== undefined) values.fileUrl = updateData.fileUrl;
    if (updateData.thumbnailUrl !== undefined) values.thumbnailUrl = updateData.thumbnailUrl;
    if (updateData.landingPageUrl !== undefined) values.landingPageUrl = updateData.landingPageUrl;
    if (updateData.tags !== undefined) values.tags = updateData.tags;
    if (updateData.notes !== undefined) values.notes = updateData.notes;

    if (Object.keys(values).length === 0) {
      return this.getById(id);
    }

    values.updatedAt = new Date();

    const rows = await db
      .update(assets)
      .set(values)
      .where(eq(assets.id, id))
      .returning();
    return rows[0] ? rowToAsset(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await db
      .delete(assets)
      .where(eq(assets.id, id))
      .returning({ id: assets.id });
    return rows.length > 0;
  }
}
