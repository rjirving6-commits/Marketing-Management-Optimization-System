import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChatClient } from "@/components/pages/chat-client";
import { auth } from "@/lib/auth";

export default async function ChatPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/");
  }

  return <ChatClient userName={session.user.name} />;
}
