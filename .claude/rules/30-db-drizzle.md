# Database – PostgreSQL + Drizzle

## Schema Changes

1. Update src/lib/schema.ts
2. Run:
       pnpm db:generate
       pnpm db:migrate
3. Ensure migration files are included

## Rules

- PostgreSQL only.
- Do not introduce alternative database engines.
- Do not drop tables without explicit instruction.
- Preserve backward compatibility unless instructed otherwise.

## Querying

- Use typed Drizzle queries.
- Avoid raw SQL unless necessary.
- Keep DB logic inside lib/ not inside UI.
