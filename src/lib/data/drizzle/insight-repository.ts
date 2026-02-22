import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { insights } from "@/lib/schema";
import type { Insight, InsightType } from "../types";
import type { InsightRepository } from "../repositories";

function rowToInsight(row: typeof insights.$inferSelect): Insight {
  return {
    id: row.id,
    type: row.type as Insight["type"],
    assetId: row.assetId,
    campaignId: row.campaignId,
    title: row.title,
    summary: row.summary,
    details: row.details,
    confidence: row.confidence,
    impactLevel: row.impactLevel as Insight["impactLevel"],
    actionItems: row.actionItems,
    generatedContent: row.generatedContent,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DrizzleInsightRepository implements InsightRepository {
  async getAll(
    filters?: { assetId?: string; campaignId?: string; type?: InsightType }
  ): Promise<Insight[]> {
    const conditions = [];
    if (filters?.assetId)
      conditions.push(eq(insights.assetId, filters.assetId));
    if (filters?.campaignId)
      conditions.push(eq(insights.campaignId, filters.campaignId));
    if (filters?.type) conditions.push(eq(insights.type, filters.type));

    const where =
      conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(insights)
      .where(where)
      .orderBy(desc(insights.createdAt));

    return rows.map(rowToInsight);
  }

  async getById(id: string): Promise<Insight | null> {
    const rows = await db
      .select()
      .from(insights)
      .where(eq(insights.id, id));
    return rows[0] ? rowToInsight(rows[0]) : null;
  }

  async create(data: Omit<Insight, "id" | "createdAt">): Promise<Insight> {
    const id = `insight-${crypto.randomUUID().slice(0, 8)}`;
    const rows = await db
      .insert(insights)
      .values({
        id,
        type: data.type,
        assetId: data.assetId,
        campaignId: data.campaignId,
        title: data.title,
        summary: data.summary,
        details: data.details,
        confidence: data.confidence,
        impactLevel: data.impactLevel,
        actionItems: data.actionItems,
        generatedContent: data.generatedContent,
        createdAt: new Date(),
      })
      .returning();
    return rowToInsight(rows[0]);
  }
}
