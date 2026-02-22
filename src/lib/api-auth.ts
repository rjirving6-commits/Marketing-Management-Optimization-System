import { auth } from "@/lib/auth";
import { isDevMode, mockUser } from "@/lib/dev-mode";
import { headers } from "next/headers";

export async function getApiSession(): Promise<{
  user: { id: string; name: string; email: string; image: string | null };
} | null> {
  if (isDevMode()) {
    return { user: mockUser };
  }
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return null;
  }
  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? null,
    },
  };
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
