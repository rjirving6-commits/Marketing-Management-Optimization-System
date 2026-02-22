import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") || "30");
    const repos = getRepositories();
    const data = await repos.metrics.getExecutiveSummary(days);
    return Response.json(data);
  } catch (error) {
    console.error("[metrics-summary]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
