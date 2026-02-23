"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  RefreshCw,
  Plug,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import type { IntegrationPlatform, IntegrationStatus } from "@/lib/data/types";

interface ConnectionDisplay {
  id: string;
  orgId: string | null;
  platform: IntegrationPlatform;
  accountId: string;
  accountName: string;
  status: IntegrationStatus;
  tokenExpiresAt: string | null;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  createdAt: string;
  updatedAt: string;
}

const PLATFORM_LABELS: Record<IntegrationPlatform, string> = {
  meta: "Meta Ads",
  google_ads: "Google Ads",
  linkedin: "LinkedIn Ads",
};

const PLATFORM_DESCRIPTIONS: Record<IntegrationPlatform, string> = {
  meta: "Connect your Meta Business account to sync Facebook and Instagram ad metrics.",
  google_ads: "Connect your Google Ads account to sync search and display campaign metrics.",
  linkedin: "Connect your LinkedIn Campaign Manager to sync sponsored content metrics.",
};

function StatusIcon({ status }: { status: IntegrationStatus }) {
  switch (status) {
    case "connected":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "disconnected":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  switch (status) {
    case "connected":
      return (
        <Badge className="bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/25">
          Connected
        </Badge>
      );
    case "error":
      return (
        <Badge className="bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/25">
          Error
        </Badge>
      );
    case "disconnected":
      return (
        <Badge variant="secondary">Disconnected</Badge>
      );
  }
}

export function IntegrationsClient() {
  const [connections, setConnections] = useState<ConnectionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Connect form state
  const [showForm, setShowForm] = useState(false);
  const [formPlatform, setFormPlatform] = useState<IntegrationPlatform>("meta");
  const [formAccountId, setFormAccountId] = useState("");
  const [formAccountName, setFormAccountName] = useState("");
  const [connecting, setConnecting] = useState(false);

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/integrations");
      if (!res.ok) throw new Error("Failed to fetch integrations");
      const data = await res.json();
      setConnections(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/integrations/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = async () => {
    if (!formAccountId.trim() || !formAccountName.trim()) return;
    try {
      setConnecting(true);
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: formPlatform,
          accountId: formAccountId.trim(),
          accountName: formAccountName.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to connect");
      }
      setFormAccountId("");
      setFormAccountName("");
      setShowForm(false);
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/integrations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setError(null);
              fetchConnections();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect ad platforms to sync metrics automatically
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncing || connections.filter((c) => c.status === "connected").length === 0}
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync All
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plug className="h-4 w-4 mr-2" />
            Connect Platform
          </Button>
        </div>
      </div>

      {/* Connect form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Connect a Platform</CardTitle>
            <CardDescription>
              Add your ad platform credentials to enable automatic metric sync.
              In production, this would use OAuth — for now, provide account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={formPlatform}
                onValueChange={(v) => setFormPlatform(v as IntegrationPlatform)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meta">Meta Ads</SelectItem>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
                  <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {PLATFORM_DESCRIPTIONS[formPlatform]}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account ID</Label>
                <Input
                  placeholder="e.g., act_123456789"
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                  placeholder="e.g., My Ad Account"
                  value={formAccountName}
                  onChange={(e) => setFormAccountName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleConnect}
                disabled={
                  connecting ||
                  !formAccountId.trim() ||
                  !formAccountName.trim()
                }
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {connecting ? "Connecting..." : "Connect"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connections list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Plug className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No platform connections yet.</p>
            <p className="text-sm">
              Click &quot;Connect Platform&quot; to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((conn) => (
            <Card key={conn.id}>
              <CardContent className="flex items-center justify-between py-5">
                <div className="flex items-center gap-4">
                  <StatusIcon status={conn.status} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {PLATFORM_LABELS[conn.platform]}
                      </p>
                      <StatusBadge status={conn.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conn.accountName}{" "}
                      <span className="text-xs opacity-60">
                        ({conn.accountId})
                      </span>
                    </p>
                    {conn.lastSyncAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last synced:{" "}
                        {new Date(conn.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                    {conn.lastSyncError && (
                      <p className="text-xs text-red-500 mt-1">
                        {conn.lastSyncError}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDisconnect(conn.id)}
                  disabled={deletingId === conn.id}
                >
                  {deletingId === conn.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
