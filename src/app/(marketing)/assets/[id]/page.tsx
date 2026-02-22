import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDevMode } from "@/lib/dev-mode";
import { AssetDetailClient } from "@/components/pages/asset-detail-client";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isDevMode()) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");
  }

  const { id } = await params;
  return <AssetDetailClient assetId={id} />;
}
