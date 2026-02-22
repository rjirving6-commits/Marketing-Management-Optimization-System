import type { Insight, InsightType } from "../types";
import type { InsightRepository } from "../repositories";
import { store } from "./store";

export class MockInsightRepository implements InsightRepository {
  async getAll(
    filters?: { assetId?: string; campaignId?: string; type?: InsightType }
  ): Promise<Insight[]> {
    let results = store.insights;

    if (filters?.assetId) {
      results = results.filter((i) => i.assetId === filters.assetId);
    }
    if (filters?.campaignId) {
      results = results.filter(
        (i) => i.campaignId === filters.campaignId
      );
    }
    if (filters?.type) {
      results = results.filter((i) => i.type === filters.type);
    }

    return results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getById(id: string): Promise<Insight | null> {
    return store.insights.find((i) => i.id === id) ?? null;
  }

  async create(data: Omit<Insight, "id" | "createdAt">): Promise<Insight> {
    const insight: Insight = {
      ...data,
      id: `insight-${String(store.insights.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    };
    store.insights.push(insight);
    return insight;
  }
}
