# Core Repository Rules

These rules apply to all features in this repository.

## Verification Required

After meaningful changes:

    pnpm lint && pnpm typecheck

If runtime/build affected:

    pnpm build

Work is not complete without verification.

---

## Workflow

1. Understand existing patterns.
2. Propose a short plan.
3. Implement minimal change.
4. Verify.
5. Summarize files changed + validation steps.

---

## No Long-Running Processes

Do NOT start:
- pnpm dev
- next dev
- any watch mode

Ask the user to run servers if logs are required.

---

## Code Discipline

- Do not introduce new abstractions without reason.
- Prefer modifying existing utilities.
- Keep logic explicit and readable.
- Match existing folder conventions.
