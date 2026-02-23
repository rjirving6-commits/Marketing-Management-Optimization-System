import { getApiSessionWithOrg, unauthorizedResponse } from "@/lib/org-context";
import { getRepositories } from "@/lib/data";
import { forecast, mean } from "@/lib/ml";

export async function GET(request: Request) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");
    const days = parseInt(searchParams.get("days") ?? "7", 10);

    const repos = getRepositories(session.org.orgId);

    if (assetId) {
      // Per-asset forecast
      const metrics = await repos.metrics.getByAssetId(assetId);
      if (metrics.length === 0) {
        return Response.json({ error: "No metrics found" }, { status: 404 });
      }

      const sorted = [...metrics].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const ctrSeries = sorted.map((m) => m.ctr);
      const cplSeries = sorted.map((m) => m.cpl);
      const spendSeries = sorted.map((m) => m.spend);

      return Response.json({
        assetId,
        forecastDays: days,
        ctr: forecast(ctrSeries, days),
        cpl: forecast(cplSeries, days),
        spend: forecast(spendSeries, days),
      });
    }

    // Org-wide forecast
    const assetsWithMetrics = await repos.assets.getWithMetrics();

    const dailyData = new Map<string, { ctr: number[]; cpl: number; spend: number; leads: number }>();
    for (const awm of assetsWithMetrics) {
      for (const m of awm.metricsHistory) {
        const existing = dailyData.get(m.date) ?? { ctr: [], cpl: 0, spend: 0, leads: 0 };
        existing.ctr.push(m.ctr);
        existing.spend += m.spend;
        existing.leads += m.leads;
        dailyData.set(m.date, existing);
      }
    }

    const sortedDates = Array.from(dailyData.keys()).sort();
    const dailyCtr = sortedDates.map((d) => mean(dailyData.get(d)!.ctr));
    const dailyCpl = sortedDates.map((d) => {
      const data = dailyData.get(d)!;
      return data.leads > 0 ? data.spend / data.leads : 0;
    });
    const dailySpend = sortedDates.map((d) => dailyData.get(d)!.spend);

    return Response.json({
      assetId: null,
      forecastDays: days,
      ctr: forecast(dailyCtr, days),
      cpl: forecast(dailyCpl, days),
      spend: forecast(dailySpend, days),
    });
  } catch (error) {
    console.error("[forecasts]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
