# Authentication – BetterAuth

## Server Usage

Import from:

    @/lib/auth

Session example:

    const session = await auth.api.getSession(...)

## Client Usage

Import hooks from:

    @/lib/auth-client

## Rules

- Protected routes must validate session server-side.
- Do not replace auth provider without explicit instruction.
- Reuse existing auth components.
- Avoid duplicating session-fetch logic.

## Sensitive Areas

- Never expose tokens.
- Do not log auth responses.
