# CLAUDE.md
## AI Application Boilerplate – Operator Guide

This document defines how AI assistants (Claude Code) must operate inside this repository.

It is intentionally opinionated.
Follow it strictly.

---

# 1. Project Overview

This repository is a Next.js App Router boilerplate for building AI-powered applications with:

- Authentication
- PostgreSQL + Drizzle ORM
- Modern UI (shadcn + Tailwind)
- AI integration via OpenRouter
- Server + API route architecture

Exact package versions are defined in `package.json`.

---

# 2. Core Architecture

## Stack

- Framework: Next.js (App Router) + React + TypeScript
- Database: PostgreSQL
- ORM: Drizzle
- Auth: BetterAuth (Google OAuth)
- AI: Vercel AI SDK + OpenRouter
- UI: shadcn/ui + Tailwind CSS
- Theme: next-themes (dark mode enabled)
- Package Manager: pnpm

Use `pnpm` for all commands.

---

# 3. How to Operate in This Repo

Claude must follow this workflow unless explicitly instructed otherwise.

## Step 1 — Understand
- Read relevant existing files.
- Match patterns already in use.
- Do not introduce new architectural styles without reason.

## Step 2 — Plan
- Provide a short plan (3–7 steps) before large changes.
- Ask clarifying questions only if blocked.

## Step 3 — Implement
- Make small, deliberate changes.
- Prefer modifying existing utilities over creating new ones.
- Maintain consistency with existing patterns.

## Step 4 — Verify (MANDATORY)

After meaningful changes, run:

    pnpm lint && pnpm typecheck

If changes affect runtime or build behavior, also run:

    pnpm build

Do not consider work complete without verification.

## Step 5 — Summarize
Provide:
- Files changed
- What was added or modified
- How it was verified
- Any follow-up recommendations

---

# 4. Hard Rules

## 4.1 No Long-Running Processes

Do NOT start:
- pnpm dev
- next dev
- Any watch process

If runtime logs are needed, ask the user to run the command and paste output.

---

## 4.2 AI Provider Discipline

This project uses:

- OpenRouter via Vercel AI SDK
- Package: @openrouter/ai-sdk-provider

Never implement direct OpenAI calls unless explicitly requested.

Model selection is configured via:

    OPENROUTER_MODEL

Do not hardcode models unless instructed.

---

## 4.3 Secrets & Environment Variables

- Never print or expose secrets.
- Never commit secrets.
- Do not read `.env*` files unless explicitly asked.
- Any new environment variable must be added to `env.example`.

---

## 4.4 Database Discipline

When modifying schema:

1. Update `src/lib/schema.ts`
2. Run:
       pnpm db:generate
       pnpm db:migrate
3. Ensure migrations are included
4. Do not break existing tables without explicit instruction

PostgreSQL only.
Do not introduce SQLite or other engines.

---

## 4.5 Authentication

- Server: import from `@/lib/auth`
- Client hooks: `@/lib/auth-client`
- Protected pages must validate session server-side
- Reuse existing auth components

Do not replace auth provider without instruction.

---

## 4.6 UI & Styling

- Use existing shadcn/ui components first
- Use Tailwind utility classes
- Use design tokens: `bg-background`, `text-foreground`, etc.
- Support dark mode
- Avoid introducing arbitrary custom colors

---

## 4.7 API Routes

- Use App Router `route.ts` handlers
- Return `Response` objects
- Handle errors gracefully
- Keep route logic minimal; extract reusable logic to `lib/`

---

# 5. Definition of Done (DoD)

Work is complete only when:

- pnpm lint passes
- pnpm typecheck passes
- pnpm build passes (if relevant)
- New env vars are documented
- Migrations generated (if schema changed)
- Summary provided

---

# 6. Project Structure (High-Level)

    src/
      app/
        api/
        (routes)/
      components/
      lib/
      docs/

Conventions:

- app/api/**/route.ts → API endpoints
- app/[route]/page.tsx → Pages
- lib/ → singletons + shared logic
- components/ui/ → base UI components
- docs/ → technical documentation

Follow existing patterns before adding new structure.

---

# 7. AI Integration Notes

AI endpoint:

    src/app/api/chat/route.ts

When modifying AI behavior:

- Respect streaming patterns
- Maintain OpenRouter provider usage
- Do not introduce direct fetch calls to model APIs

Reference documentation:

    docs/technical/ai/

---

# 8. When Creating New Features

## Adding a Page

1. Create in `src/app/[route]/page.tsx`
2. Default to Server Components
3. Add to navigation if appropriate

## Adding an API Route

1. Create `route.ts`
2. Export HTTP methods
3. Validate input
4. Return proper responses

## Adding DB Models

1. Update schema
2. Generate migration
3. Apply migration
4. Use typed queries

---

# 9. What Not to Change Without Explicit Instruction

- Auth wiring
- Drizzle migration strategy
- Environment variable names
- App Router structure
- AI provider implementation
- Core database connection logic

These are foundational decisions.

---

# 10. Project Setup Checklist (When Cloning Template)

When spinning up a new app:

- Update app name and metadata
- Update README
- Configure environment variables
- Verify auth flow
- Verify DB connection
- Verify AI endpoint
- Remove unused docs if not applicable

---

# 11. Design Philosophy

This boilerplate prioritizes:

- Simplicity over abstraction
- Explicitness over magic
- Stability over trendiness
- Consistency across projects
- Fast iteration with strong guardrails

---

# 12. Assistant Mindset

When operating in this repo:

- Do not over-engineer.
- Do not introduce unnecessary abstractions.
- Do not change architecture casually.
- Make the smallest change that solves the problem.
- Prefer clarity over cleverness.