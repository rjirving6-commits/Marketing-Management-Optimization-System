import { getRepositories } from "@/lib/data";
import type { AutoAction, AutoActionType, AutoActionTargetType } from "@/lib/data/types";

interface PendingAction {
  type: AutoActionType;
  targetType: AutoActionTargetType;
  targetId: string;
  description: string;
  triggeredBy: string;
  metadata: Record<string, unknown> | null;
  autoExecute: boolean;
}

export async function evaluateRules(orgId: string): Promise<AutoAction[]> {
  const repos = getRepositories(orgId);
  const assetsWithMetrics = await repos.assets.getWithMetrics();
  const campaigns = await repos.campaigns.getAll();
  const existingAlerts = await repos.alerts.getAll();
  const existingActions = await repos.autoActions.getAll();

  const pendingActions: PendingAction[] = [];

  // ── Rule 1 & 2: Pause fatigued assets ──
  for (const awm of assetsWithMetrics) {
    const { asset, derivedMetrics } = awm;
    if (!derivedMetrics || asset.status === "paused" || asset.status === "archived") continue;

    if (derivedMetrics.fatigueScore > 80) {
      pendingActions.push({
        type: "pause_fatigued",
        targetType: "asset",
        targetId: asset.id,
        description: `Auto-paused "${asset.name}" due to fatigue score of ${derivedMetrics.fatigueScore}.`,
        triggeredBy: "pause_fatigued",
        metadata: { fatigueScore: derivedMetrics.fatigueScore, previousStatus: asset.status },
        autoExecute: true,
      });
    } else if (derivedMetrics.fatigueScore > 60) {
      pendingActions.push({
        type: "pause_fatigued",
        targetType: "asset",
        targetId: asset.id,
        description: `Review suggested: pause "${asset.name}" with fatigue score of ${derivedMetrics.fatigueScore}.`,
        triggeredBy: "pause_fatigued",
        metadata: { fatigueScore: derivedMetrics.fatigueScore },
        autoExecute: false,
      });
    }

    // ── Rule 4: Creative rotation ──
    if (
      derivedMetrics.trendDirection === "down" &&
      derivedMetrics.fatigueScore > 40
    ) {
      pendingActions.push({
        type: "suggest_creative_rotation",
        targetType: "asset",
        targetId: asset.id,
        description: `Suggest creative rotation for "${asset.name}": declining CTR with fatigue score ${derivedMetrics.fatigueScore}.`,
        triggeredBy: "suggest_creative_rotation",
        metadata: {
          fatigueScore: derivedMetrics.fatigueScore,
          trendDirection: derivedMetrics.trendDirection,
        },
        autoExecute: false,
      });
    }
  }

  // ── Rule 3: Budget reallocation ──
  for (const campaign of campaigns) {
    if (campaign.status !== "active" || !campaign.endDate) continue;

    const start = new Date(campaign.startDate).getTime();
    const end = new Date(campaign.endDate).getTime();
    const now = Date.now();
    const totalDuration = end - start;
    if (totalDuration <= 0) continue;

    const elapsedFraction = Math.min(1, (now - start) / totalDuration);
    const spentFraction =
      campaign.budget > 0 ? campaign.spent / campaign.budget : 0;

    if (elapsedFraction > 0 && spentFraction / elapsedFraction > 1.3) {
      const overpacePercent = Math.round(
        ((spentFraction / elapsedFraction - 1) * 100)
      );
      pendingActions.push({
        type: "reallocate_budget",
        targetType: "campaign",
        targetId: campaign.id,
        description: `Budget overpacing on "${campaign.name}": spent ${Math.round(spentFraction * 100)}% with ${Math.round(elapsedFraction * 100)}% of time elapsed (${overpacePercent}% over pace).`,
        triggeredBy: "reallocate_budget",
        metadata: {
          spentFraction: Math.round(spentFraction * 100) / 100,
          elapsedFraction: Math.round(elapsedFraction * 100) / 100,
          overpacePercent,
        },
        autoExecute: false,
      });
    }
  }

  // ── Rule 5: Alert escalation ──
  const fortyEightHoursAgo = new Date(
    Date.now() - 48 * 60 * 60 * 1000
  ).toISOString();
  const undismissedOldAlerts = existingAlerts.filter(
    (a) =>
      !a.dismissed &&
      (a.severity === "high" || a.severity === "critical") &&
      a.createdAt < fortyEightHoursAgo
  );

  for (const alert of undismissedOldAlerts) {
    const alertAgeHours = Math.round(
      (Date.now() - new Date(alert.createdAt).getTime()) / (1000 * 60 * 60)
    );
    pendingActions.push({
      type: "escalate_alert",
      targetType: alert.assetId ? "asset" : "campaign",
      targetId: alert.assetId ?? alert.campaignId ?? alert.id,
      description: `Alert "${alert.title}" has been active for over 48 hours without dismissal.`,
      triggeredBy: "escalate_alert",
      metadata: { alertId: alert.id, alertAge: alertAgeHours },
      autoExecute: false,
    });
  }

  // ── Deduplication: skip if same type + same targetId with status pending or executed in last 24h ──
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentActions = existingActions.filter(
    (a) =>
      (a.status === "pending" || a.status === "executed") &&
      a.createdAt >= oneDayAgo
  );

  const deduplicated = pendingActions.filter((pending) => {
    return !recentActions.some(
      (existing) =>
        existing.type === pending.type && existing.targetId === pending.targetId
    );
  });

  // ── Create actions ──
  const created: AutoAction[] = [];
  for (const action of deduplicated) {
    if (action.autoExecute) {
      // Auto-execute: pause the asset immediately
      await repos.assets.update(action.targetId, { status: "paused" });
      const newAction = await repos.autoActions.create({
        orgId,
        type: action.type,
        targetType: action.targetType,
        targetId: action.targetId,
        description: action.description,
        status: "executed",
        triggeredBy: action.triggeredBy,
        metadata: action.metadata,
        executedAt: new Date().toISOString(),
      });
      created.push(newAction);
    } else {
      const newAction = await repos.autoActions.create({
        orgId,
        type: action.type,
        targetType: action.targetType,
        targetId: action.targetId,
        description: action.description,
        status: "pending",
        triggeredBy: action.triggeredBy,
        metadata: action.metadata,
        executedAt: null,
      });
      created.push(newAction);
    }
  }

  return created;
}
