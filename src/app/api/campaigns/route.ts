import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET() {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const repos = getRepositories();
    const data = await repos.campaigns.getSummaries();
    return Response.json(data);
  } catch (error) {
    console.error("[campaigns-list]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
