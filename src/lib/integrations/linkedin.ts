import type { PlatformClient, PlatformMetricRow } from "./types";

/**
 * LinkedIn Marketing API client.
 *
 * In production, this would call the LinkedIn Marketing API:
 *   GET /adAnalytics?q=analytics&dateRange={start,end}&campaigns=urn:li:...
 *
 * Requires LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET env vars for OAuth.
 * Access tokens are obtained via OAuth flow and stored in platform_connections.
 */
export class LinkedInClient implements PlatformClient {
  platform = "linkedin" as const;

  async validateCredentials(accessToken: string): Promise<boolean> {
    // In production: call LinkedIn /me endpoint to verify token
    return accessToken.length > 0;
  }

  async fetchMetrics(
    accountId: string,
    accessToken: string,
    dateRange: { start: string; end: string }
  ): Promise<PlatformMetricRow[]> {
    // In production: call LinkedIn adAnalytics endpoint
    console.log(
      `[linkedin] fetchMetrics for ${accountId} from ${dateRange.start} to ${dateRange.end} (token: ${accessToken.slice(0, 4)}...)`
    );
    return [];
  }
}

export const linkedInClient = new LinkedInClient();
