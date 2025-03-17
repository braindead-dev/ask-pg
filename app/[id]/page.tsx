import { getSharedChat } from "@/app/lib/db";
import { notFound } from "next/navigation";
import { ChatForm } from "@/components/chat-form";

export default async function SharedChatPage({
  params,
}: {
  params: { id: string };
}) {
  const chat = await getSharedChat(params.id);

  if (!chat) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ChatForm initialMessages={chat.messages} isShared={true} />
    </div>
  );
}
