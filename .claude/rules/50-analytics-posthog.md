# Analytics – PostHog (Optional Module)

If analytics is enabled, follow these rules.

## Event Tracking

- Use consistent event naming.
- Do not rename events casually.
- Do not send PII unless explicitly allowed.
- Keep client + server tracking aligned.

## Discipline

- Avoid firing duplicate events.
- Avoid tracking on every render.
- Use structured properties.

## Data Integrity

Analytics should reflect truth.
Do not inflate or simulate event data.
