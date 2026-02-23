import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { automationActions } from "@/lib/schema";
import type { AutoAction, AutoActionStatus } from "../types";
import type { AutoActionRepository } from "../repositories";

function rowToAutoAction(
  row: typeof automationActions.$inferSelect
): AutoAction {
  return {
    id: row.id,
    orgId: row.orgId,
    type: row.type as AutoAction["type"],
    targetType: row.targetType as AutoAction["targetType"],
    targetId: row.targetId,
    description: row.description,
    status: row.status as AutoAction["status"],
    triggeredBy: row.triggeredBy,
    metadata: row.metadata ?? null,
    createdAt: row.createdAt.toISOString(),
    executedAt: row.executedAt?.toISOString() ?? null,
  };
}

export class DrizzleAutoActionRepository implements AutoActionRepository {
  constructor(private orgId?: string) {}

  async getAll(filters?: { status?: AutoActionStatus }): Promise<AutoAction[]> {
    const conditions = [];
    if (this.orgId) conditions.push(eq(automationActions.orgId, this.orgId));
    if (filters?.status)
      conditions.push(eq(automationActions.status, filters.status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db
      .select()
      .from(automationActions)
      .where(where)
      .orderBy(desc(automationActions.createdAt));
    return rows.map(rowToAutoAction);
  }

  async getById(id: string): Promise<AutoAction | null> {
    const rows = await db
      .select()
      .from(automationActions)
      .where(eq(automationActions.id, id));
    return rows.length > 0 ? rowToAutoAction(rows[0]) : null;
  }

  async create(
    data: Omit<AutoAction, "id" | "createdAt">
  ): Promise<AutoAction> {
    const id = `auto-${crypto.randomUUID().slice(0, 8)}`;
    const rows = await db
      .insert(automationActions)
      .values({
        id,
        orgId: this.orgId ?? data.orgId,
        type: data.type,
        targetType: data.targetType,
        targetId: data.targetId,
        description: data.description,
        status: data.status,
        triggeredBy: data.triggeredBy,
        metadata: data.metadata,
        executedAt: data.executedAt ? new Date(data.executedAt) : null,
      })
      .returning();
    return rowToAutoAction(rows[0]);
  }

  async updateStatus(
    id: string,
    status: AutoActionStatus
  ): Promise<AutoAction | null> {
    const executedAt =
      status === "executed" || status === "approved" ? new Date() : undefined;
    const rows = await db
      .update(automationActions)
      .set({ status, ...(executedAt ? { executedAt } : {}) })
      .where(eq(automationActions.id, id))
      .returning();
    return rows.length > 0 ? rowToAutoAction(rows[0]) : null;
  }
}
