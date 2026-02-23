import type { AutoAction, AutoActionStatus } from "../types";
import type { AutoActionRepository } from "../repositories";
import { store } from "./store";

export class MockAutoActionRepository implements AutoActionRepository {
  async getAll(filters?: { status?: AutoActionStatus }): Promise<AutoAction[]> {
    let results = store.autoActions;
    if (filters?.status) {
      results = results.filter((a) => a.status === filters.status);
    }
    return results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getById(id: string): Promise<AutoAction | null> {
    return store.autoActions.find((a) => a.id === id) ?? null;
  }

  async create(data: Omit<AutoAction, "id" | "createdAt">): Promise<AutoAction> {
    const action: AutoAction = {
      ...data,
      id: `auto-${String(store.autoActions.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    };
    store.autoActions.push(action);
    return action;
  }

  async updateStatus(
    id: string,
    status: AutoActionStatus
  ): Promise<AutoAction | null> {
    const action = store.autoActions.find((a) => a.id === id);
    if (!action) return null;
    action.status = status;
    if (status === "executed" || status === "approved") {
      action.executedAt = new Date().toISOString();
    }
    return action;
  }
}
