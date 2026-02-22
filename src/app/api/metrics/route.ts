import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const url = new URL(req.url);
    const assetId = url.searchParams.get("assetId");

    if (!assetId) {
      return Response.json({ error: "assetId is required" }, { status: 400 });
    }

    const days = Number(url.searchParams.get("days") || "30");
    const repos = getRepositories();
    const data = await repos.metrics.getByAssetId(assetId, days);
    return Response.json(data);
  } catch (error) {
    console.error("[metrics-list]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
