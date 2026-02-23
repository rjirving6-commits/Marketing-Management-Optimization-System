import type {
  MetricSnapshot,
  ExecutiveSummary,
  Platform,
  FunnelStage,
} from "../types";
import type { MetricRepository } from "../repositories";
import { store } from "./store";
import { mean, forecast } from "@/lib/ml";

export class MockMetricRepository implements MetricRepository {
  async getByAssetId(
    assetId: string,
    days?: number
  ): Promise<MetricSnapshot[]> {
    const all = store.metrics
      .filter((m) => m.assetId === assetId)
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    if (days && days > 0) {
      return all.slice(-days);
    }
    return all;
  }

  async getLatestByAssetId(
    assetId: string
  ): Promise<MetricSnapshot | null> {
    const sorted = store.metrics
      .filter((m) => m.assetId === assetId)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    return sorted[0] ?? null;
  }

  async getExecutiveSummary(days: number = 30): Promise<ExecutiveSummary> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const recentMetrics = store.metrics.filter(
      (m) => m.date >= cutoffStr
    );

    let totalSpend = 0;
    let totalLeads = 0;

    // Per-platform aggregation
    const platformMap = new Map<
      Platform,
      { spend: number; leads: number }
    >();
    // Per-theme aggregation
    const themeMap = new Map<string, { totalCtr: number; count: number }>();

    for (const metric of recentMetrics) {
      totalSpend += metric.spend;
      totalLeads += metric.leads;

      const asset = store.assets.find((a) => a.id === metric.assetId);
      if (asset) {
        const platform = asset.platform;
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

    const activeCampaigns = store.campaigns.filter(
      (c) => c.status === "active"
    ).length;
    const activeAssets = store.assets.filter(
      (a) => a.status === "active"
    ).length;
    const alertCount = store.alerts.filter((a) => !a.dismissed).length;
    const fatigueAlerts = store.alerts.filter(
      (a) => a.type === "fatigue" && !a.dismissed
    ).length;

    // CPL trend — compare last 7 days to prior 7 days
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentWeek = recentMetrics.filter(
      (m) => m.date >= weekAgo.toISOString().split("T")[0]
    );
    const priorWeek = recentMetrics.filter(
      (m) =>
        m.date >= twoWeeksAgo.toISOString().split("T")[0] &&
        m.date < weekAgo.toISOString().split("T")[0]
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

    // Funnel leakage: computed from real conversion data
    const funnelStageData = new Map<FunnelStage, { clicks: number; conversions: number }>();
    for (const metric of recentMetrics) {
      const asset = store.assets.find((a) => a.id === metric.assetId);
      if (!asset) continue;
      const stage = asset.funnelStage;
      const existing = funnelStageData.get(stage) ?? { clicks: 0, conversions: 0 };
      existing.clicks += metric.clicks;
      existing.conversions += metric.conversions;
      funnelStageData.set(stage, existing);
    }

    const funnelStages: FunnelStage[] = ["tofu", "mofu", "bofu", "retention"];
    const funnelLeakage = funnelStages.map((stage) => {
      const data = funnelStageData.get(stage);
      const dropoffRate = data && data.clicks > 0
        ? Math.round((1 - data.conversions / data.clicks) * 100) / 100
        : 0;
      return { stage, dropoffRate };
    });

    // Budget suggestions from channel efficiency ranking
    const sortedChannels = [...channelEfficiency].sort((a, b) => {
      if (a.cpl === 0 && b.cpl === 0) return 0;
      if (a.cpl === 0) return 1;
      if (b.cpl === 0) return -1;
      return a.cpl - b.cpl;
    });

    const budgetSuggestions: string[] = [];
    if (sortedChannels.length > 0) {
      const best = sortedChannels[0];
      budgetSuggestions.push(
        `Increase ${best.platform} budget — best CPL at $${best.cpl.toFixed(2)}`
      );
    }
    if (sortedChannels.length > 1) {
      const worst = sortedChannels[sortedChannels.length - 1];
      budgetSuggestions.push(
        `Reduce ${worst.platform} spend — highest CPL at $${worst.cpl.toFixed(2)}`
      );
    }
    for (const ch of sortedChannels.slice(1, -1)) {
      if (ch.leads > 0 && ch.cpl < (totalLeads > 0 ? totalSpend / totalLeads : 0)) {
        budgetSuggestions.push(
          `Growing opportunity on ${ch.platform} — CPL $${ch.cpl.toFixed(2)} below org average`
        );
        break;
      }
    }

    // Forecasts: 7-day ahead predictions
    const metricsByDate = new Map<string, { spend: number; leads: number }>();
    for (const metric of recentMetrics) {
      const existing = metricsByDate.get(metric.date) ?? { spend: 0, leads: 0 };
      existing.spend += metric.spend;
      existing.leads += metric.leads;
      metricsByDate.set(metric.date, existing);
    }
    const sortedDates = Array.from(metricsByDate.keys()).sort();
    const dailyCpl = sortedDates.map((d) => {
      const data = metricsByDate.get(d)!;
      return data.leads > 0 ? data.spend / data.leads : 0;
    });
    const dailySpend = sortedDates.map((d) => metricsByDate.get(d)!.spend);
    const dailyLeads = sortedDates.map((d) => metricsByDate.get(d)!.leads);

    const cplForecast = forecast(dailyCpl, 7);
    const spendForecast = forecast(dailySpend, 7);
    const leadsForecast = forecast(dailyLeads, 7);

    const forecasts = {
      nextWeekCpl: Math.round(mean(cplForecast) * 100) / 100,
      nextWeekSpend: Math.round(spendForecast.reduce((s, v) => s + v, 0) * 100) / 100,
      nextWeekLeads: Math.round(leadsForecast.reduce((s, v) => s + v, 0)),
    };

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
      budgetSuggestions,
      forecasts,
      activeCampaigns,
      activeAssets,
      alertCount,
    };
  }
}
