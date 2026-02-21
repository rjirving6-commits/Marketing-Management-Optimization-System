# RampRight — Phase 1: Real DB & Auth

## Overview
Phase 1 migrates from the Phase 0 mock-data architecture to a production-ready PostgreSQL database and enforced authentication. The repository pattern established in Phase 0 makes this a swap — mock implementations are replaced with Drizzle-backed repositories while all pages, API routes, and UI remain unchanged.

## Goals
- All data persisted in PostgreSQL via Drizzle ORM
- Google OAuth authentication enforced on all protected routes
- Mock data available as a seed script for development
- Zero changes to page components or API route signatures

## Database Schema

Extend `src/lib/schema.ts` with tables matching the existing TypeScript types in `src/lib/data/types.ts`:

### New Tables
- `campaigns` — id, name, platform, status, budget, spent, audience, icp, funnel_stage, offer_type, tags, start_date, end_date, created_at, updated_at
- `assets` — id, name, type, status, platform, campaign_id (FK), hook, cta, body_copy, version, thumbnail_url, source_url, tags, created_at, updated_at
- `metric_snapshots` — id, asset_id (FK), date, impressions, reach, clicks, conversions, leads, demos, spend, cpm, ctr, cpc, cpa, cpl, roas
- `insights` — id, type, asset_id (FK nullable), campaign_id (FK nullable), title, summary, details, confidence, impact_level, action_items, generated_content, created_at
- `alerts` — id, type, severity, title, message, asset_id (FK nullable), campaign_id (FK nullable), dismissed, created_at

### Existing Tables (BetterAuth)
- `user`, `session`, `account`, `verification` — already in schema, no changes needed

## Repository Swap

### Current (Phase 0)
```
getRepositories() → returns MockAssetRepository, MockCampaignRepository, etc.
```

### Phase 1
```
getRepositories() → checks NEXT_PUBLIC_USE_MOCK_DATA
  - "true" → mock repositories (dev/testing)
  - "false" → Drizzle repositories (production)
```

### New Files
- `src/lib/data/drizzle/asset-repository.ts`
- `src/lib/data/drizzle/campaign-repository.ts`
- `src/lib/data/drizzle/metric-repository.ts`
- `src/lib/data/drizzle/insight-repository.ts`
- `src/lib/data/drizzle/alert-repository.ts`

Each implements the same repository interface used by mocks. Derived metrics (fatigueScore, assetHalfLife, performanceVelocity, etc.) computed in queries or application layer.

## Authentication Enforcement

### Server-Side
- All `page.tsx` files in `(marketing)/` group validate session via `auth.api.getSession()`
- Redirect to `/` (login page) if no session
- Pass user info to client components as props

### API Routes
- All `/api/*` routes (except `/api/auth`) validate session
- Return 401 if unauthenticated
- Extract `userId` from session for data scoping

### Client-Side
- `useSession()` hook from `@/lib/auth-client` for UI state
- Show user avatar/name in nav sidebar
- Add sign-out button to profile page

## Seed Script
- `pnpm db:seed` — inserts the same data currently in `src/lib/data/mock/seed.ts` into PostgreSQL
- New file: `src/lib/data/drizzle/seed.ts`
- Useful for development and demo environments

## Migration Workflow
1. Update `src/lib/schema.ts` with new tables
2. `pnpm db:generate` — generate migration files
3. `pnpm db:migrate` — apply to database
4. Implement Drizzle repositories
5. Update `getRepositories()` factory
6. Test with `NEXT_PUBLIC_USE_MOCK_DATA=false`

## Environment Variables
No new variables. Existing `POSTGRES_URL`, Google OAuth credentials, and `NEXT_PUBLIC_USE_MOCK_DATA` flag are sufficient.

## Definition of Done
- All 5 Drizzle repositories implement existing interfaces
- Auth enforced on all protected pages and API routes
- `pnpm db:seed` populates dev database
- All pages render identically with real DB
- `pnpm lint && pnpm typecheck && pnpm build` pass
- Mock mode still works for local development
