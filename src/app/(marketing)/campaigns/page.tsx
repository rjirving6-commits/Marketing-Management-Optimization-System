import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDevMode } from "@/lib/dev-mode";
import { CampaignsClient } from "@/components/pages/campaigns-client";

export default async function CampaignsPage() {
  if (!isDevMode()) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");
  }

  return <CampaignsClient />;
}
