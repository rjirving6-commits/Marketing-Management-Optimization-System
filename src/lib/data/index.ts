import type { Repositories } from "./repositories";
import { MockAssetRepository } from "./mock/asset-repo";
import { MockCampaignRepository } from "./mock/campaign-repo";
import { MockMetricRepository } from "./mock/metric-repo";
import { MockInsightRepository } from "./mock/insight-repo";
import { MockAlertRepository } from "./mock/alert-repo";
import { DrizzleAssetRepository } from "./drizzle/asset-repository";
import { DrizzleCampaignRepository } from "./drizzle/campaign-repository";
import { DrizzleMetricRepository } from "./drizzle/metric-repository";
import { DrizzleInsightRepository } from "./drizzle/insight-repository";
import { DrizzleAlertRepository } from "./drizzle/alert-repository";
import { shouldUseMockData } from "@/lib/dev-mode";

function createMockRepositories(): Repositories {
  return {
    assets: new MockAssetRepository(),
    campaigns: new MockCampaignRepository(),
    metrics: new MockMetricRepository(),
    insights: new MockInsightRepository(),
    alerts: new MockAlertRepository(),
  };
}

function createDrizzleRepositories(): Repositories {
  return {
    assets: new DrizzleAssetRepository(),
    campaigns: new DrizzleCampaignRepository(),
    metrics: new DrizzleMetricRepository(),
    insights: new DrizzleInsightRepository(),
    alerts: new DrizzleAlertRepository(),
  };
}

export function getRepositories(): Repositories {
  if (shouldUseMockData()) {
    return createMockRepositories();
  }
  return createDrizzleRepositories();
}
