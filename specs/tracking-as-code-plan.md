# Tracking-as-Code + Debug Harness

## Overview
A code-driven conversion tracking system that replaces tribal knowledge with a typed event registry, a single wrapper function, a debug harness page, and a reusable QA checklist. Zero analytics packages required — interfaces are prepared for GTM and PostHog at runtime.

## Architecture

```
src/lib/tracking/
  registry.ts        # Single source of truth: all events, their properties, GTM/PostHog names, dedupe rules
  types.ts           # Auto-derived TypeScript types from the registry
  track.ts           # trackConversion() — the one function everything uses
  use-track.ts       # useTrack() React hook for components
  qa-checklist.ts    # QA checklist item definitions
  index.ts           # Barrel exports

src/components/tracking/
  gtm-script.tsx     # GTM <Script> tag component (reads NEXT_PUBLIC_GTM_ID)

src/app/debug/tracking/
  page.tsx           # Debug harness (dev-mode only)
  qa/page.tsx        # QA checklist page (dev-mode only)

src/components/pages/
  tracking-debug-client.tsx   # Debug harness UI
  tracking-qa-client.tsx      # QA checklist UI
```

## Key Decisions
- Event registry is a `.ts` file (not JSON) — compile-time type safety, `as const` literal types
- PostHog: interface prepared but package NOT installed — `trackConversion()` checks for `window.posthog` at runtime
- GTM: manual `<Script>` tag via `NEXT_PUBLIC_GTM_ID` env var, no new dependencies
- Debug pages gated by `isDevMode()`, hidden in production
- Zero new npm packages — uses `crypto.randomUUID`, `CustomEvent`, `sessionStorage`/`localStorage`

## Event Registry
5 generic starter events for any SaaS marketing campaign:
- `signed_up` — user completes signup (props: plan, source)
- `demo_requested` — user requests a demo (props: source_page, utm_campaign)
- `form_submitted` — user submits a lead gen form (props: form_id, form_name)
- `content_downloaded` — user downloads gated content (props: content_id, content_type)
- `trial_started` — user begins a free trial (props: plan, billing_cycle)

Each event defines: name, description, source, required properties with types, GTM trigger name, LinkedIn conversion name, PostHog event name, dedupe rule, sample data, QA status.

## trackConversion() Flow
1. Validates event exists in registry
2. Validates required properties are present
3. Applies dedupe rules (sessionStorage for once-per-session, localStorage for once-per-key)
4. Generates `event_id` via `crypto.randomUUID()`
5. Pushes to `window.dataLayer` with GTM trigger name
6. Calls `window.posthog?.capture()` if available
7. Logs to console in non-production
8. Dispatches `CustomEvent("tracking:event")` for debug harness

## Debug Harness (`/debug/tracking`)
Three-tab layout:
- **Fire Events** — Card per event with sample data preview and Fire button
- **Event Log** — Live scrolling table of all fired events with properties, GTM/PostHog status
- **Connection Status** — GTM connected badge, PostHog connected badge, dataLayer length

## QA Checklist (`/debug/tracking/qa`)
9 checklist items per event:
1. Spec written
2. dataLayer verified
3. Fires once (dedupe)
4. PostHog received
5. GTM trigger created
6. GTM tag fires
7. LinkedIn conversion created
8. Click path validated
9. Post-launch review

State persisted in localStorage. Export as Markdown button copies to clipboard.

## Files Modified
| File | Change |
|------|--------|
| `src/app/layout.tsx` | Added `<GtmScript />` import + render |
| `src/components/marketing/nav-sidebar.tsx` | Added conditional "Tracking Debug" nav link |
| `env.example` | Added `NEXT_PUBLIC_GTM_ID` |

## Environment Variables
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager container ID (optional)
- `NEXT_PUBLIC_DEV_MODE` — Controls debug page visibility (existing)

## Dependencies
Zero new npm packages. Uses: `crypto.randomUUID()`, `window.dataLayer`, `window.posthog` (optional runtime), `sessionStorage`/`localStorage`, `CustomEvent`, `next/script`, existing shadcn components.

## Future Enhancements
- Add domain-specific events by copying existing patterns in `registry.ts`
- Install PostHog JS SDK when ready — `trackConversion()` will detect it automatically
- Add server-side tracking via API route for critical conversions
