# AI Integration – OpenRouter

This project uses:

- Vercel AI SDK
- OpenRouter provider
- Package: @openrouter/ai-sdk-provider

## Rules

- Do NOT implement direct OpenAI API calls.
- Always use the OpenRouter provider abstraction.
- Model selection must rely on OPENROUTER_MODEL env var.
- Do not hardcode models unless explicitly instructed.

## When Modifying AI Logic

- Preserve streaming patterns.
- Keep API routes thin.
- Extract reusable logic into lib/ if needed.
- Avoid mixing AI logic directly inside UI components.

## Sensitive Areas

- Do not expose API keys.
- Do not log raw model responses in production code.
