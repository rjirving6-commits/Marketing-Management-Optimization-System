import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { platformConnections } from "@/lib/schema";
import type {
  PlatformConnection,
  IntegrationPlatform,
  IntegrationStatus,
} from "../types";
import type { PlatformConnectionRepository } from "../repositories";

function rowToConnection(
  row: typeof platformConnections.$inferSelect
): PlatformConnection {
  return {
    id: row.id,
    orgId: row.orgId,
    platform: row.platform as PlatformConnection["platform"],
    accountId: row.accountId,
    accountName: row.accountName,
    status: row.status as PlatformConnection["status"],
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    tokenExpiresAt: row.tokenExpiresAt?.toISOString() ?? null,
    lastSyncAt: row.lastSyncAt?.toISOString() ?? null,
    lastSyncError: row.lastSyncError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class DrizzlePlatformConnectionRepository
  implements PlatformConnectionRepository
{
  constructor(private orgId?: string) {}

  async getAll(
    filters?: { platform?: IntegrationPlatform; status?: IntegrationStatus }
  ): Promise<PlatformConnection[]> {
    const conditions = [];
    if (this.orgId)
      conditions.push(eq(platformConnections.orgId, this.orgId));
    if (filters?.platform)
      conditions.push(eq(platformConnections.platform, filters.platform));
    if (filters?.status)
      conditions.push(eq(platformConnections.status, filters.status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db
      .select()
      .from(platformConnections)
      .where(where)
      .orderBy(desc(platformConnections.createdAt));
    return rows.map(rowToConnection);
  }

  async getById(id: string): Promise<PlatformConnection | null> {
    const rows = await db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.id, id));
    return rows.length > 0 ? rowToConnection(rows[0]) : null;
  }

  async getByPlatform(
    platform: IntegrationPlatform
  ): Promise<PlatformConnection | null> {
    const conditions = [
      eq(platformConnections.platform, platform),
      eq(platformConnections.status, "connected"),
    ];
    if (this.orgId)
      conditions.push(eq(platformConnections.orgId, this.orgId));

    const rows = await db
      .select()
      .from(platformConnections)
      .where(and(...conditions))
      .limit(1);
    return rows.length > 0 ? rowToConnection(rows[0]) : null;
  }

  async create(
    data: Omit<PlatformConnection, "id" | "createdAt" | "updatedAt">
  ): Promise<PlatformConnection> {
    const id = `conn-${crypto.randomUUID().slice(0, 8)}`;
    const rows = await db
      .insert(platformConnections)
      .values({
        id,
        orgId: this.orgId ?? data.orgId,
        platform: data.platform,
        accountId: data.accountId,
        accountName: data.accountName,
        status: data.status,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiresAt: data.tokenExpiresAt
          ? new Date(data.tokenExpiresAt)
          : null,
        lastSyncAt: data.lastSyncAt ? new Date(data.lastSyncAt) : null,
        lastSyncError: data.lastSyncError,
      })
      .returning();
    return rowToConnection(rows[0]);
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        PlatformConnection,
        | "status"
        | "accessToken"
        | "refreshToken"
        | "tokenExpiresAt"
        | "lastSyncAt"
        | "lastSyncError"
        | "accountName"
      >
    >
  ): Promise<PlatformConnection | null> {
    const values: Record<string, unknown> = {};
    if (data.status !== undefined) values.status = data.status;
    if (data.accessToken !== undefined) values.accessToken = data.accessToken;
    if (data.refreshToken !== undefined)
      values.refreshToken = data.refreshToken;
    if (data.tokenExpiresAt !== undefined)
      values.tokenExpiresAt = data.tokenExpiresAt
        ? new Date(data.tokenExpiresAt)
        : null;
    if (data.lastSyncAt !== undefined)
      values.lastSyncAt = data.lastSyncAt ? new Date(data.lastSyncAt) : null;
    if (data.lastSyncError !== undefined)
      values.lastSyncError = data.lastSyncError;
    if (data.accountName !== undefined)
      values.accountName = data.accountName;

    const rows = await db
      .update(platformConnections)
      .set(values)
      .where(eq(platformConnections.id, id))
      .returning();
    return rows.length > 0 ? rowToConnection(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(platformConnections)
      .where(eq(platformConnections.id, id))
      .returning();
    return result.length > 0;
  }
}
