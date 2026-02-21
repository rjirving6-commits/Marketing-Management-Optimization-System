# RampRight — Phase 3: Multi-Tenant, ML, Auto-Optimization

## Overview
Phase 3 transforms RampRight from a single-user tool into a production SaaS platform with multi-tenancy, machine learning predictions, and automated optimization actions. This is the maturity phase — adding scale, intelligence, and autonomy.

## Goals
- Multi-tenant data isolation with team/organization support
- ML models for performance prediction and budget allocation
- Automated optimization actions (pause, reallocate, suggest creative variants)
- Platform API integrations for real-time data sync

## Multi-Tenant Architecture

### Organization Model
New tables:
- `organizations` — id, name, slug, plan, stripe_customer_id, created_at
- `org_members` — id, org_id (FK), user_id (FK), role (owner, admin, member, viewer), invited_at, joined_at

### Data Isolation
- All existing tables (campaigns, assets, metrics, insights, alerts, patterns) gain an `org_id` column
- All repository queries scoped by `org_id` from session context
- Middleware extracts org context from session and injects into request

### Features
- **Org Switcher** — users belonging to multiple orgs can switch context
- **Team Management** (`/settings/team`) — invite members, assign roles, remove members
- **Role-Based Access** — viewers read-only, members can create/edit, admins manage team, owners manage billing
- **Billing Integration** — Stripe subscription per org (existing Stripe env vars)

### New Files
- `src/lib/schema.ts` — add `organizations`, `org_members` tables; add `org_id` to data tables
- `src/lib/org-context.ts` — middleware/helper to extract org from session
- `src/app/(marketing)/settings/team/page.tsx`
- `src/components/pages/team-settings-client.tsx`
- `src/app/api/orgs/route.ts` — org CRUD
- `src/app/api/orgs/[id]/members/route.ts` — member management

## ML Predictions

### Performance Forecasting
- Predict asset performance over next 7/14/30 days based on historical metric curves
- Model: time-series regression using existing metric snapshots
- Implementation: server-side via OpenRouter (structured output) or lightweight statistical model

### Budget Allocation
- Given total budget and N active campaigns, recommend optimal allocation based on predicted ROAS
- Inputs: historical ROAS by campaign, spend curves, diminishing returns detection
- Output: recommended budget split with confidence intervals

### Creative Scoring
- Score new creative assets before launch based on similarity to top-performing patterns (Phase 2)
- Uses pattern library data + metric history
- Surfaces as a "Predicted Performance" badge on asset creation

### New Files
- `src/lib/ml/forecast.ts` — performance forecasting logic
- `src/lib/ml/budget-optimizer.ts` — budget allocation recommendations
- `src/lib/ml/creative-scorer.ts` — pre-launch creative scoring
- `src/app/api/ml/forecast/route.ts`
- `src/app/api/ml/budget/route.ts`
- `src/app/api/ml/score/route.ts`

### UI Integration
- Asset detail page: "Forecast" tab with predicted metric curves
- Campaign page: "Optimize Budget" button with AI recommendation modal
- Asset creation page: predicted performance score before publish

## Auto-Optimization

### Automated Actions
- **Pause Fatigued Assets** — auto-pause when fatigueScore exceeds threshold (configurable)
- **Budget Reallocation** — shift budget from underperforming to outperforming campaigns (requires approval)
- **Creative Rotation** — suggest swapping underperforming creative variants based on pattern library
- **Alert Escalation** — if an alert goes unacknowledged for N hours, escalate severity or notify via email

### Action Log
New table: `automation_actions`
- id, org_id, type, target_type (asset/campaign), target_id, description, status (pending, approved, executed, rejected), triggered_by (rule name), created_at, executed_at

### Approval Workflow
- Actions default to "pending" — shown in a review queue
- Users approve/reject with one click
- Configurable: certain low-risk actions can auto-execute (e.g., pause fatigued asset)

### New Files
- `src/lib/automation/engine.ts` — evaluates auto-optimization rules
- `src/lib/automation/actions.ts` — action definitions and executors
- `src/lib/automation/types.ts` — action types, approval workflow
- `src/app/(marketing)/automation/page.tsx` — action review queue
- `src/components/pages/automation-client.tsx`
- `src/app/api/automation/route.ts` — list/approve/reject actions

## Platform Integrations

### Real-Time Data Sync
- Connect to ad platform APIs (Meta Ads, Google Ads, LinkedIn Ads) for automatic metric ingestion
- Replace manual data entry with scheduled sync jobs
- Store platform credentials per org (encrypted)

### Integration Architecture
- `src/lib/integrations/meta.ts` — Meta Marketing API client
- `src/lib/integrations/google-ads.ts` — Google Ads API client
- `src/lib/integrations/linkedin.ts` — LinkedIn Marketing API client
- `src/lib/integrations/sync.ts` — scheduler that pulls metrics and upserts into metric_snapshots
- `src/app/(marketing)/settings/integrations/page.tsx` — connect/disconnect platform accounts

### New Environment Variables
- `META_APP_ID`, `META_APP_SECRET`
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

## Definition of Done
- Multi-tenant data isolation verified (org A cannot see org B data)
- ML forecast endpoint returns 7/14/30 day predictions for any asset
- Budget optimizer produces allocation recommendations with confidence scores
- Auto-optimization review queue shows pending actions with approve/reject
- At least one platform integration (Meta or Google Ads) syncs real metrics
- All role-based access controls enforced
- `pnpm lint && pnpm typecheck && pnpm build` pass
- New DB tables migrated, new env vars documented in `env.example`
