import type { Repositories } from "./repositories";
import { MockAssetRepository } from "./mock/asset-repo";
import { MockCampaignRepository } from "./mock/campaign-repo";
import { MockMetricRepository } from "./mock/metric-repo";
import { MockInsightRepository } from "./mock/insight-repo";
import { MockAlertRepository } from "./mock/alert-repo";
import { MockOrgRepository } from "./mock/org-repo";
import { MockAutoActionRepository } from "./mock/automation-repo";
import { DrizzleAssetRepository } from "./drizzle/asset-repository";
import { DrizzleCampaignRepository } from "./drizzle/campaign-repository";
import { DrizzleMetricRepository } from "./drizzle/metric-repository";
import { DrizzleInsightRepository } from "./drizzle/insight-repository";
import { DrizzleAlertRepository } from "./drizzle/alert-repository";
import { DrizzleOrgRepository } from "./drizzle/org-repository";
import { DrizzleAutoActionRepository } from "./drizzle/automation-repository";
import { shouldUseMockData } from "@/lib/dev-mode";

function createMockRepositories(): Repositories {
  return {
    assets: new MockAssetRepository(),
    campaigns: new MockCampaignRepository(),
    metrics: new MockMetricRepository(),
    insights: new MockInsightRepository(),
    alerts: new MockAlertRepository(),
    orgs: new MockOrgRepository(),
    autoActions: new MockAutoActionRepository(),
  };
}

function createDrizzleRepositories(orgId?: string): Repositories {
  return {
    assets: new DrizzleAssetRepository(orgId),
    campaigns: new DrizzleCampaignRepository(orgId),
    metrics: new DrizzleMetricRepository(orgId),
    insights: new DrizzleInsightRepository(orgId),
    alerts: new DrizzleAlertRepository(orgId),
    orgs: new DrizzleOrgRepository(),
    autoActions: new DrizzleAutoActionRepository(orgId),
  };
}

export function getRepositories(orgId?: string): Repositories {
  if (shouldUseMockData()) {
    return createMockRepositories();
  }
  return createDrizzleRepositories(orgId);
}
