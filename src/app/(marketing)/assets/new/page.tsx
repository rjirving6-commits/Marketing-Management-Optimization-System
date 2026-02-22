import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDevMode } from "@/lib/dev-mode";
import { AssetForm } from "@/components/marketing/asset-form";

export default async function NewAssetPage() {
  if (!isDevMode()) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <AssetForm />
    </div>
  );
}
