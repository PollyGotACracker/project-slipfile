"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectionBanner } from "@/components/room/ConnectionStatus";
import { HostScreenPanel } from "@/components/room/HostScreenPanel";
import {
  ParticipantsMain,
  ParticipantsSidebar,
} from "@/components/room/ParticipantsPanel";
import { RoomEnded } from "@/components/room/RoomEnded";
import { RoomSkeleton } from "@/components/room/RoomSkeleton";
import { RoomTopBar } from "@/components/room/RoomTopBar";
import { TransferSidebar } from "@/components/room/TransferRegion";
import { useParticipantSession } from "@/utils/participant";
import { MOCK_ROOM_TITLE, getRoomJoinPath, getRoomPath } from "@/utils/room";
import type { ConnectionState } from "@/types/room";
import type { ChatMessage } from "@/types/message";
import type { Participant } from "@/types/participant";

interface RoomViewProps {
  roomId: string;
}

// TODO: 목데이터. 실제 게스트·연결 상태는 Supabase Presence/WebRTC 연동 후 대체한다.
const CONNECTION_STATE: ConnectionState = "connected";
// TODO: 호스트 이탈 실시간 감지가 붙기 전까지 UI 확인용으로 수동 토글하는 목 플래그.
const HOST_LEFT = false;

const MOCK_OTHER_PARTICIPANTS: Participant[] = [
  {
    id: "p2",
    nickname: "정우",
    isHost: false,
    isSelf: false,
    status: "online",
    avatarIndex: 3,
  },
  {
    id: "p3",
    nickname: "서현",
    isHost: false,
    isSelf: false,
    status: "pending",
    avatarIndex: 7,
  },
  {
    id: "p4",
    nickname: "민준",
    isHost: false,
    isSelf: false,
    status: "offline",
    avatarIndex: 11,
  },
];

// TODO: 목데이터. 실제 채팅 메시지는 WebRTC DataChannel 연동 후 대체한다.
const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    participantId: "p2",
    nickname: "정우",
    avatarIndex: 3,
    isSelf: false,
    body: "안녕하세요, 잘 들어왔습니다!",
    sentAt: Date.now() - 1000 * 60 * 6,
  },
  {
    id: "m2",
    participantId: "self",
    nickname: "나",
    avatarIndex: 0,
    isSelf: true,
    body: "네 반갑습니다. 곧 자료 공유할게요.",
    sentAt: Date.now() - 1000 * 60 * 4,
  },
  {
    id: "m3",
    participantId: "p3",
    nickname: "서현",
    avatarIndex: 7,
    isSelf: false,
    body: "화면 공유 잘 보이고 있어요.",
    sentAt: Date.now() - 1000 * 60 * 2,
  },
];

export function RoomView({ roomId }: RoomViewProps) {
  const router = useRouter();
  const { resolved, session: participantSession } =
    useParticipantSession(roomId);

  useEffect(() => {
    // 참여자 세션이 없으면(예: 공유 링크로 직접 진입) join 페이지로 보낸다.
    if (resolved && !participantSession) {
      router.replace(getRoomJoinPath(roomId));
    }
  }, [resolved, participantSession, roomId, router]);

  if (!participantSession) {
    return <RoomSkeleton />;
  }

  const role: "host" | "participant" = participantSession.isHost
    ? "host"
    : "participant";

  const selfParticipant: Participant = {
    id: participantSession.participantId,
    nickname: participantSession.nickname,
    isHost: role === "host",
    isSelf: true,
    status: "online",
    avatarIndex: participantSession.avatarIndex,
  };
  const participants: Participant[] = [
    selfParticipant,
    ...MOCK_OTHER_PARTICIPANTS,
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const shareUrl = `${siteUrl}${getRoomPath(roomId)}`;

  if (HOST_LEFT) {
    return <RoomEnded />;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <RoomTopBar
        title={MOCK_ROOM_TITLE}
        shareUrl={shareUrl}
        connection={CONNECTION_STATE}
        role={role}
      />
      <ConnectionBanner state={CONNECTION_STATE} />

      <div className="flex min-h-0 w-full flex-1">
        <TransferSidebar role={role} />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <HostScreenPanel role={role} />
          </div>
          <ParticipantsMain participants={participants} messages={MOCK_CHAT_MESSAGES} />
        </div>
        <ParticipantsSidebar participants={participants} messages={MOCK_CHAT_MESSAGES} />
      </div>
    </div>
  );
}
