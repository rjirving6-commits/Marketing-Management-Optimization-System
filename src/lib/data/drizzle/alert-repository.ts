import { eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { alerts } from "@/lib/schema";
import type { Alert } from "../types";
import type { AlertRepository } from "../repositories";

function rowToAlert(row: typeof alerts.$inferSelect): Alert {
  return {
    id: row.id,
    orgId: row.orgId,
    type: row.type as Alert["type"],
    severity: row.severity as Alert["severity"],
    title: row.title,
    message: row.message,
    assetId: row.assetId,
    campaignId: row.campaignId,
    dismissed: row.dismissed,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DrizzleAlertRepository implements AlertRepository {
  constructor(private orgId?: string) {}

  async getAll(): Promise<Alert[]> {
    const where = this.orgId ? eq(alerts.orgId, this.orgId) : undefined;
    const rows = await db
      .select()
      .from(alerts)
      .where(where)
      .orderBy(desc(alerts.createdAt));
    return rows.map(rowToAlert);
  }

  async getActive(): Promise<Alert[]> {
    const conditions = [eq(alerts.dismissed, false)];
    if (this.orgId) conditions.push(eq(alerts.orgId, this.orgId));
    const rows = await db
      .select()
      .from(alerts)
      .where(and(...conditions))
      .orderBy(desc(alerts.createdAt));
    return rows.map(rowToAlert);
  }

  async dismiss(id: string): Promise<void> {
    await db
      .update(alerts)
      .set({ dismissed: true })
      .where(eq(alerts.id, id));
  }

  async create(
    data: Omit<Alert, "id" | "createdAt">
  ): Promise<Alert> {
    const id = `alert-${crypto.randomUUID().slice(0, 8)}`;
    const rows = await db
      .insert(alerts)
      .values({
        id,
        orgId: this.orgId ?? data.orgId,
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        assetId: data.assetId,
        campaignId: data.campaignId,
        dismissed: data.dismissed,
      })
      .returning();
    return rowToAlert(rows[0]);
  }
}
