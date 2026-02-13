# Telemetry-as-Code Module (RampRight-style Discipline)

When this rule is present, analytics is a product surface. Telemetry must be consistent, reviewable, and treated like API design.

---

# 1) Principles

- **Events are contracts**, not "whatever we track."
- **Names are stable**. Do not rename events casually.
- **Properties are typed**. Avoid unstructured blobs.
- **Telemetry is truth**, not marketing inflation.
- **One source of truth** for event definitions.

---

# 2) Canonical Event Catalog

Maintain an event catalog file (choose one pattern and stick with it):

Preferred (simple):
- `src/lib/telemetry/events.ts` (typed constants + property schemas)

Optional (more strict):
- `telemetry/events.yaml` (schema-driven), compiled to TS

Rules:
- Every tracked event must exist in the catalog.
- UI and server must import from the same catalog.
- Never ad-hoc string literals like `"user_clicked_button"` in random files.

---

# 3) Naming Convention

Use convention and enforce it. Suggested:

### Event name
- `noun_verb` or `domain_action` in **snake_case**
- Examples:
  - `workspace_signed_up`
  - `demo_scheduled`
  - `invite_sent`
  - `seat_added`
  - `plan_upgraded`
  - `invoice_payment_failed`

### Property naming
- snake_case
- Stable, descriptive, minimal

No spaces. No punctuation. No inconsistent casing.

---

# 4) Core Event Domains (Suggested)

Include events aligned to SaaS outcomes:

## Acquisition / Activation
- `workspace_created`
- `workspace_signed_up`
- `onboarding_started`
- `onboarding_completed`

## Engagement
- `feature_used`
- `workflow_completed`
- `report_viewed`

## Revenue
- `checkout_started`
- `checkout_completed`
- `plan_upgraded`
- `payment_failed`

## Org / Seats
- `member_invited`
- `member_activated`
- `member_removed`
- `seat_limit_reached`

---

# 5) Property Standards

## Required baseline properties
Include these when available:

- `user_id` (server-side canonical)
- `org_id` (tenant boundary)
- `role` (optional)
- `plan_code` (if applicable)
- `source` / `utm_*` (acquisition, if applicable)

## Prohibited properties (default)
- raw email
- raw name
- anything sensitive/PII unless explicitly approved

Use hashed/normalized identifiers if needed.

---

# 6) Client vs Server Tracking

Rules:
- Prefer server-side tracking for revenue, auth, membership, billing.
- Client-side tracking is fine for UX/engagement, but should be deduped.

## Deduplication
If the same event can fire on both sides:
- include `event_id` (uuid) or deterministic key
- or choose one canonical origin and disable the other

---

# 7) Instrumentation Pattern

Create a single telemetry wrapper:

- `src/lib/telemetry/index.ts`
  - `track(event, props)`
  - resolves session + org context server-side where possible
  - enforces the catalog/types

UI should call a thin client wrapper that routes through the canonical tracker.

Do not scatter provider SDK calls throughout the codebase.

---

# 8) Experimentation & Metrics Discipline (Optional but Recommended)

If you run experiments:
- use stable experiment keys
- include `experiment_id`, `variant`
- ensure exposure events fire once:
  - `experiment_exposed`

---

# 9) Definition of Done Additions

When adding/modifying telemetry:
- Update the event catalog
- Confirm event names follow convention
- Confirm required props exist where relevant (org/user)
- Confirm no PII
- Confirm no duplicate firing
- Add a brief "why this matters" note (what decision it informs)
