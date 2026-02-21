# RampRight — Phase 2: Alert Engine, Pattern Library, Executive View

## Overview
Phase 2 adds intelligent automation and strategic visibility. The Alert Engine monitors metrics and fires actionable notifications. The Pattern Library captures what works across campaigns. The Executive View provides a high-level dashboard for leadership reporting.

## Goals
- Automated alert detection based on metric thresholds and trends
- Reusable pattern library extracted from top-performing assets
- Executive dashboard with cross-campaign KPIs and exportable reports
- AI-powered recommendations integrated into alerts and patterns

## Alert Engine

### Architecture
- Background job (cron or on-demand) that evaluates rules against metric snapshots
- Rules defined as typed configurations (not hardcoded)
- Alerts written to the `alerts` table with structured metadata

### Alert Rules
- **Budget Pacing** — campaign spend rate vs. remaining budget and days
- **Performance Drop** — asset metrics decline >X% over N-day window
- **Creative Fatigue** — fatigueScore exceeds threshold (already computed in Phase 0)
- **Cost Spike** — CPA/CPL exceeds campaign average by >X%
- **Conversion Anomaly** — conversion rate deviates significantly from rolling average
- **Underperforming Asset** — asset below campaign median on primary KPI for N+ days

### New Files
- `src/lib/alerts/engine.ts` — Rule evaluator, iterates assets/campaigns
- `src/lib/alerts/rules.ts` — Individual rule definitions with thresholds
- `src/lib/alerts/types.ts` — Rule config types, evaluation results
- `src/app/api/alerts/evaluate/route.ts` — API endpoint to trigger evaluation

### Alert Delivery
- In-app notification badge on nav sidebar (count of undismissed alerts)
- Alert detail cards on dashboard with severity badges (existing UI components)
- Optional: AI-generated suggested action per alert via OpenRouter

## Pattern Library

### Concept
Extract and catalog repeatable patterns from high-performing assets — hooks, CTAs, creative formats, audience-offer combos — so they can be reused in future campaigns.

### Data Model
New table: `patterns`
- id, name, type (hook, cta, format, audience_offer, creative_structure)
- description, example_assets (array of asset IDs)
- performance_summary (aggregated metrics from contributing assets)
- tags, confidence_score
- created_at, updated_at

### Features
- **Auto-Detection** — AI analyzes top-performing assets and suggests patterns
- **Manual Curation** — users can create/edit patterns and tag assets
- **Pattern Page** (`/patterns`) — browsable library with filters by type, platform, funnel stage
- **Pattern Detail** (`/patterns/[id]`) — pattern description, linked assets with metrics, usage suggestions
- **Asset Cross-Reference** — asset detail page shows which patterns it matches

### New Files
- `src/lib/data/types.ts` — add `Pattern` type
- `src/lib/schema.ts` — add `patterns` table
- `src/lib/data/drizzle/pattern-repository.ts`
- `src/app/(marketing)/patterns/page.tsx`
- `src/app/(marketing)/patterns/[id]/page.tsx`
- `src/components/pages/patterns-client.tsx`
- `src/components/pages/pattern-detail-client.tsx`
- `src/app/api/patterns/route.ts`
- `src/app/api/patterns/[id]/route.ts`
- `src/app/api/patterns/detect/route.ts` — AI-powered pattern detection

## Executive View

### Concept
A single-page dashboard designed for leadership — high-level KPIs, trend lines, campaign comparisons, and exportable summaries. No operational detail, just strategic signal.

### Features
- **KPI Summary Cards** — total spend, total conversions, blended ROAS, blended CPA, active campaigns count
- **Trend Charts** — weekly/monthly spend, conversions, ROAS over time (using existing Recharts)
- **Campaign Comparison Table** — all campaigns ranked by primary KPI with sparklines
- **AI Executive Summary** — one-paragraph AI-generated summary of current state and recommendations
- **Export** — copy summary as markdown, download chart data as CSV

### New Files
- `src/app/(marketing)/executive/page.tsx`
- `src/components/pages/executive-client.tsx`
- `src/app/api/metrics/executive/route.ts` — aggregated executive metrics endpoint

### Navigation
- Add "Executive" link to nav sidebar (with a Briefcase icon)

## Definition of Done
- Alert engine evaluates 6+ rules and creates alerts with correct severity
- Pattern library page shows auto-detected and manually curated patterns
- Executive dashboard renders KPIs, trends, and AI summary
- All new pages follow existing component patterns
- `pnpm lint && pnpm typecheck && pnpm build` pass
- New DB tables migrated, new env vars documented
