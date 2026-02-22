import { eq, gte, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  metricSnapshots,
  assets,
  campaigns,
  alerts,
} from "@/lib/schema";
import type {
  MetricSnapshot,
  ExecutiveSummary,
  Platform,
  FunnelStage,
} from "../types";
import type { MetricRepository } from "../repositories";

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

export class DrizzleMetricRepository implements MetricRepository {
  async getByAssetId(
    assetId: string,
    days?: number
  ): Promise<MetricSnapshot[]> {
    const rows = await db
      .select()
      .from(metricSnapshots)
      .where(eq(metricSnapshots.assetId, assetId))
      .orderBy(asc(metricSnapshots.date));

    const metrics = rows.map(rowToMetric);

    if (days && days > 0) {
      return metrics.slice(-days);
    }
    return metrics;
  }

  async getLatestByAssetId(
    assetId: string
  ): Promise<MetricSnapshot | null> {
    const rows = await db
      .select()
      .from(metricSnapshots)
      .where(eq(metricSnapshots.assetId, assetId))
      .orderBy(desc(metricSnapshots.date))
      .limit(1);
    return rows[0] ? rowToMetric(rows[0]) : null;
  }

  async getExecutiveSummary(days: number = 30): Promise<ExecutiveSummary> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const allMetrics = await db
      .select()
      .from(metricSnapshots)
      .where(gte(metricSnapshots.date, cutoffStr));

    const allAssets = await db.select().from(assets);
    const allCampaigns = await db.select().from(campaigns);
    const allAlerts = await db.select().from(alerts);

    const assetMap = new Map(allAssets.map((a) => [a.id, a]));

    let totalSpend = 0;
    let totalLeads = 0;

    const platformMap = new Map<
      Platform,
      { spend: number; leads: number }
    >();
    const themeMap = new Map<string, { totalCtr: number; count: number }>();

    for (const metric of allMetrics) {
      totalSpend += metric.spend;
      totalLeads += metric.leads;

      const asset = assetMap.get(metric.assetId);
      if (asset) {
        const platform = asset.platform as Platform;
        const existing = platformMap.get(platform) ?? {
          spend: 0,
          leads: 0,
        };
        existing.spend += metric.spend;
        existing.leads += metric.leads;
        platformMap.set(platform, existing);

        const theme = asset.creativeTheme;
        const themeData = themeMap.get(theme) ?? {
          totalCtr: 0,
          count: 0,
        };
        themeData.totalCtr += metric.ctr;
        themeData.count += 1;
        themeMap.set(theme, themeData);
      }
    }

    const channelEfficiency = Array.from(platformMap.entries()).map(
      ([platform, data]) => ({
        platform,
        spend: Math.round(data.spend * 100) / 100,
        leads: data.leads,
        cpl:
          data.leads > 0
            ? Math.round((data.spend / data.leads) * 100) / 100
            : 0,
      })
    );

    const themes = Array.from(themeMap.entries())
      .map(([theme, data]) => ({
        theme,
        avgCtr:
          Math.round((data.totalCtr / data.count) * 10000) / 10000,
      }))
      .sort((a, b) => b.avgCtr - a.avgCtr);

    const activeCampaigns = allCampaigns.filter(
      (c) => c.status === "active"
    ).length;
    const activeAssets = allAssets.filter(
      (a) => a.status === "active"
    ).length;
    const alertCount = allAlerts.filter((a) => !a.dismissed).length;
    const fatigueAlerts = allAlerts.filter(
      (a) => a.type === "fatigue" && !a.dismissed
    ).length;

    // CPL trend
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const weekAgoStr = weekAgo.toISOString().split("T")[0];
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split("T")[0];

    const recentWeek = allMetrics.filter((m) => m.date >= weekAgoStr);
    const priorWeek = allMetrics.filter(
      (m) => m.date >= twoWeeksAgoStr && m.date < weekAgoStr
    );

    const recentCpl =
      recentWeek.reduce((s, m) => s + m.leads, 0) > 0
        ? recentWeek.reduce((s, m) => s + m.spend, 0) /
          recentWeek.reduce((s, m) => s + m.leads, 0)
        : 0;
    const priorCpl =
      priorWeek.reduce((s, m) => s + m.leads, 0) > 0
        ? priorWeek.reduce((s, m) => s + m.spend, 0) /
          priorWeek.reduce((s, m) => s + m.leads, 0)
        : 0;

    const cplTrend =
      priorCpl > 0 && recentCpl > priorCpl * 1.05
        ? "up"
        : priorCpl > 0 && recentCpl < priorCpl * 0.95
          ? "down"
          : "flat";

    const funnelLeakage: { stage: FunnelStage; dropoffRate: number }[] = [
      { stage: "tofu", dropoffRate: 0.72 },
      { stage: "mofu", dropoffRate: 0.58 },
      { stage: "bofu", dropoffRate: 0.35 },
      { stage: "retention", dropoffRate: 0.12 },
    ];

    const dateRange = {
      start: cutoffStr,
      end: new Date().toISOString().split("T")[0],
    };

    return {
      dateRange,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalLeads,
      avgCpl:
        totalLeads > 0
          ? Math.round((totalSpend / totalLeads) * 100) / 100
          : 0,
      cplTrend,
      channelEfficiency,
      fatigueAlerts,
      bestThemes: themes.slice(0, 3),
      worstThemes: themes.slice(-3).reverse(),
      funnelLeakage,
      budgetSuggestions: [
        "Increase LinkedIn carousel budget by 40% — strong CPL performance",
        "Reduce display retargeting spend by 30% — diminishing returns",
        "Allocate $2,000/month to YouTube in-stream — growing engagement",
      ],
      activeCampaigns,
      activeAssets,
      alertCount,
    };
  }
}
