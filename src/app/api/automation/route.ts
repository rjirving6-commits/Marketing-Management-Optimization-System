import { getApiSessionWithOrg, unauthorizedResponse } from "@/lib/org-context";
import { getRepositories } from "@/lib/data";
import { evaluateRules } from "@/lib/automation/engine";
import type { AutoActionStatus } from "@/lib/data/types";

export async function GET(request: Request) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as AutoActionStatus | null;

    const repos = getRepositories(session.org.orgId);
    const actions = await repos.autoActions.getAll(
      status ? { status } : undefined
    );
    return Response.json(actions);
  } catch (error) {
    console.error("[automation-list]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const actions = await evaluateRules(session.org.orgId);
    return Response.json({ created: actions.length, actions });
  } catch (error) {
    console.error("[automation-run]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
