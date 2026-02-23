"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Play,
  Check,
  X,
  Loader2,
} from "lucide-react";
import type { AutoAction, AutoActionStatus } from "@/lib/data/types";

const STATUS_FILTERS: { label: string; value: AutoActionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Executed", value: "executed" },
  { label: "Rejected", value: "rejected" },
];

const ACTION_TYPE_LABELS: Record<string, string> = {
  pause_fatigued: "Pause Fatigued",
  reallocate_budget: "Reallocate Budget",
  suggest_creative_rotation: "Creative Rotation",
  escalate_alert: "Escalate Alert",
};

function StatusBadge({ status }: { status: AutoActionStatus }) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/25">
          Pending
        </Badge>
      );
    case "executed":
      return (
        <Badge className="bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/25">
          Executed
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/25">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/25">
          Rejected
        </Badge>
      );
  }
}

export function AutomationClient() {
  const [actions, setActions] = useState<AutoAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AutoActionStatus | "all">(
    "all"
  );
  const [running, setRunning] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const fetchActions = useCallback(async (filter: AutoActionStatus | "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/automation?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch automation actions");
      const data = await res.json();
      setActions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions(statusFilter);
  }, [statusFilter, fetchActions]);

  const handleRunAutomation = async () => {
    try {
      setRunning(true);
      const res = await fetch("/api/automation", { method: "POST" });
      if (!res.ok) throw new Error("Failed to run automation");
      const data = await res.json();
      // Refresh the list
      await fetchActions(statusFilter);
      if (data.created === 0) {
        // No new actions — still success
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRunning(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      setMutatingId(id);
      const res = await fetch(`/api/automation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update action");
      await fetchActions(statusFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setMutatingId(null);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation</h1>
          <p className="text-muted-foreground">
            Review and manage automated optimization actions
          </p>
        </div>
        <Button onClick={handleRunAutomation} disabled={running}>
          {running ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run Automation
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : actions.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          No automation actions found.
          {statusFilter !== "all" && " Try changing the filter."}
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="grid grid-cols-[1fr_120px_1fr_100px_140px_140px] gap-4 p-3 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
            <div>Type</div>
            <div>Target</div>
            <div>Description</div>
            <div>Status</div>
            <div>Created</div>
            <div>Actions</div>
          </div>
          {actions.map((action) => (
            <div
              key={action.id}
              className="grid grid-cols-[1fr_120px_1fr_100px_140px_140px] gap-4 p-3 border-b last:border-b-0 items-center text-sm"
            >
              <div className="font-medium">
                {ACTION_TYPE_LABELS[action.type] ?? action.type}
              </div>
              <div className="text-muted-foreground truncate">
                {action.targetId}
              </div>
              <div className="truncate" title={action.description}>
                {action.description}
              </div>
              <div>
                <StatusBadge status={action.status} />
              </div>
              <div className="text-muted-foreground">
                {new Date(action.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-1">
                {action.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() =>
                        handleUpdateStatus(action.id, "approved")
                      }
                      disabled={mutatingId === action.id}
                    >
                      {mutatingId === action.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      <span className="ml-1">Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() =>
                        handleUpdateStatus(action.id, "rejected")
                      }
                      disabled={mutatingId === action.id}
                    >
                      <X className="h-3 w-3" />
                      <span className="ml-1">Reject</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {actions.length} action{actions.length !== 1 ? "s" : ""} found
      </p>
    </div>
  );
}
