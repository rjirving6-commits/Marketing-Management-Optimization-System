import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const chatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(30),
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = chatRequestSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const payloadSize = JSON.stringify(parsed.data.messages).length;
    if (payloadSize > 100_000) {
      return Response.json(
        { error: "Request payload is too large" },
        { status: 413 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimit = checkRateLimit(`${session.user.id}:${ip}`, {
      limit: 30,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const result = streamText({
      model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-5-mini"),
      messages: convertToModelMessages(parsed.data.messages as UIMessage[]),
      maxOutputTokens: 1_000,
      maxRetries: 1,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat-route] request failed", error);
    return Response.json(
      { error: "Unable to process chat request right now." },
      { status: 500 }
    );
  }
}
