import { ParticipantAvatar } from "@/components/common/ParticipantAvatar";
import { cn } from "@/utils/utils";
import type { ChatMessage } from "@/types/message";

const TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
});

interface ChatMessageRowProps {
  message: ChatMessage;
}

export function ChatMessageRow({ message }: ChatMessageRowProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-2",
        message.isSelf && "flex-row-reverse",
      )}
    >
      {!message.isSelf && (
        <ParticipantAvatar
          nickname={message.nickname}
          avatarIndex={message.avatarIndex}
          className="size-7 shrink-0"
        />
      )}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-0.5",
          message.isSelf && "items-end",
        )}
      >
        {!message.isSelf && (
          <span className="px-0.5 text-xs text-muted-foreground">
            {message.nickname}
          </span>
        )}
        <div
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-sm break-words",
            message.isSelf
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
          )}
        >
          {message.body}
        </div>
        <span className="px-0.5 text-2xs text-muted-foreground">
          {TIME_FORMATTER.format(message.sentAt)}
        </span>
      </div>
    </li>
  );
}
