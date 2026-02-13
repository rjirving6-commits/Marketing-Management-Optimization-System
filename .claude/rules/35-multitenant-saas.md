# Multi-Tenant SaaS Module (Orgs, Roles, Billing Tiers, Seat Management)

This repository may include multi-tenant SaaS capabilities. When this rule is present, treat tenancy, authorization, and billing as first-class concerns in every feature.

---

# 1) Tenancy Model (Canonical)

## Tenancy primitives
- **User**: a person with an identity (auth provider)
- **Org (Workspace / Account)**: the tenant boundary
- **Membership**: joins a user to an org with role + status
- **Role**: permission group within an org
- **Seat**: a billable allocation for an org member (often active membership)
- **Plan**: defines limits (seats, features, usage)
- **Subscription**: current billing state for an org

## Rules
- All tenant-scoped data must include `orgId`.
- Never infer tenant context from the client alone.
- Every request must establish an org context server-side.

---

# 2) Authorization Rules

## Authorization must be enforced server-side
- UI gating is not security.
- API routes and server actions must verify:
  - user session
  - org membership
  - required role/permission
  - org status (active/suspended)

## Recommended role set (default)
- `owner`: full control, billing + user management
- `admin`: manage settings/users (no billing if you want separation)
- `member`: standard product usage
- `viewer`: read-only (optional)

Do not expand roles/permissions unless necessary. Keep it simple.

---

# 3) Data Access Guardrails

## Query rules (Drizzle or any DB layer)
- Every query touching tenant data must include a tenancy filter:
  - `where(orgId = currentOrgId)`
- Never accept `orgId` directly from the client without validation.
- Prefer "scoped DB helpers" that require `orgId` as an explicit parameter.

## Safe pattern
- Derive `orgId` from session + membership lookup on the server
- Then pass `orgId` into db queries

---

# 4) Org Context Resolution

Every request that touches tenant data must resolve org context in one of these ways:

## Option A (preferred): explicit org selection
- User selects org; app stores current org selection (cookie, session metadata, or server-side preference)
- Server reads current org selection and validates membership

## Option B: URL-scoped org
- Routes like `/org/[orgSlug]/...`
- Server resolves slug → orgId and validates membership

## Rules
- If org is missing or invalid: redirect to org picker or return 403.
- Do not silently fall back to "first org" unless explicitly intended.

---

# 5) Membership Lifecycle

Membership should support:
- `invited`
- `active`
- `suspended` (or `removed`)

Rules:
- Only `active` members consume seats (unless plan says otherwise).
- Invitations should be time-bound and revocable.
- Removing a member should revoke access immediately.

---

# 6) Seat Management

Seats represent billing-relevant access.

## Seat consumption rules (default)
- `active` membership consumes one seat
- `invited` does not consume a seat until acceptance
- `viewer` may be free (optional), but must be explicit

## Guardrails
When adding/activating a member:
  - verify plan seat limit first (unless seats are "overage allowed")
- If over limit:
  - block and prompt upgrade, or
  - allow overage and mark billing delta (explicit)

---

# 7) Plans, Tiers, and Feature Gates

## Plan design
- Treat plan as a configuration object:
  - `maxSeats`
  - `features: { ... }`
  - `usageLimits: { ... }`

## Feature gating rules
- Feature gates must be enforced server-side.
- UI can reflect plan, but server is source of truth.
- Do not scatter plan checks; centralize them in `lib/` helpers.

---

# 8) Billing + Subscription State (if Stripe enabled)

## Canonical billing truth
- Subscription state lives server-side and/or in the database.
- Never rely on client to declare "paid" or "active."

## Webhook discipline
- Subscription changes should be driven by webhooks.
- Handlers must be idempotent.
- Seat limit changes should update plan constraints reliably.

---

# 9) Implementation Guidance (Preferred Tables)

Suggested baseline schema (names can vary):
- `orgs`
- `memberships` (userId, orgId, role, status, createdAt)
- `invitations` (email, orgId, role, token, expiresAt)
- `plans` (code, maxSeats, features json)
- `subscriptions` (orgId, provider, status, planCode, currentPeriodEnd, etc.)

Do not add complexity (teams, groups, fine-grained ACLs) unless required.

---

# 10) Definition of Done Additions

When touching tenant features, include in PR summary:
- How org context is resolved
- Which server-side authorization checks are used
- Where tenancy filtering is applied in DB queries
- Any changes to seat logic or plan limits
