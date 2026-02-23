import { getRepositories } from "@/lib/data";
import { mean, stddev, zScore } from "@/lib/ml";
import type { Alert, AlertSeverity, AlertType } from "@/lib/data/types";

interface PendingAlert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  assetId: string | null;
  campaignId: string | null;
}

export async function generateAlerts(orgId: string): Promise<Alert[]> {
  const repos = getRepositories(orgId);
  const assetsWithMetrics = await repos.assets.getWithMetrics();
  const existingAlerts = await repos.alerts.getAll();
  const campaigns = await repos.campaigns.getAll();

  const pendingAlerts: PendingAlert[] = [];

  // Collect org-wide CTR values for opportunity detection
  const orgCtrs: number[] = [];
  for (const awm of assetsWithMetrics) {
    if (awm.latestMetrics) {
      orgCtrs.push(awm.latestMetrics.ctr);
    }
  }
  const orgCtrMean = mean(orgCtrs);
  const orgCtrStddev = stddev(orgCtrs);

  for (const awm of assetsWithMetrics) {
    const { asset, derivedMetrics, metricsHistory } = awm;
    if (!derivedMetrics || metricsHistory.length < 2) continue;

    const sorted = [...metricsHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // --- Fatigue detector ---
    if (derivedMetrics.fatigueScore > 70) {
      pendingAlerts.push({
        type: "fatigue",
        severity: "high",
        title: `High fatigue on "${asset.name}"`,
        message: `Fatigue score is ${derivedMetrics.fatigueScore}/100. Consider refreshing creative or pausing.`,
        assetId: asset.id,
        campaignId: asset.campaignId,
      });
    } else if (derivedMetrics.fatigueScore > 50) {
      pendingAlerts.push({
        type: "fatigue",
        severity: "medium",
        title: `Rising fatigue on "${asset.name}"`,
        message: `Fatigue score is ${derivedMetrics.fatigueScore}/100. Monitor closely.`,
        assetId: asset.id,
        campaignId: asset.campaignId,
      });
    }

    // --- Anomaly detector ---
    const ctrSeries = sorted.map((m) => m.ctr);
    if (ctrSeries.length >= 5) {
      const recentCtr = ctrSeries[ctrSeries.length - 1];
      const z = Math.abs(zScore(recentCtr, ctrSeries));
      if (z > 2.5) {
        pendingAlerts.push({
          type: "anomaly",
          severity: "high",
          title: `CTR anomaly on "${asset.name}"`,
          message: `Latest CTR deviates ${z.toFixed(1)} standard deviations from the mean.`,
          assetId: asset.id,
          campaignId: asset.campaignId,
        });
      } else if (z > 2.0) {
        pendingAlerts.push({
          type: "anomaly",
          severity: "medium",
          title: `CTR fluctuation on "${asset.name}"`,
          message: `Latest CTR deviates ${z.toFixed(1)} standard deviations from the mean.`,
          assetId: asset.id,
          campaignId: asset.campaignId,
        });
      }
    }

    // --- Performance drop detector ---
    if (sorted.length >= 14) {
      const recent7 = sorted.slice(-7);
      const prior7 = sorted.slice(-14, -7);
      const avgRecent = mean(recent7.map((m) => m.ctr));
      const avgPrior = mean(prior7.map((m) => m.ctr));

      if (avgPrior > 0) {
        const declinePct = ((avgPrior - avgRecent) / avgPrior) * 100;
        if (declinePct > 20) {
          pendingAlerts.push({
            type: "performance_drop",
            severity: "high",
            title: `CTR dropped ${Math.round(declinePct)}% on "${asset.name}"`,
            message: `7-day avg CTR fell from ${avgPrior.toFixed(2)}% to ${avgRecent.toFixed(2)}%.`,
            assetId: asset.id,
            campaignId: asset.campaignId,
          });
        } else if (declinePct > 10) {
          pendingAlerts.push({
            type: "performance_drop",
            severity: "medium",
            title: `CTR declining on "${asset.name}"`,
            message: `7-day avg CTR fell ${Math.round(declinePct)}% compared to prior week.`,
            assetId: asset.id,
            campaignId: asset.campaignId,
          });
        }
      }
    }

    // --- Opportunity detector ---
    if (awm.latestMetrics && orgCtrStddev > 0) {
      const assetCtr = awm.latestMetrics.ctr;
      if (assetCtr > orgCtrMean + 1.5 * orgCtrStddev) {
        pendingAlerts.push({
          type: "opportunity",
          severity: "medium",
          title: `"${asset.name}" outperforming`,
          message: `CTR of ${assetCtr.toFixed(2)}% significantly exceeds org average of ${orgCtrMean.toFixed(2)}%. Consider scaling budget.`,
          assetId: asset.id,
          campaignId: asset.campaignId,
        });
      }
    }
  }

  // --- Budget pacing detector (per campaign) ---
  for (const campaign of campaigns) {
    if (campaign.status !== "active" || !campaign.endDate) continue;

    const start = new Date(campaign.startDate).getTime();
    const end = new Date(campaign.endDate).getTime();
    const now = Date.now();
    const totalDuration = end - start;
    if (totalDuration <= 0) continue;

    const elapsedFraction = Math.min(1, (now - start) / totalDuration);
    const spentFraction = campaign.budget > 0 ? campaign.spent / campaign.budget : 0;

    if (spentFraction > elapsedFraction * 1.2) {
      const overage = spentFraction / Math.max(0.01, elapsedFraction);
      const severity: AlertSeverity = overage > 1.5 ? "high" : "medium";
      pendingAlerts.push({
        type: "budget_pacing",
        severity,
        title: `Budget overpacing on "${campaign.name}"`,
        message: `Spent ${Math.round(spentFraction * 100)}% of budget with ${Math.round(elapsedFraction * 100)}% of time elapsed.`,
        assetId: null,
        campaignId: campaign.id,
      });
    }
  }

  // --- Deduplication: skip if same type + same asset/campaign in last 24h ---
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentExisting = existingAlerts.filter((a) => a.createdAt >= oneDayAgo);

  const deduplicated = pendingAlerts.filter((pending) => {
    return !recentExisting.some(
      (existing) =>
        existing.type === pending.type &&
        existing.assetId === pending.assetId &&
        existing.campaignId === pending.campaignId
    );
  });

  // --- Create alerts ---
  const created: Alert[] = [];
  for (const alert of deduplicated) {
    const newAlert = await repos.alerts.create({
      orgId,
      ...alert,
      dismissed: false,
    });
    created.push(newAlert);
  }

  return created;
}
