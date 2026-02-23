// ─── Enums ───────────────────────────────────────────────────────

export type AssetType =
  | "image"
  | "video"
  | "copy"
  | "ad"
  | "landing_page"
  | "lead_magnet"
  | "email"
  | "social_post";

export type Platform =
  | "linkedin"
  | "google"
  | "youtube"
  | "meta"
  | "email"
  | "website";

export type FunnelStage = "tofu" | "mofu" | "bofu" | "retention";

export type OfferType =
  | "free_trial"
  | "demo"
  | "whitepaper"
  | "webinar"
  | "case_study"
  | "consultation"
  | "discount"
  | "newsletter";

export type AssetStatus =
  | "draft"
  | "active"
  | "paused"
  | "archived"
  | "fatigued";

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type AlertType =
  | "fatigue"
  | "budget_pacing"
  | "performance_drop"
  | "opportunity"
  | "anomaly";

export type InsightType =
  | "diagnosis"
  | "explanation"
  | "recommendation"
  | "generation";

export type ImpactLevel = "low" | "medium" | "high";

export type TrendDirection = "up" | "down" | "flat";

// ─── Organization Types ─────────────────────────────────────────

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export type OrgPlan = "free" | "pro" | "enterprise";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrgPlan;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  invitedAt: string;
  joinedAt: string | null;
  userName?: string;
  userEmail?: string;
  userImage?: string | null;
}

// ─── Core Entities ───────────────────────────────────────────────

export interface Campaign {
  id: string;
  orgId: string | null;
  name: string;
  platform: Platform;
  status: CampaignStatus;
  budget: number;
  spent: number;
  audienceSegment: string;
  icpPersona: string;
  funnelStage: FunnelStage;
  offerType: OfferType;
  tags: string[];
  startDate: string; // ISO date
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  orgId: string | null;
  name: string;
  type: AssetType;
  status: AssetStatus;
  platform: Platform;
  campaignId: string;

  // Rich metadata
  audienceSegment: string;
  icpPersona: string;
  funnelStage: FunnelStage;
  offerType: OfferType;
  creativeTheme: string;
  hook: string;
  cta: string;
  bodyContent: string;

  // Version tracking
  version: number;
  parentAssetId: string | null;

  // URLs
  fileUrl: string | null;
  thumbnailUrl: string | null;
  landingPageUrl: string | null;

  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricSnapshot {
  id: string;
  assetId: string;
  date: string; // ISO date

  // Raw metrics
  impressions: number;
  reach: number;
  clicks: number;
  landingPageClicks: number;
  conversions: number;
  leads: number;
  demos: number;
  spend: number;

  // Pre-calculated
  cpm: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  cpl: number;
  costPerDemo: number;
  roas: number;
}

export interface DerivedMetrics {
  fatigueScore: number; // 0-100
  assetHalfLife: number | null; // days
  performanceVelocity: number; // % change per day
  scrollStopRate: number;
  hookRetention: number;
  trendDirection: TrendDirection;
  predictedFatigueDate: string | null; // ISO date
  anomalyScore: number; // 0-100
}

export interface Insight {
  id: string;
  orgId: string | null;
  type: InsightType;
  assetId: string | null;
  campaignId: string | null;
  title: string;
  summary: string;
  details: string; // markdown
  confidence: number; // 0-1
  impactLevel: ImpactLevel;
  actionItems: string[];
  generatedContent: string | null; // for generation type
  createdAt: string;
}

// ─── View Models ─────────────────────────────────────────────────

export interface AssetWithMetrics {
  asset: Asset;
  latestMetrics: MetricSnapshot | null;
  derivedMetrics: DerivedMetrics | null;
  campaignName: string;
  metricsHistory: MetricSnapshot[];
}

export interface CampaignSummary {
  campaign: Campaign;
  assetCount: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  totalSpend: number;
  avgCpl: number;
  avgCtr: number;
  topAsset: { id: string; name: string; ctr: number } | null;
  worstAsset: { id: string; name: string; ctr: number } | null;
}

export interface Alert {
  id: string;
  orgId: string | null;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  assetId: string | null;
  campaignId: string | null;
  createdAt: string;
  dismissed: boolean;
}

export interface ExecutiveSummary {
  dateRange: { start: string; end: string };
  totalSpend: number;
  totalLeads: number;
  avgCpl: number;
  cplTrend: TrendDirection;
  channelEfficiency: {
    platform: Platform;
    spend: number;
    leads: number;
    cpl: number;
  }[];
  fatigueAlerts: number;
  bestThemes: { theme: string; avgCtr: number }[];
  worstThemes: { theme: string; avgCtr: number }[];
  funnelLeakage: {
    stage: FunnelStage;
    dropoffRate: number;
  }[];
  budgetSuggestions: string[];
  forecasts: {
    nextWeekCpl: number;
    nextWeekSpend: number;
    nextWeekLeads: number;
  };
  activeCampaigns: number;
  activeAssets: number;
  alertCount: number;
}

// ─── Automation Types ────────────────────────────────────────────

export type AutoActionType =
  | "pause_fatigued"
  | "reallocate_budget"
  | "suggest_creative_rotation"
  | "escalate_alert";

export type AutoActionStatus = "pending" | "approved" | "executed" | "rejected";

export type AutoActionTargetType = "asset" | "campaign";

export interface AutoAction {
  id: string;
  orgId: string | null;
  type: AutoActionType;
  targetType: AutoActionTargetType;
  targetId: string;
  description: string;
  status: AutoActionStatus;
  triggeredBy: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  executedAt: string | null;
}

// ─── Filter Types ────────────────────────────────────────────────

export interface AssetFilters {
  platform?: Platform;
  funnelStage?: FunnelStage;
  assetType?: AssetType;
  status?: AssetStatus;
  campaignId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
