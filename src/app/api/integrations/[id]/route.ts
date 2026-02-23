import { getApiSessionWithOrg, unauthorizedResponse } from "@/lib/org-context";
import { getRepositories } from "@/lib/data";
import type { PlatformConnection } from "@/lib/data/types";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const repos = getRepositories(session.org.orgId);
    const connection = await repos.platformConnections.getById(id);
    if (!connection) {
      return Response.json({ error: "Connection not found" }, { status: 404 });
    }

    return Response.json(stripTokens(connection));
  } catch (error) {
    console.error("[integrations-get]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const repos = getRepositories(session.org.orgId);
    const existing = await repos.platformConnections.getById(id);
    if (!existing) {
      return Response.json({ error: "Connection not found" }, { status: 404 });
    }

    const updated = await repos.platformConnections.update(id, {
      ...(body.accountName !== undefined ? { accountName: body.accountName } : {}),
      ...(body.accessToken !== undefined ? { accessToken: body.accessToken } : {}),
      ...(body.refreshToken !== undefined ? { refreshToken: body.refreshToken } : {}),
      ...(body.tokenExpiresAt !== undefined ? { tokenExpiresAt: body.tokenExpiresAt } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    });

    if (!updated) {
      return Response.json({ error: "Failed to update" }, { status: 500 });
    }

    return Response.json(stripTokens(updated));
  } catch (error) {
    console.error("[integrations-update]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const repos = getRepositories(session.org.orgId);
    const deleted = await repos.platformConnections.delete(id);

    if (!deleted) {
      return Response.json({ error: "Connection not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[integrations-delete]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
