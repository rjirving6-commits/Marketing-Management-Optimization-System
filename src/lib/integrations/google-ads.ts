import type { PlatformClient, PlatformMetricRow } from "./types";

/**
 * Google Ads API client.
 *
 * In production, this would call the Google Ads API:
 *   POST /v17/customers/{customer-id}/googleAds:searchStream
 *   with GAQL query for campaign/ad group metrics.
 *
 * Requires GOOGLE_ADS_DEVELOPER_TOKEN env var.
 * Access tokens are obtained via Google OAuth and stored in platform_connections.
 */
export class GoogleAdsClient implements PlatformClient {
  platform = "google_ads" as const;

  async validateCredentials(accessToken: string): Promise<boolean> {
    // In production: call Google Ads API with the token to verify
    return accessToken.length > 0;
  }

  async fetchMetrics(
    accountId: string,
    accessToken: string,
    dateRange: { start: string; end: string }
  ): Promise<PlatformMetricRow[]> {
    // In production: use Google Ads API searchStream with GAQL query
    console.log(
      `[google-ads] fetchMetrics for ${accountId} from ${dateRange.start} to ${dateRange.end} (token: ${accessToken.slice(0, 4)}...)`
    );
    return [];
  }
}

export const googleAdsClient = new GoogleAdsClient();
