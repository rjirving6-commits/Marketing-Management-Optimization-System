import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";
import type { InsightType } from "@/lib/data/types";

export async function GET(req: Request) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const url = new URL(req.url);
    const assetId = url.searchParams.get("assetId") || undefined;
    const campaignId = url.searchParams.get("campaignId") || undefined;
    const type = (url.searchParams.get("type") as InsightType) || undefined;

    const repos = getRepositories();
    const data = await repos.insights.getAll({ assetId, campaignId, type });
    return Response.json(data);
  } catch (error) {
    console.error("[insights-list]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
