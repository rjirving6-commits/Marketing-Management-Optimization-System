import { getApiSessionWithOrg, unauthorizedResponse } from "@/lib/org-context";
import { getRepositories } from "@/lib/data";
import type { IntegrationPlatform, IntegrationStatus, PlatformConnection } from "@/lib/data/types";

function stripTokens(conn: PlatformConnection) {
  return {
    id: conn.id,
    orgId: conn.orgId,
    platform: conn.platform,
    accountId: conn.accountId,
    accountName: conn.accountName,
    status: conn.status,
    tokenExpiresAt: conn.tokenExpiresAt,
    lastSyncAt: conn.lastSyncAt,
    lastSyncError: conn.lastSyncError,
    createdAt: conn.createdAt,
    updatedAt: conn.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") as IntegrationPlatform | null;
    const status = searchParams.get("status") as IntegrationStatus | null;

    const repos = getRepositories(session.org.orgId);
    const connections = await repos.platformConnections.getAll({
      ...(platform ? { platform } : {}),
      ...(status ? { status } : {}),
    });

    return Response.json(connections.map(stripTokens));
  } catch (error) {
    console.error("[integrations-list]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { platform, accountId, accountName, accessToken, refreshToken, tokenExpiresAt } = body;

    if (!platform || !accountId || !accountName) {
      return Response.json(
        { error: "platform, accountId, and accountName are required" },
        { status: 400 }
      );
    }

    const repos = getRepositories(session.org.orgId);

    // Check for existing connection to same platform
    const existing = await repos.platformConnections.getByPlatform(platform);
    if (existing) {
      return Response.json(
        { error: `A ${platform} connection already exists. Disconnect it first.` },
        { status: 409 }
      );
    }

    const connection = await repos.platformConnections.create({
      orgId: session.org.orgId,
      platform,
      accountId,
      accountName,
      status: accessToken ? "connected" : "disconnected",
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      tokenExpiresAt: tokenExpiresAt ?? null,
      lastSyncAt: null,
      lastSyncError: null,
    });

    return Response.json(stripTokens(connection), { status: 201 });
  } catch (error) {
    console.error("[integrations-create]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
