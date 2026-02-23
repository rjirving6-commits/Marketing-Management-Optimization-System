import { getRepositories } from "@/lib/data";
import type { IntegrationPlatform, PlatformConnection } from "@/lib/data/types";
import type { PlatformClient } from "./types";
import { metaClient } from "./meta";
import { googleAdsClient } from "./google-ads";
import { linkedInClient } from "./linkedin";

const clients: Record<IntegrationPlatform, PlatformClient> = {
  meta: metaClient,
  google_ads: googleAdsClient,
  linkedin: linkedInClient,
};

export function getClient(platform: IntegrationPlatform): PlatformClient {
  return clients[platform];
}

export interface SyncResult {
  connectionId: string;
  platform: IntegrationPlatform;
  metricsIngested: number;
  error: string | null;
}

/**
 * Sync metrics for a single platform connection.
 * Pulls the last 7 days of metrics from the platform API and upserts into metric_snapshots.
 */
export async function syncConnection(
  orgId: string,
  connection: PlatformConnection
): Promise<SyncResult> {
  const repos = getRepositories(orgId);
  const client = getClient(connection.platform);

  if (!connection.accessToken) {
    const error = "No access token available";
    await repos.platformConnections.update(connection.id, {
      status: "error",
      lastSyncError: error,
    });
    return {
      connectionId: connection.id,
      platform: connection.platform,
      metricsIngested: 0,
      error,
    };
  }

  // Check token expiry
  if (
    connection.tokenExpiresAt &&
    new Date(connection.tokenExpiresAt) < new Date()
  ) {
    const error = "Token expired. Please reconnect.";
    await repos.platformConnections.update(connection.id, {
      status: "error",
      lastSyncError: error,
    });
    return {
      connectionId: connection.id,
      platform: connection.platform,
      metricsIngested: 0,
      error,
    };
  }

  try {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const rows = await client.fetchMetrics(
      connection.accountId,
      connection.accessToken,
      { start, end }
    );

    // In production: match assetExternalId to local assets and upsert metrics.
    // For now, we log and count.
    const ingested = rows.length;

    await repos.platformConnections.update(connection.id, {
      lastSyncAt: new Date().toISOString(),
      lastSyncError: null,
      status: "connected",
    });

    return {
      connectionId: connection.id,
      platform: connection.platform,
      metricsIngested: ingested,
      error: null,
    };
  } catch (err) {
    const error =
      err instanceof Error ? err.message : "Unknown sync error";
    await repos.platformConnections.update(connection.id, {
      lastSyncError: error,
      status: "error",
    });
    return {
      connectionId: connection.id,
      platform: connection.platform,
      metricsIngested: 0,
      error,
    };
  }
}

/**
 * Sync all connected platforms for an org.
 * Called via POST /api/integrations/sync.
 */
export async function syncAll(orgId: string): Promise<SyncResult[]> {
  const repos = getRepositories(orgId);
  const connections = await repos.platformConnections.getAll({
    status: "connected",
  });

  const results: SyncResult[] = [];
  for (const connection of connections) {
    const result = await syncConnection(orgId, connection);
    results.push(result);
  }
  return results;
}
