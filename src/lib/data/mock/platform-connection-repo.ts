import type {
  PlatformConnection,
  IntegrationPlatform,
  IntegrationStatus,
} from "../types";
import type { PlatformConnectionRepository } from "../repositories";
import { store } from "./store";

export class MockPlatformConnectionRepository
  implements PlatformConnectionRepository
{
  async getAll(
    filters?: { platform?: IntegrationPlatform; status?: IntegrationStatus }
  ): Promise<PlatformConnection[]> {
    let results = store.platformConnections;
    if (filters?.platform) {
      results = results.filter((c) => c.platform === filters.platform);
    }
    if (filters?.status) {
      results = results.filter((c) => c.status === filters.status);
    }
    return results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getById(id: string): Promise<PlatformConnection | null> {
    return store.platformConnections.find((c) => c.id === id) ?? null;
  }

  async getByPlatform(
    platform: IntegrationPlatform
  ): Promise<PlatformConnection | null> {
    return (
      store.platformConnections.find(
        (c) => c.platform === platform && c.status === "connected"
      ) ?? null
    );
  }

  async create(
    data: Omit<PlatformConnection, "id" | "createdAt" | "updatedAt">
  ): Promise<PlatformConnection> {
    const now = new Date().toISOString();
    const connection: PlatformConnection = {
      ...data,
      id: `conn-${String(store.platformConnections.length + 1).padStart(3, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    store.platformConnections.push(connection);
    return connection;
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
    const connection = store.platformConnections.find((c) => c.id === id);
    if (!connection) return null;
    Object.assign(connection, data, { updatedAt: new Date().toISOString() });
    return connection;
  }

  async delete(id: string): Promise<boolean> {
    const index = store.platformConnections.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.platformConnections.splice(index, 1);
    return true;
  }
}
