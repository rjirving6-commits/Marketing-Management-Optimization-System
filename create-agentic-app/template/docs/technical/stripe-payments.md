# Stripe Payments Integration

Guide for integrating Stripe payments in a Next.js 15 application with Better Auth.

## Architecture Overview

Stripe runs **alongside** Better Auth as a standalone payment service — it is not a Better Auth plugin. The integration consists of:

- **Server-side**: `stripe` npm package for API calls (checkout sessions, subscriptions, customer management)
- **Client-side**: `@stripe/stripe-js` for redirecting to Stripe Checkout
- **Webhooks**: Standalone Next.js API route at `/api/webhooks/stripe`
- **Database**: Store Stripe customer IDs and subscription state linked to Better Auth users

## Installation

```bash
pnpm add stripe @stripe/stripe-js
```

## Environment Variables

Add these to your `.env` file:

```env
# Stripe payment processing
# Get these from: https://dashboard.stripe.com/test/apikeys (test) or https://dashboard.stripe.com/apikeys (production)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

- `STRIPE_SECRET_KEY` — Server-side only. Never expose to the client.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Safe for client-side use (prefixed with `NEXT_PUBLIC_`).
- `STRIPE_WEBHOOK_SECRET` — Server-side only. Used to verify webhook signatures.

## Server-Side Stripe Client

Create a shared Stripe instance for server-side use:

```typescript
// src/lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", // pin to a specific version
  typescript: true,
});
```

> **Important**: Pin the `apiVersion` to avoid unexpected breaking changes. Check Stripe's changelog for the latest stable version.

## Webhook Handler

Webhooks are critical for handling asynchronous payment events. The handler **must** verify signatures using the raw request body.

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text(); // raw body — required for signature verification
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Fulfill the order — update database, grant access, send email
      // Use session.customer, session.subscription, session.metadata
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      // Update subscription status in your database
      // subscription.status: 'active', 'past_due', 'canceled', etc.
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Revoke access — mark subscription as canceled in database
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // Notify user of failed payment
      // Consider sending an email or in-app notification
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // Record successful payment
      break;
    }

    default:
      // Unhandled event type — log for debugging
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return 200 quickly to acknowledge receipt
  return new Response("OK", { status: 200 });
}
```

### Stripe Dashboard Webhook Configuration

1. Go to **Stripe Dashboard > Developers > Webhooks**
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Checkout Sessions

Use Stripe Checkout for PCI-compliant payment collection. This redirects users to Stripe's hosted payment page.

### One-Time Payments

```typescript
// src/app/api/checkout/route.ts
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { priceId } = await req.json();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: session.user.email,
    metadata: {
      userId: session.user.id, // link to Better Auth user
    },
  });

  return Response.json({ sessionId: checkoutSession.id });
}
```

### Subscriptions

```typescript
const checkoutSession = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  customer_email: session.user.email,
  metadata: {
    userId: session.user.id,
  },
});
```

### Client-Side Redirect

```typescript
"use client";

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

async function handleCheckout(priceId: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  const { sessionId } = await res.json();
  const stripe = await stripePromise;
  await stripe?.redirectToCheckout({ sessionId });
}
```

## Customer Portal

Stripe's Customer Portal lets users manage their subscriptions, update payment methods, and view invoices.

### Creating a Portal Session

```typescript
// src/app/api/portal/route.ts
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Look up the Stripe customer ID from your database
  const stripeCustomerId = await getStripeCustomerId(session.user.id);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return Response.json({ url: portalSession.url });
}
```

### Portal Configuration

Configure the Customer Portal in the Stripe Dashboard:
1. Go to **Settings > Billing > Customer portal**
2. Enable features: update payment method, cancel subscription, view invoices
3. Customize branding and return URL

## Customer Creation on Signup

Link Stripe customers to Better Auth users by creating a Stripe customer when a user signs up.

### Approach: Webhook or On-Demand

**Option A — Create on first checkout** (simpler):
```typescript
// In your checkout route, check if user has a Stripe customer
let stripeCustomerId = await getStripeCustomerId(userId);

if (!stripeCustomerId) {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  stripeCustomerId = customer.id;
  await saveStripeCustomerId(userId, stripeCustomerId);
}

// Use stripeCustomerId in checkout session
const checkoutSession = await stripe.checkout.sessions.create({
  customer: stripeCustomerId,
  // ...
});
```

**Option B — Create on signup** (proactive):
Add a `stripeCustomerId` column to your users table and create the customer during registration.

### Database Schema Addition

```typescript
// In src/lib/schema.ts — add to user table or create a separate table
// Example: add stripeCustomerId to user table
export const user = pgTable("user", {
  // ... existing fields
  stripeCustomerId: text("stripe_customer_id"),
});
```

After schema changes, run:
```bash
pnpm run db:generate && pnpm run db:migrate
```

## Subscription Management

### Retrieve a Subscription

```typescript
const subscription = await stripe.subscriptions.retrieve(subscriptionId);
// subscription.status: 'active', 'past_due', 'canceled', 'trialing', etc.
```

### Cancel a Subscription

```typescript
// Cancel at period end (recommended — user keeps access until billing period ends)
await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true,
});

// Cancel immediately
await stripe.subscriptions.cancel(subscriptionId);
```

### Update a Subscription (change plan)

```typescript
const subscription = await stripe.subscriptions.retrieve(subscriptionId);

await stripe.subscriptions.update(subscriptionId, {
  items: [
    {
      id: subscription.items.data[0].id,
      price: newPriceId,
    },
  ],
  proration_behavior: "create_prorations",
});
```

### Check Subscription Status

```typescript
// Helper to check if user has an active subscription
async function hasActiveSubscription(stripeCustomerId: string): Promise<boolean> {
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 1,
  });

  return subscriptions.data.length > 0;
}
```

## Usage-Based Billing

For metered or usage-based pricing:

### Report Usage

```typescript
await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
  quantity: usageAmount,
  timestamp: Math.floor(Date.now() / 1000),
  action: "increment", // or 'set' to replace
});
```

### Retrieve Usage

```typescript
const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
  subscriptionItemId,
  { limit: 10 }
);
```

## Testing

### Test Mode Keys

Always use test keys during development:
- Secret key: `sk_test_...`
- Publishable key: `pk_test_...`

### Stripe CLI for Local Webhooks

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will output a webhook signing secret (whsec_...) — use this as STRIPE_WEBHOOK_SECRET
```

### Test Card Numbers

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 0341` | Attach fails |

Use any future expiry date, any 3-digit CVC, and any postal code.

### Test Clocks

Use Stripe test clocks to simulate subscription lifecycle events (renewals, trials ending, etc.) without waiting in real time:

```bash
# Create a test clock in the Stripe Dashboard under Developers > Test Clocks
# Advance time to trigger subscription events
```

## Best Practices

1. **Always verify webhook signatures** — Never process unverified webhook events
2. **Handle events idempotently** — Store processed event IDs to prevent duplicate processing
3. **Use Stripe Checkout** for payment collection — Maximum PCI compliance (SAQ A), minimal liability
4. **Pin the Stripe API version** — Avoid unexpected breaking changes from API updates
5. **Never expose `STRIPE_SECRET_KEY`** to the client — Only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is safe
6. **Use metadata** to link Stripe objects to your database records (userId, orderId, etc.)
7. **Implement proper error handling** for all Stripe API calls with specific error type checking
8. **Return 200 from webhooks quickly** — Process heavy work asynchronously if needed
9. **Use `cancel_at_period_end`** instead of immediate cancellation for better user experience
10. **Test thoroughly** with Stripe CLI, test cards, and test clocks before going to production
