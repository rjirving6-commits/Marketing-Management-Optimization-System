import type {
  Asset,
  AssetFilters,
  AssetWithMetrics,
  Campaign,
  CampaignSummary,
  ExecutiveSummary,
  Insight,
  InsightType,
  MetricSnapshot,
  Alert,
  Organization,
  OrgMember,
  OrgRole,
} from "./types";

export interface AssetRepository {
  getAll(filters?: AssetFilters): Promise<Asset[]>;
  getById(id: string): Promise<Asset | null>;
  getWithMetrics(filters?: AssetFilters): Promise<AssetWithMetrics[]>;
  getWithMetricsById(id: string): Promise<AssetWithMetrics | null>;
  create(asset: Omit<Asset, "id" | "createdAt" | "updatedAt">): Promise<Asset>;
  update(id: string, data: Partial<Asset>): Promise<Asset | null>;
  delete(id: string): Promise<boolean>;
}

export interface CampaignRepository {
  getAll(): Promise<Campaign[]>;
  getById(id: string): Promise<Campaign | null>;
  getSummaries(): Promise<CampaignSummary[]>;
  getSummaryById(id: string): Promise<CampaignSummary | null>;
}

export interface MetricRepository {
  getByAssetId(assetId: string, days?: number): Promise<MetricSnapshot[]>;
  getLatestByAssetId(assetId: string): Promise<MetricSnapshot | null>;
  getExecutiveSummary(days?: number): Promise<ExecutiveSummary>;
}

export interface InsightRepository {
  getAll(filters?: { assetId?: string; campaignId?: string; type?: InsightType }): Promise<Insight[]>;
  getById(id: string): Promise<Insight | null>;
  create(insight: Omit<Insight, "id" | "createdAt">): Promise<Insight>;
}

export interface AlertRepository {
  getAll(): Promise<Alert[]>;
  getActive(): Promise<Alert[]>;
  dismiss(id: string): Promise<void>;
  create(alert: Omit<Alert, "id" | "createdAt">): Promise<Alert>;
}

export interface OrgRepository {
  getById(id: string): Promise<Organization | null>;
  getBySlug(slug: string): Promise<Organization | null>;
  create(data: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization>;
  update(id: string, data: Partial<Pick<Organization, "name" | "slug" | "plan" | "stripeCustomerId">>): Promise<Organization | null>;
  getUserOrgs(userId: string): Promise<(Organization & { role: OrgRole })[]>;
  getMembers(orgId: string): Promise<OrgMember[]>;
  addMember(orgId: string, userId: string, role: OrgRole): Promise<OrgMember>;
  updateMemberRole(memberId: string, role: OrgRole): Promise<OrgMember | null>;
  removeMember(memberId: string): Promise<boolean>;
}

export interface Repositories {
  assets: AssetRepository;
  campaigns: CampaignRepository;
  metrics: MetricRepository;
  insights: InsightRepository;
  alerts: AlertRepository;
  orgs: OrgRepository;
}
