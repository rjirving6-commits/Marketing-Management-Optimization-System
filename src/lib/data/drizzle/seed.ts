import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/schema";
import {
  seedCampaigns,
  seedAssets,
  seedMetrics,
  seedInsights,
  seedAlerts,
} from "../mock/seed";

async function seed() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("POSTGRES_URL environment variable is not set");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log("Seeding database...");

  // Clear existing data (in reverse FK order)
  console.log("  Clearing existing data...");
  await db.delete(schema.alerts);
  await db.delete(schema.insights);
  await db.delete(schema.metricSnapshots);
  await db.delete(schema.assets);
  await db.delete(schema.campaigns);

  // Insert campaigns
  console.log(`  Inserting ${seedCampaigns.length} campaigns...`);
  for (const campaign of seedCampaigns) {
    await db.insert(schema.campaigns).values({
      id: campaign.id,
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      budget: campaign.budget,
      spent: campaign.spent,
      audienceSegment: campaign.audienceSegment,
      icpPersona: campaign.icpPersona,
      funnelStage: campaign.funnelStage,
      offerType: campaign.offerType,
      tags: campaign.tags,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdAt: new Date(campaign.createdAt),
      updatedAt: new Date(campaign.updatedAt),
    });
  }

  // Insert assets
  console.log(`  Inserting ${seedAssets.length} assets...`);
  for (const asset of seedAssets) {
    await db.insert(schema.assets).values({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      platform: asset.platform,
      campaignId: asset.campaignId,
      audienceSegment: asset.audienceSegment,
      icpPersona: asset.icpPersona,
      funnelStage: asset.funnelStage,
      offerType: asset.offerType,
      creativeTheme: asset.creativeTheme,
      hook: asset.hook,
      cta: asset.cta,
      bodyContent: asset.bodyContent,
      version: asset.version,
      parentAssetId: asset.parentAssetId,
      fileUrl: asset.fileUrl,
      thumbnailUrl: asset.thumbnailUrl,
      landingPageUrl: asset.landingPageUrl,
      tags: asset.tags,
      notes: asset.notes,
      createdAt: new Date(asset.createdAt),
      updatedAt: new Date(asset.updatedAt),
    });
  }

  // Insert metrics in batches
  console.log(`  Inserting ${seedMetrics.length} metric snapshots...`);
  const BATCH_SIZE = 100;
  for (let i = 0; i < seedMetrics.length; i += BATCH_SIZE) {
    const batch = seedMetrics.slice(i, i + BATCH_SIZE);
    await db.insert(schema.metricSnapshots).values(
      batch.map((m) => ({
        id: m.id,
        assetId: m.assetId,
        date: m.date,
        impressions: m.impressions,
        reach: m.reach,
        clicks: m.clicks,
        landingPageClicks: m.landingPageClicks,
        conversions: m.conversions,
        leads: m.leads,
        demos: m.demos,
        spend: m.spend,
        cpm: m.cpm,
        ctr: m.ctr,
        cpc: m.cpc,
        conversionRate: m.conversionRate,
        cpl: m.cpl,
        costPerDemo: m.costPerDemo,
        roas: m.roas,
      }))
    );
  }

  // Insert insights
  console.log(`  Inserting ${seedInsights.length} insights...`);
  for (const insight of seedInsights) {
    await db.insert(schema.insights).values({
      id: insight.id,
      type: insight.type,
      assetId: insight.assetId,
      campaignId: insight.campaignId,
      title: insight.title,
      summary: insight.summary,
      details: insight.details,
      confidence: insight.confidence,
      impactLevel: insight.impactLevel,
      actionItems: insight.actionItems,
      generatedContent: insight.generatedContent,
      createdAt: new Date(insight.createdAt),
    });
  }

  // Insert alerts
  console.log(`  Inserting ${seedAlerts.length} alerts...`);
  for (const alert of seedAlerts) {
    await db.insert(schema.alerts).values({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      assetId: alert.assetId,
      campaignId: alert.campaignId,
      dismissed: alert.dismissed,
      createdAt: new Date(alert.createdAt),
    });
  }

  console.log("Seed complete!");
  await client.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
