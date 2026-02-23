import { getApiSessionWithOrg, unauthorizedResponse } from "@/lib/org-context";
import { getRepositories } from "@/lib/data";
import type { AutoActionStatus } from "@/lib/data/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const repos = getRepositories(session.org.orgId);
    const action = await repos.autoActions.getById(id);
    if (!action) {
      return Response.json({ error: "Action not found" }, { status: 404 });
    }
    return Response.json(action);
  } catch (error) {
    console.error("[automation-get]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSessionWithOrg();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const newStatus = body.status as AutoActionStatus;

    if (newStatus !== "approved" && newStatus !== "rejected") {
      return Response.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const repos = getRepositories(session.org.orgId);
    const action = await repos.autoActions.getById(id);
    if (!action) {
      return Response.json({ error: "Action not found" }, { status: 404 });
    }

    if (action.status !== "pending") {
      return Response.json(
        { error: "Only pending actions can be approved or rejected" },
        { status: 400 }
      );
    }

    if (newStatus === "approved") {
      // Execute side effects based on action type
      switch (action.type) {
        case "pause_fatigued":
          await repos.assets.update(action.targetId, { status: "paused" });
          break;
        case "reallocate_budget":
          await repos.alerts.create({
            orgId: session.org.orgId,
            type: "budget_pacing",
            severity: "high",
            title: `Budget reallocation approved for campaign`,
            message: action.description,
            assetId: null,
            campaignId: action.targetId,
            dismissed: false,
          });
          break;
        case "suggest_creative_rotation":
          await repos.insights.create({
            orgId: session.org.orgId,
            type: "recommendation",
            assetId: action.targetId,
            campaignId: null,
            title: "Creative rotation recommended",
            summary: action.description,
            details: `## Automated Recommendation\n\n${action.description}\n\nThis action was automatically detected and approved by the automation engine.`,
            confidence: 0.8,
            impactLevel: "medium",
            actionItems: [
              "Create new creative variants",
              "A/B test against current creative",
              "Monitor performance for 7 days",
            ],
            generatedContent: null,
          });
          break;
        case "escalate_alert": {
          const alertId = (action.metadata as Record<string, unknown>)
            ?.alertId as string | undefined;
          if (alertId) {
            const alerts = await repos.alerts.getAll();
            const alert = alerts.find((a) => a.id === alertId);
            if (alert) {
              // Dismiss the old alert and create a critical one
              await repos.alerts.dismiss(alertId);
              await repos.alerts.create({
                orgId: session.org.orgId,
                type: alert.type,
                severity: "critical",
                title: `[ESCALATED] ${alert.title}`,
                message: `${alert.message} — Escalated after ${(action.metadata as Record<string, unknown>)?.alertAge ?? "48+"}h without resolution.`,
                assetId: alert.assetId,
                campaignId: alert.campaignId,
                dismissed: false,
              });
            }
          }
          break;
        }
      }

      const updated = await repos.autoActions.updateStatus(id, "executed");
      return Response.json(updated);
    }

    // Rejected
    const updated = await repos.autoActions.updateStatus(id, "rejected");
    return Response.json(updated);
  } catch (error) {
    console.error("[automation-patch]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
