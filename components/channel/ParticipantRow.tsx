import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import { ParticipantAvatar } from "@/components/common/ParticipantAvatar";
import { StatusDot } from "@/components/common/StatusDot";
import type { Participant, StatusTone } from "@/types/participant";

const STATUS_LABEL: Record<StatusTone, string> = {
  online: "온라인",
  pending: "연결 중",
  offline: "오프라인",
  error: "오류",
};

interface ParticipantRowProps {
  participant: Participant;
  style?: CSSProperties;
}

export function ParticipantRow({ participant, style }: ParticipantRowProps) {
  return (
    <li
      style={style}
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50 animate-in fade-in slide-in-from-right-1 duration-200 fill-mode-backwards"
    >
      <ParticipantAvatar
        nickname={participant.nickname}
        avatarIndex={participant.avatarIndex}
        className="size-7"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{participant.nickname}</p>
      </div>
      <div className="flex items-center gap-1">
        {participant.isHost && (
          <Badge variant="secondary" className="text-2xs">
            호스트
          </Badge>
        )}
        {participant.isSelf && (
          <Badge variant="outline" className="text-2xs">
            나
          </Badge>
        )}
        <span className="sr-only">{STATUS_LABEL[participant.status]}</span>
        <StatusDot tone={participant.status} isPulsing={participant.status === "online"} />
      </div>
    </li>
  );
}
