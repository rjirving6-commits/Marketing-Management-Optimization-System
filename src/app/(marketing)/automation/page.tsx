import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDevMode } from "@/lib/dev-mode";
import { AutomationClient } from "@/components/pages/automation-client";

export default async function AutomationPage() {
  if (!isDevMode()) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");
  }

  return <AutomationClient />;
}
