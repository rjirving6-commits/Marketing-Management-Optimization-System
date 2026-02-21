# Tracking Automation & Onboarding System

## Overview

An automated onboarding system that takes the existing Tracking-as-Code infrastructure and wraps it in self-serve workflows, platform integrations, and AI-assisted setup — so that vibe coders and solo builders can go from "I want to track conversions" to "events are flowing to all my ad platforms" without deep ad-tech expertise.

## Why This Matters

The vibe coding wave is producing thousands of new SaaS products, landing pages, and apps built by solo developers and small teams using AI-assisted tooling. These builders can ship products fast but hit a wall at distribution: they need to run ads, track conversions, and optimize spend — all of which currently requires separate expertise in GTM, LinkedIn Campaign Manager, Meta Business Suite, and Google Ads.

The Tracking-as-Code system (already built) solves the developer-facing half: a typed event registry, dedupe logic, multi-destination push, debug harness, and QA checklist. But the onboarding journey still has 6+ manual handoff points between developers and marketers. This spec eliminates those handoffs.

---

## Current State

### What Exists Today

```
src/lib/tracking/
  registry.ts        # Typed event registry (5 starter events)
  types.ts           # Auto-derived TypeScript types
  track.ts           # trackConversion() — single function for all tracking
  use-track.ts       # useTrack() React hook
  qa-checklist.ts    # 9-item QA checklist definitions
  index.ts           # Barrel exports

src/components/tracking/
  gtm-script.tsx     # GTM <Script> tag (reads NEXT_PUBLIC_GTM_ID)

src/app/debug/tracking/
  page.tsx           # Debug harness (dev-mode only)
  qa/page.tsx        # QA checklist page (dev-mode only)
```

### Current Onboarding Flow (Manual)

```
Marketer decides what to track
    → Developer edits registry.ts                          ← requires TypeScript knowledge
        → Developer wires trackConversion() into components ← requires knowing where in the codebase
            → User creates GTM triggers manually             ← error-prone name matching
                → User creates GTM tags manually              ← platform-specific tribal knowledge
                    → User creates conversions in each ad platform ← 3+ different dashboards
                        → Someone verifies end-to-end             ← manual checking across platforms
```

Every arrow is a handoff, a context switch, or tribal knowledge.

---

## Gap Analysis

| Gap | Description |
|-----|-------------|
| No self-serve event creation | Marketers can't add events without editing TypeScript |
| No GTM trigger sync | Users manually recreate trigger names in GTM — typos break tracking |
| No platform connection guide | Each ad platform setup is tribal knowledge |
| No UTM/attribution capture | Nothing grabs UTM params from the URL automatically |
| No page context enrichment | Events don't auto-include current URL, referrer, etc. |
| No trackable components | Every conversion point requires custom `trackConversion()` wiring |
| No production monitoring | Debug harness is dev-only — no way to verify events in prod |

---

## Feature Roadmap

### P1: Auto-Context Enrichment

**Problem:** Developers forget to pass UTM params, page URL, and referrer to `trackConversion()`.

**Solution:** `trackConversion()` automatically captures and merges context properties on every event.

**Auto-captured properties:**
- `page_url` — `window.location.href`
- `page_path` — `window.location.pathname`
- `referrer` — `document.referrer`
- `utm_source` — from URL search params
- `utm_medium` — from URL search params
- `utm_campaign` — from URL search params
- `utm_term` — from URL search params
- `utm_content` — from URL search params

