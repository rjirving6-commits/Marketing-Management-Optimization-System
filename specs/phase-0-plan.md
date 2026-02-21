# RampRight Marketing Execution Nervous System — Phase 0 MVP

## Overview
Phase 0 builds the entire core UX and AI logic using mock/in-memory data, no auth or database required.
Mock-first architecture with repository pattern allows swapping to Drizzle/Postgres in Phase 1.

## Architecture
- Repository interfaces with mock implementations
- In-memory store with realistic seed data
- Dev mode bypasses auth and uses mock data
- All data access through repository factory

## Data Model
See `src/lib/data/types.ts` for complete TypeScript types.

## Pages
- `/` — Dashboard with KPI summary, alerts, top/bottom performers
- `/assets` — Filterable asset table/grid with sparklines
- `/assets/[id]` — Asset detail with tabs (Overview, Performance, Insights, Versions)
- `/assets/new` — Asset creation form
- `/campaigns` — Campaign cards with metrics
- `/metrics` — Cross-asset metric comparison
- `/insights` — AI insight feed
- `/chat` — Marketing-context chat

## API Routes
- `/api/assets` — CRUD
- `/api/campaigns` — Read
- `/api/metrics` — Time series + summary
- `/api/insights` — List + generate

## Future Phases
- Phase 1: Real DB & Auth
- Phase 2: Alert Engine, Pattern Library, Executive View
- Phase 3: Multi-Tenant, ML, Auto-Optimization
