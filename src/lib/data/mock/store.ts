import type { Asset, Campaign, MetricSnapshot, Insight, Alert, AutoAction } from "../types";
import {
  seedCampaigns,
  seedAssets,
  seedMetrics,
  seedInsights,
  seedAlerts,
  seedAutoActions,
} from "./seed";

export interface MockStore {
  campaigns: Campaign[];
  assets: Asset[];
  metrics: MetricSnapshot[];
  insights: Insight[];
  alerts: Alert[];
  autoActions: AutoAction[];
}

function createStore(): MockStore {
  return {
    campaigns: [...seedCampaigns],
    assets: [...seedAssets],
    metrics: [...seedMetrics],
    insights: [...seedInsights],
    alerts: [...seedAlerts],
    autoActions: [...seedAutoActions],
  };
}

// Singleton — survives HMR in dev via globalThis
const globalStore = globalThis as unknown as { __mockStore?: MockStore };
if (!globalStore.__mockStore) {
  globalStore.__mockStore = createStore();
}

export const store: MockStore = globalStore.__mockStore;

export function resetStore(): void {
  const fresh = createStore();
  store.campaigns = fresh.campaigns;
  store.assets = fresh.assets;
  store.metrics = fresh.metrics;
  store.insights = fresh.insights;
  store.alerts = fresh.alerts;
  store.autoActions = fresh.autoActions;
}
