import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/pages/dashboard-client";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}
