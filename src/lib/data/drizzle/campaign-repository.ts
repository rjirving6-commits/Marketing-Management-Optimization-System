import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns, assets, metricSnapshots } from "@/lib/schema";
import type { Campaign, CampaignSummary } from "../types";
import type { CampaignRepository } from "../repositories";

function rowToCampaign(row: typeof campaigns.$inferSelect): Campaign {
  return {
    id: row.id,
    name: row.name,
    platform: row.platform as Campaign["platform"],
    status: row.status as Campaign["status"],
    budget: row.budget,
    spent: row.spent,
    audienceSegment: row.audienceSegment,
    icpPersona: row.icpPersona,
    funnelStage: row.funnelStage as Campaign["funnelStage"],
    offerType: row.offerType as Campaign["offerType"],
    tags: row.tags,
    startDate: row.startDate,
    endDate: row.endDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class DrizzleCampaignRepository implements CampaignRepository {
  async getAll(): Promise<Campaign[]> {
    const rows = await db.select().from(campaigns);
    return rows.map(rowToCampaign);
  }

  async getById(id: string): Promise<Campaign | null> {
    const rows = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id));
    return rows[0] ? rowToCampaign(rows[0]) : null;
  }

  async getSummaries(): Promise<CampaignSummary[]> {
    const rows = await db.select().from(campaigns);
    const summaries: CampaignSummary[] = [];
    for (const row of rows) {
      summaries.push(await this.buildSummary(row));
    }
    return summaries;
  }

  async getSummaryById(id: string): Promise<CampaignSummary | null> {
    const rows = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id));
    if (!rows[0]) return null;
    return this.buildSummary(rows[0]);
  }

  private async buildSummary(
    row: typeof campaigns.$inferSelect
  ): Promise<CampaignSummary> {
    const campaignAssets = await db
      .select()
      .from(assets)
      .where(eq(assets.campaignId, row.id));

    let totalImpressions = 0;
    let totalClicks = 0;
    let totalLeads = 0;
    let totalSpend = 0;

    const assetPerf: { id: string; name: string; ctr: number }[] = [];

    for (const asset of campaignAssets) {
      const metrics = await db
        .select()
        .from(metricSnapshots)
        .where(eq(metricSnapshots.assetId, asset.id));

      if (metrics.length > 0) {
        for (const m of metrics) {
          totalImpressions += m.impressions;
          totalClicks += m.clicks;
          totalLeads += m.leads;
          totalSpend += m.spend;
        }

        const avgCtr =
          metrics.reduce((s, m) => s + m.ctr, 0) / metrics.length;
        assetPerf.push({
          id: asset.id,
          name: asset.name,
          ctr: Math.round(avgCtr * 10000) / 10000,
        });
      }
    }

    assetPerf.sort((a, b) => b.ctr - a.ctr);

    return {
      campaign: rowToCampaign(row),
      assetCount: campaignAssets.length,
      totalImpressions,
      totalClicks,
      totalLeads,
      totalSpend: Math.round(totalSpend * 100) / 100,
      avgCpl:
        totalLeads > 0
          ? Math.round((totalSpend / totalLeads) * 100) / 100
          : 0,
      avgCtr:
        totalImpressions > 0
          ? Math.round((totalClicks / totalImpressions) * 10000) / 10000
          : 0,
      topAsset: assetPerf[0] ?? null,
      worstAsset:
        assetPerf.length > 1 ? assetPerf[assetPerf.length - 1] : null,
    };
  }
}
