import type { Campaign, CampaignSummary } from "../types";
import type { CampaignRepository } from "../repositories";
import { store } from "./store";

export class MockCampaignRepository implements CampaignRepository {
  async getAll(): Promise<Campaign[]> {
    return store.campaigns;
  }

  async getById(id: string): Promise<Campaign | null> {
    return store.campaigns.find((c) => c.id === id) ?? null;
  }

  async getSummaries(): Promise<CampaignSummary[]> {
    return store.campaigns.map((campaign) => this.buildSummary(campaign));
  }

  async getSummaryById(id: string): Promise<CampaignSummary | null> {
    const campaign = store.campaigns.find((c) => c.id === id);
    if (!campaign) return null;
    return this.buildSummary(campaign);
  }

  private buildSummary(campaign: Campaign): CampaignSummary {
    const assets = store.assets.filter(
      (a) => a.campaignId === campaign.id
    );

    // Aggregate latest metrics per asset
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalLeads = 0;
    let totalSpend = 0;

    const assetPerf: { id: string; name: string; ctr: number }[] = [];

    for (const asset of assets) {
      const assetMetrics = store.metrics
        .filter((m) => m.assetId === asset.id)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      if (assetMetrics.length > 0) {
        // Sum all days
        for (const m of assetMetrics) {
          totalImpressions += m.impressions;
          totalClicks += m.clicks;
          totalLeads += m.leads;
          totalSpend += m.spend;
        }

        // Average CTR for the asset
        const avgCtr =
          assetMetrics.reduce((s, m) => s + m.ctr, 0) /
          assetMetrics.length;
        assetPerf.push({
          id: asset.id,
          name: asset.name,
          ctr: Math.round(avgCtr * 10000) / 10000,
        });
      }
    }

    assetPerf.sort((a, b) => b.ctr - a.ctr);

    return {
      campaign,
      assetCount: assets.length,
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
      worstAsset: assetPerf.length > 1 ? assetPerf[assetPerf.length - 1] : null,
    };
  }
}
