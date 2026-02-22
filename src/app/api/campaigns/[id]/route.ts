import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const repos = getRepositories();
    const data = await repos.campaigns.getSummaryById(id);

    if (!data) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("[campaigns-get]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
