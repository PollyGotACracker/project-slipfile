import { ChatComposer } from "@/components/room/ChatComposer";
import { ChatMessageList } from "@/components/room/ChatMessageList";
import type { ChatMessage } from "@/types/message";

export function ChatPanel({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex h-full flex-col">
      <ChatMessageList messages={messages} />
      <ChatComposer />
    </div>
  );
}
