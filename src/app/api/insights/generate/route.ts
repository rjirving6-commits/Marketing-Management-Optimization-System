import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";

const insightSchema = z.object({
  title: z.string(),
  summary: z.string(),
  details: z.string(),
  type: z.enum(["diagnosis", "recommendation", "generation", "explanation"]),
  confidence: z.number().min(0).max(1),
  impactLevel: z.enum(["low", "medium", "high"]),
  actionItems: z.array(z.string()),
  generatedContent: z.nullable(z.string()),
});

export async function POST(req: Request) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const { assetId, campaignId } = body as {
      assetId?: string;
      campaignId?: string;
    };

    if (!assetId && !campaignId) {
      return Response.json(
        { error: "assetId or campaignId is required" },
        { status: 400 }
      );
    }

    const repos = getRepositories();

    let contextData = "";

    if (assetId) {
      const assetWithMetrics = await repos.assets.getWithMetricsById(assetId);
      if (!assetWithMetrics) {
        return Response.json({ error: "Asset not found" }, { status: 404 });
      }
      contextData = JSON.stringify(assetWithMetrics, null, 2);
    }

    if (campaignId) {
      const campaignSummary =
        await repos.campaigns.getSummaryById(campaignId);
      if (!campaignSummary) {
        return Response.json({ error: "Campaign not found" }, { status: 404 });
      }
      contextData += "\n" + JSON.stringify(campaignSummary, null, 2);
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const { object } = await generateObject({
      model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini"),
      schema: insightSchema,
      system: `You are RampRight's AI Marketing Analyst. Analyze the following marketing asset/campaign data and provide actionable insights.

Consider: CTR trends (declining = fatigue), CPL relative to benchmarks, audience-funnel alignment, creative theme effectiveness, frequency saturation.

Provide specific, actionable recommendations with expected impact.`,
      prompt: contextData,
    });

    const insight = await repos.insights.create({
      ...object,
      assetId: assetId || null,
      campaignId: campaignId || null,
    });

    return Response.json(insight, { status: 201 });
  } catch (error) {
    console.error("[insights-generate]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
