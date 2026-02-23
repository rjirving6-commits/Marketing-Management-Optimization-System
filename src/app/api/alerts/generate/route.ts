import { getApiSessionWithOrg, unauthorizedResponse } from "@/lib/org-context";
import { generateAlerts } from "@/lib/alerts/generate";

export async function POST() {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const alerts = await generateAlerts(session.org.orgId);
    return Response.json({ created: alerts.length, alerts });
  } catch (error) {
    console.error("[alerts-generate]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
