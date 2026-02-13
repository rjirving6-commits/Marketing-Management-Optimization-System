# Deployment – Vercel

## Rules

- Do not modify production environment variables directly.
- Any new required env var must be documented in env.example.
- Avoid build-time assumptions about local-only values.

## Build Discipline

- Ensure pnpm build passes before considering deployment ready.
- Avoid using Node APIs unsupported in edge runtime unless configured.
