import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/pages/profile-client";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <ProfileClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
        createdAt: session.user.createdAt,
      }}
    />
  );
}