**Implementation:**
- Add a `getTrackingContext()` function in `src/lib/tracking/context.ts`
- Call it inside `trackConversion()` and merge into event properties
- UTM params are captured once on page load and cached in `sessionStorage` (so navigating away from the landing page doesn't lose them)
- Explicit properties passed by the developer override auto-captured ones

**Effort:** Small
**Impact:** Eliminates a common "forgot to pass context" bug. Every event gets full attribution data.

---

### P2: Trackable Components

**Problem:** Wiring `trackConversion()` into UI components requires a developer to know where each conversion happens in the codebase.

**Solution:** Pre-built React components that handle tracking automatically.

**Components:**

#### `<TrackableButton>`
Wraps any button. Fires an event on click.

```tsx
<TrackableButton
  event="demo_requested"
  properties={{ source_page: "/pricing" }}
  className="bg-primary text-white"
>
  Request Demo
</TrackableButton>
```

#### `<TrackableForm>`
Wraps any form. Fires an event on successful submit.

```tsx
<TrackableForm
  event="form_submitted"
  properties={{ form_id: "contact-us", form_name: "Contact Us" }}
  onSubmit={handleSubmit}
>
  {/* form fields */}
</TrackableForm>
```

#### `useTrackPageView()`
Hook that fires a page view event on mount. For tracking landing page visits, thank-you page arrivals, etc.

```tsx
function ThankYouPage() {
  useTrackPageView("form_submitted", { form_id: "signup-complete" });
  return <h1>Thanks!</h1>;
}
```

**New files:**
- `src/components/tracking/trackable-button.tsx`
- `src/components/tracking/trackable-form.tsx`
- `src/lib/tracking/use-track-page-view.ts`

**Effort:** Small
**Impact:** Reduces developer wiring to a component swap. Covers 80% of conversion tracking use cases without custom code per event.

---

### P3: Self-Serve Event Creation UI

**Problem:** Adding a new event requires editing `registry.ts` — a TypeScript file that non-developers can't touch.

**Solution:** A UI for creating and managing custom events, backed by the database.

**Architecture Decision — Hybrid Registry:**
- Keep `registry.ts` as the compiled source of truth for **core events** (developer-defined, type-safe)
- Add a `custom_events` database table for **marketer-defined events** (runtime, self-serve)
- `trackConversion()` checks both the static registry and the DB-backed custom events

This gives developers compile-time type safety for core events while letting marketers add campaign-specific events without a deploy.

**Database schema:**
```sql
CREATE TABLE custom_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  source VARCHAR(20) DEFAULT 'marketing',
  properties JSONB NOT NULL DEFAULT '{}',
  gtm_trigger VARCHAR(100),
  linkedin_conversion VARCHAR(100),
  posthog_event VARCHAR(100),
  dedupe_strategy VARCHAR(20) DEFAULT 'once_per_session',
  dedupe_key VARCHAR(100),
  sample_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES "user"(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**UI at `/settings/tracking/events`:**
- List all events (both registry and custom)
- "Create Event" form: name, description, properties builder, dedupe strategy picker
- Edit/delete custom events (registry events shown as read-only)
- Auto-generates GTM trigger name, PostHog event name from event name

**New files:**
- `src/lib/schema.ts` — add `custom_events` table
- `src/app/(marketing)/settings/tracking/events/page.tsx`
- `src/components/pages/event-manager-client.tsx`
- `src/app/api/tracking/events/route.ts` — CRUD for custom events
- `src/lib/tracking/custom-events.ts` — runtime loader for DB-backed events

**Effort:** Medium
**Impact:** Marketers can self-serve event definitions. No deploy needed for campaign-specific events.

---

### P4: GTM OAuth + Auto-Sync

**Problem:** Users manually recreate trigger names in GTM — one typo breaks the entire tracking chain.

**Solution:** Connect to GTM via OAuth, read the event registry, and auto-create matching triggers and tags.

**What GTM API provides (Tag Manager API v2):**
- Create/update/delete triggers
- Create/update/delete tags
- Create/update/delete variables
- Publish container versions
- List existing configuration (for diffing)

**Flow:**
1. User clicks "Connect Google Tag Manager" on settings page
2. Google OAuth2 flow → consent screen → redirect with auth code
3. Exchange code for refresh token, store encrypted in DB
4. User selects which GTM container to manage
5. "Sync" button reads event registry + custom events, then:
   - Diffs against existing GTM triggers (don't duplicate)
   - Creates missing Custom Event triggers (e.g., `ce_signed_up`)
   - Creates tags for each connected ad platform (see P5)
   - Shows preview of changes before publishing
   - Publishes new container version

**OAuth requirements:**
- Scopes: `https://www.googleapis.com/auth/tagmanager.edit.containers`, `https://www.googleapis.com/auth/tagmanager.publish`
- User's Google account must have Edit access to the GTM container
- Requires a Google Cloud project with Tag Manager API enabled

**Environment variables:**
- `GOOGLE_GTM_CLIENT_ID` — OAuth client ID
- `GOOGLE_GTM_CLIENT_SECRET` — OAuth client secret

**Per-user stored data (encrypted in DB):**
- GTM refresh token
- Selected container ID
- Last sync timestamp

**New files:**
- `src/lib/integrations/gtm.ts` — GTM API client (triggers, tags, publish)
- `src/app/api/integrations/gtm/connect/route.ts` — OAuth initiation
- `src/app/api/integrations/gtm/callback/route.ts` — OAuth callback
- `src/app/api/integrations/gtm/sync/route.ts` — Registry → GTM sync
- `src/app/(marketing)/settings/integrations/page.tsx` — Integrations settings UI
- `src/components/pages/integrations-client.tsx`

**Database:**
```sql
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES "user"(id),
  platform VARCHAR(50) NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  platform_account_id VARCHAR(255),
  platform_container_id VARCHAR(255),
  scopes TEXT[],
  last_sync_at TIMESTAMP,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Effort:** Medium
**Impact:** Eliminates all manual GTM configuration. Registry changes auto-propagate.

---

### P5: Ad Platform OAuth Flows

**Problem:** After GTM triggers are created, users still need to manually create conversions in each ad platform dashboard and wire them to GTM tags.

**Solution:** OAuth connections to each ad platform, auto-creating conversion definitions.

#### LinkedIn

**API:** LinkedIn Marketing API — Conversions API
- Create conversion rules programmatically
- Map to `linkedInConversion` field in registry

**OAuth:**
- Scopes: `r_ads`, `rw_ads`
- User must be admin of the LinkedIn Ad Account

**Flow:**
1. "Connect LinkedIn" → OAuth flow
2. Select ad account
3. Auto-create conversion rules matching registry events
4. Return conversion IDs → auto-configure GTM LinkedIn Insight Tag

**Env vars:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

#### Meta (Facebook)

**API:** Meta Marketing API + Conversions API
- Create custom conversions
- Supports server-side events (Conversions API) — more reliable than browser-side pixel

**OAuth:**
- Permission: `ads_management`
- User must have admin access to Business Manager

**Flow:**
1. "Connect Meta" → Facebook Login OAuth flow
2. Select pixel / ad account
3. Auto-create custom conversions matching registry events
4. Optionally enable server-side Conversions API integration (bypass GTM for Meta)

**Server-side option:** For Meta specifically, the Conversions API allows sending events directly from the server. This is more reliable than browser-side pixel tracking (no ad blockers, no cookie issues). We'd add a server-side event forwarding path in `trackConversion()` that calls our API route, which forwards to Meta's CAPI.

**Env vars:** `META_APP_ID`, `META_APP_SECRET`

#### Google Ads

**API:** Google Ads API — Conversion Actions
- Create conversion actions programmatically
- Requires OAuth2 + a developer token (approved by Google)

**OAuth:**
- Scopes: `https://www.googleapis.com/auth/adwords`
- Developer token approval can take days/weeks (biggest blocker)

**Flow:**
1. "Connect Google Ads" → Google OAuth flow
2. Select customer/account
3. Auto-create conversion actions matching registry events
4. Return conversion IDs + labels → auto-configure GTM Google Ads Conversion Tracking tag

**Env vars:** `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`

**All platforms share the `platform_connections` table from P4.**

**Effort:** Large (each platform is a separate integration)
**Impact:** Eliminates manual conversion creation across all ad platforms.

---

### P6: Automated Verification Polling

**Problem:** After setup, users have to manually check each platform to confirm events are actually arriving.

**Solution:** Use platform APIs to verify event delivery after test fires.

**Verification checks:**
- **GTM:** API confirms triggers exist and match registry names
- **LinkedIn:** Marketing API checks conversion counts > 0 after test
- **Meta:** Marketing API checks event delivery status via Events Manager diagnostics
- **Google Ads:** API checks conversion action status and recent conversion count

**Flow:**
1. User fires a test event from the debug harness
2. System waits 30-60 seconds (platform processing delay)
3. Polls each connected platform's API for the test event
4. Updates the QA checklist automatically:
   - Spec written ← auto-checked when event exists in registry/custom events
   - dataLayer verified ← auto-checked from debug harness fire
   - GTM trigger created ← auto-checked via GTM API
   - GTM tag fires ← auto-checked via GTM API
   - LinkedIn conversion created ← auto-checked via LinkedIn API
   - PostHog received ← auto-checked if PostHog integration active

**UI enhancement:**
The Connection Status tab in the debug harness expands from "is the JS loaded?" to "are events actually reaching each platform?" with per-platform delivery status.

**New files:**
- `src/lib/tracking/verification.ts` — platform verification logic
- `src/app/api/tracking/verify/route.ts` — verification polling endpoint

**Effort:** Medium
**Impact:** Closes the "is it actually working?" loop. Users get confirmation without switching tabs.

---

### P7: AI Agent Orchestration Layer

**Problem:** Even with all the above automation, users still need to know which steps to take and in what order.

**Solution:** An AI agent that walks users through the entire tracking setup conversationally.

**Agent capabilities:**
- Reads the event registry and custom events
- Knows which platforms are connected (via `platform_connections`)
- Can trigger GTM sync, platform conversion creation, and verification
- Guides users through OAuth flows when platforms aren't connected
- Diagnoses issues when events aren't arriving ("Your GTM container has the trigger but no tag — let me create one")
- Generates `<TrackableButton>` snippets for the developer to paste

**Example conversation:**
```
User: "I want to track demo requests from our pricing page"

Agent: I'll set that up. Here's what I'll do:
  1. ✅ Event "demo_requested" already exists in your registry
  2. ✅ GTM is connected — I'll create the trigger
  3. ⚠️ LinkedIn isn't connected yet — want to connect now?
  4. Here's a component snippet for your pricing page CTA:
     <TrackableButton event="demo_requested" properties={{ source_page: "/pricing" }}>
       Request Demo
     </TrackableButton>
```

**Integration with existing chat:**
This agent uses the existing `src/app/api/chat/route.ts` endpoint with a tracking-specific system prompt and tool definitions. Tools include:
- `listEvents()` — read registry + custom events
- `createEvent()` — add to custom events table
- `syncGTM()` — trigger GTM sync
- `createConversion(platform)` — create conversion in connected platform
- `verifyEvent(eventName)` — run verification polling
- `getConnectionStatus()` — check which platforms are connected

**Effort:** Large
**Impact:** Ties everything together. The "one prompt to full tracking" experience.

---

## Platform Permissions Summary

| Platform | OAuth Scopes | Who Grants | Stored Per |
|----------|-------------|------------|------------|
| Google (GTM) | `tagmanager.edit.containers`, `tagmanager.publish` | GTM container admin | User |
| Google Ads | `adwords` | Google Ads account admin + approved dev token | User |
| LinkedIn | `r_ads`, `rw_ads` | LinkedIn Campaign Manager admin | User |
| Meta | `ads_management` | Facebook Business Manager admin | User |

Each is a one-time OAuth flow per user/org. Tokens stored encrypted in the `platform_connections` table.

---

## Architecture Decisions

### Hybrid Event Registry
- **Static registry** (`registry.ts`): Core events, compile-time type safety, `as const` literals, developer-controlled
- **Dynamic registry** (`custom_events` table): Campaign-specific events, runtime-loaded, marketer-controlled
- `trackConversion()` checks both sources. Static registry takes precedence on name conflicts.

### Server-Side Event Forwarding
For platforms that support it (Meta Conversions API, potentially Google Ads enhanced conversions):
- `trackConversion()` optionally calls a server-side endpoint
- Server endpoint forwards to platform APIs directly
- Bypasses ad blockers and cookie restrictions
- More reliable than browser-only tracking

### Token Storage
- All OAuth tokens encrypted at rest using application-level encryption
- Refresh tokens used to obtain short-lived access tokens
- Token refresh handled transparently by integration clients
- Revocation supported per platform via settings UI

---

## Ideal End-to-End User Journey

### Before (Today)
```
1. Marketer describes conversions to developer            ~30 min discussion
2. Developer edits registry.ts                            ~15 min
3. Developer wires trackConversion() into components      ~30 min–2 hr
4. Developer deploys                                      ~10 min
5. Marketer creates GTM triggers                          ~20 min per event
6. Marketer creates GTM tags                              ~30 min per platform
7. Marketer creates conversions in each ad platform       ~20 min per platform
8. Someone tests everything                               ~1 hr
9. Marketer checks ad platforms for data arrival          ~next day
Total: 4–8 hours spread across 2+ people over 2+ days
```

### After (With This System)
```
1. User opens event manager or tells AI agent what to track  ~2 min
2. System creates event (registry or custom)                 ~instant
3. System provides TrackableButton/TrackableForm snippet     ~instant
4. Developer pastes component (or user uses URL trigger)     ~2 min
5. System syncs to GTM automatically                         ~instant
6. System creates conversions in connected ad platforms      ~instant
7. User fires test event from debug harness                  ~1 min
8. System verifies delivery across all platforms             ~2 min
Total: <10 minutes, 1 person, 1 session
```

---

## New Environment Variables

| Variable | Purpose |
|----------|---------|
| `GOOGLE_GTM_CLIENT_ID` | GTM OAuth client ID |
| `GOOGLE_GTM_CLIENT_SECRET` | GTM OAuth client secret |
| `GOOGLE_ADS_CLIENT_ID` | Google Ads OAuth client ID |
| `GOOGLE_ADS_CLIENT_SECRET` | Google Ads OAuth client secret |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads API developer token |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth client secret |
| `META_APP_ID` | Meta/Facebook OAuth app ID |
| `META_APP_SECRET` | Meta/Facebook OAuth app secret |
| `ENCRYPTION_KEY` | Token encryption key for platform_connections |

---

## New Database Tables

| Table | Purpose |
|-------|---------|
| `custom_events` | Marketer-defined tracking events (self-serve) |
| `platform_connections` | OAuth tokens and platform config per user/org |

---

## Implementation Order

| Priority | Feature | Dependencies | Effort |
|----------|---------|--------------|--------|
| P1 | Auto-context enrichment | None | Small |
| P2 | Trackable components | P1 | Small |
| P3 | Self-serve event creation UI | Phase 1 DB | Medium |
| P4 | GTM OAuth + auto-sync | P3, Google Cloud project | Medium |
| P5 | Ad platform OAuth flows | P4 | Large |
| P6 | Automated verification polling | P4, P5 | Medium |
| P7 | AI agent orchestration | P3–P6 | Large |

P1 and P2 can be built immediately with no external dependencies. P3 requires the database (Phase 1). P4–P7 require OAuth app registrations with each platform.

---

## Relationship to Existing Specs

- **tracking-as-code-plan.md** — The foundation this builds on. All P1–P7 features extend the existing registry, `trackConversion()`, and debug harness.
- **phase-1-plan.md** — P3 (custom events table) requires the real DB from Phase 1.
- **phase-3-plan.md** — Platform integrations (P5) share patterns with Phase 3's real-time data sync. The `platform_connections` table serves both tracking automation and metric ingestion.
