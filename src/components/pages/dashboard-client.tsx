"use client";

import { Button } from "@/components/ui/button";
import { useDiagnostics } from "@/hooks/use-diagnostics";
import Link from "next/link";

type DashboardClientProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function DashboardClient({ user }: DashboardClientProps) {
  const { isAiReady, loading: diagnosticsLoading } = useDiagnostics();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
          <p className="text-muted-foreground mb-4">
            Start a conversation with AI using the Vercel AI SDK
          </p>
          {diagnosticsLoading || !isAiReady ? (
            <Button disabled={true}>Go to Chat</Button>
          ) : (
            <Button asChild>
              <Link href="/chat">Go to Chat</Link>
            </Button>
          )}
        </div>

        <div className="p-6 border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p className="text-muted-foreground mb-4">
            Manage your account settings and preferences
          </p>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {user.name || "Unknown"}
            </p>
            <p>
              <strong>Email:</strong> {user.email || "Unknown"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
