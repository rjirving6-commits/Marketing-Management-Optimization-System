import type { PlatformClient, PlatformMetricRow } from "./types";

/**
 * Meta Marketing API client.
 *
 * In production, this would call the Meta Marketing API:
 *   GET /{ad-account-id}/insights?fields=impressions,reach,clicks,...&time_range={start,end}
 *
 * Requires META_APP_ID and META_APP_SECRET env vars for OAuth token exchange.
 * Access tokens are obtained via the OAuth flow and stored in platform_connections.
 */
export class MetaClient implements PlatformClient {
  platform = "meta" as const;

  async validateCredentials(accessToken: string): Promise<boolean> {
    // In production: GET /me?access_token={token} and check response
    return accessToken.length > 0;
  }

  async fetchMetrics(
    accountId: string,
    accessToken: string,
    dateRange: { start: string; end: string }
  ): Promise<PlatformMetricRow[]> {
    // In production: call Meta Marketing API /insights endpoint
    // For now, return empty — real integration requires Meta App credentials
    console.log(
      `[meta] fetchMetrics for ${accountId} from ${dateRange.start} to ${dateRange.end} (token: ${accessToken.slice(0, 4)}...)`
    );
    return [];
  }
}

export const metaClient = new MetaClient();
