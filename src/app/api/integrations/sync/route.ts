import { getApiSessionWithOrg, unauthorizedResponse } from "@/lib/org-context";
import { syncAll } from "@/lib/integrations/sync";

export async function POST() {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const results = await syncAll(session.org.orgId);
    return Response.json({ results });
  } catch (error) {
    console.error("[integrations-sync]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
