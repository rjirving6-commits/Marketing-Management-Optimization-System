import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ─── Organization Tables ────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const orgMembers = pgTable("org_members", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  joinedAt: timestamp("joined_at"),
});

// ─── Marketing Domain Tables ────────────────────────────────────

export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull(),
  budget: real("budget").notNull(),
  spent: real("spent").notNull().default(0),
  audienceSegment: text("audience_segment").notNull(),
  icpPersona: text("icp_persona").notNull(),
  funnelStage: text("funnel_stage").notNull(),
  offerType: text("offer_type").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const assets = pgTable("assets", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  platform: text("platform").notNull(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  audienceSegment: text("audience_segment").notNull(),
  icpPersona: text("icp_persona").notNull(),
  funnelStage: text("funnel_stage").notNull(),
  offerType: text("offer_type").notNull(),
  creativeTheme: text("creative_theme").notNull(),
  hook: text("hook").notNull(),
  cta: text("cta").notNull(),
  bodyContent: text("body_content").notNull(),
  version: integer("version").notNull().default(1),
  parentAssetId: text("parent_asset_id"),
  fileUrl: text("file_url"),
  thumbnailUrl: text("thumbnail_url"),
  landingPageUrl: text("landing_page_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const metricSnapshots = pgTable("metric_snapshots", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  impressions: integer("impressions").notNull().default(0),
  reach: integer("reach").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  landingPageClicks: integer("landing_page_clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  leads: integer("leads").notNull().default(0),
  demos: integer("demos").notNull().default(0),
  spend: real("spend").notNull().default(0),
  cpm: real("cpm").notNull().default(0),
  ctr: real("ctr").notNull().default(0),
  cpc: real("cpc").notNull().default(0),
  conversionRate: real("conversion_rate").notNull().default(0),
  cpl: real("cpl").notNull().default(0),
  costPerDemo: real("cost_per_demo").notNull().default(0),
  roas: real("roas").notNull().default(0),
});

export const insights = pgTable("insights", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  type: text("type").notNull(),
  assetId: text("asset_id").references(() => assets.id, {
    onDelete: "set null",
  }),
  campaignId: text("campaign_id").references(() => campaigns.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  details: text("details").notNull(),
  confidence: real("confidence").notNull(),
  impactLevel: text("impact_level").notNull(),
  actionItems: jsonb("action_items").$type<string[]>().notNull().default([]),
  generatedContent: text("generated_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platformConnections = pgTable("platform_connections", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  platform: text("platform").notNull(),
  accountId: text("account_id").notNull(),
  accountName: text("account_name").notNull(),
  status: text("status").notNull().default("disconnected"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncError: text("last_sync_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const automationActions = pgTable("automation_actions", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  type: text("type").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  triggeredBy: text("triggered_by").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  executedAt: timestamp("executed_at"),
});

export const alerts = pgTable("alerts", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  assetId: text("asset_id").references(() => assets.id, {
    onDelete: "set null",
  }),
  campaignId: text("campaign_id").references(() => campaigns.id, {
    onDelete: "set null",
  }),
  dismissed: boolean("dismissed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
