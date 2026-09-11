import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageRow } from "@/components/room/ChatMessageRow";
import type { ChatMessage } from "@/types/message";

export function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <ul className="space-y-2 p-2">
        {messages.map((message) => (
          <ChatMessageRow key={message.id} message={message} />
        ))}
      </ul>
    </ScrollArea>
  );
}
