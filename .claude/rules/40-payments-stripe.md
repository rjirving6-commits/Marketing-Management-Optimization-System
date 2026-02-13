# Payments – Stripe (Optional Module)

This module governs Stripe integration if enabled in the project.

## General Rules

- Never expose Stripe secret keys.
- Webhooks must verify signature.
- Keep billing logic server-side only.
- Do not trust client-provided payment state.

## Implementation

- Use official Stripe SDK.
- Store Stripe IDs (customer, subscription) in DB.
- Keep billing status canonical in database.

## When Modifying Billing

- Ensure idempotency.
- Preserve existing subscriptions.
- Do not break webhook handlers.
