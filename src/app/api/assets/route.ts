import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";
import type { AssetFilters } from "@/lib/data/types";

export async function GET(req: Request) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const repos = getRepositories();
    const url = new URL(req.url);

    const filters: AssetFilters = {};
    const platform = url.searchParams.get("platform");
    const funnelStage = url.searchParams.get("funnelStage");
    const assetType = url.searchParams.get("assetType");
    const status = url.searchParams.get("status");
    const campaignId = url.searchParams.get("campaignId");
    const search = url.searchParams.get("search");
    const sortBy = url.searchParams.get("sortBy");
    const sortOrder = url.searchParams.get("sortOrder");

    if (platform) filters.platform = platform as AssetFilters["platform"];
    if (funnelStage) filters.funnelStage = funnelStage as AssetFilters["funnelStage"];
    if (assetType) filters.assetType = assetType as AssetFilters["assetType"];
    if (status) filters.status = status as AssetFilters["status"];
    if (campaignId) filters.campaignId = campaignId;
    if (search) filters.search = search;
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder as AssetFilters["sortOrder"];

    const data = await repos.assets.getWithMetrics(filters);
    return Response.json(data);
  } catch (error) {
    console.error("[assets-list]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const repos = getRepositories();
    const body = await req.json();
    const asset = await repos.assets.create(body);
    return Response.json(asset, { status: 201 });
  } catch (error) {
    console.error("[assets-create]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
