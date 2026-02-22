import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { alerts } from "@/lib/schema";
import type { Alert } from "../types";
import type { AlertRepository } from "../repositories";

function rowToAlert(row: typeof alerts.$inferSelect): Alert {
  return {
    id: row.id,
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
  async getAll(): Promise<Alert[]> {
    const rows = await db
      .select()
      .from(alerts)
      .orderBy(desc(alerts.createdAt));
    return rows.map(rowToAlert);
  }

  async getActive(): Promise<Alert[]> {
    const rows = await db
      .select()
      .from(alerts)
      .where(eq(alerts.dismissed, false))
      .orderBy(desc(alerts.createdAt));
    return rows.map(rowToAlert);
  }

  async dismiss(id: string): Promise<void> {
    await db
      .update(alerts)
      .set({ dismissed: true })
      .where(eq(alerts.id, id));
  }
}
