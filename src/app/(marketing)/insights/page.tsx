import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDevMode } from "@/lib/dev-mode";
import { InsightsClient } from "@/components/pages/insights-client";

export default async function InsightsPage() {
  if (!isDevMode()) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");
  }

  return <InsightsClient />;
}
