import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDevMode } from "@/lib/dev-mode";
import { MetricsClient } from "@/components/pages/metrics-client";

export default async function MetricsPage() {
  if (!isDevMode()) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");
  }

  return <MetricsClient />;
}
