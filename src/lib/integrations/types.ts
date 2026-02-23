import type { IntegrationPlatform } from "@/lib/data/types";

export interface PlatformMetricRow {
  assetExternalId: string;
  date: string; // YYYY-MM-DD
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  leads: number;
  spend: number;
}

export interface PlatformClient {
  platform: IntegrationPlatform;
  validateCredentials(accessToken: string): Promise<boolean>;
  fetchMetrics(
    accountId: string,
    accessToken: string,
    dateRange: { start: string; end: string }
  ): Promise<PlatformMetricRow[]>;
}
