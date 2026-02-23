import { redirect } from "next/navigation";
import { getApiSession } from "@/lib/api-auth";
import { isDevMode } from "@/lib/dev-mode";
import { IntegrationsClient } from "@/components/pages/integrations-client";

export default async function IntegrationsPage() {
  if (!isDevMode()) {
    const session = await getApiSession();
    if (!session) {
      redirect("/");
    }
  }

  return <IntegrationsClient />;
}
