import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const repos = getRepositories();
    await repos.alerts.dismiss(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("[alerts-dismiss]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
