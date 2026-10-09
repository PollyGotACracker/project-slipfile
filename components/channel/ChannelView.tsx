"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectionBanner } from "@/components/channel/ConnectionStatus";
import { HostScreenPanel } from "@/components/channel/HostScreenPanel";
import {
  ParticipantsMain,
  ParticipantsSidebar,
} from "@/components/channel/ParticipantsPanel";
import { ChannelEnded } from "@/components/channel/ChannelEnded";
import { ChannelSkeleton } from "@/components/channel/ChannelSkeleton";
import { ChannelTopBar } from "@/components/channel/ChannelTopBar";
import { TransferSidebar } from "@/components/channel/TransferRegion";
import { Button } from "@/components/ui/button";
import { connectChannel, type ChannelSessionState } from "@/supabase/realtime";
import { useParticipantSession } from "@/utils/participant";
import { getChannelJoinPath, getChannelPath } from "@/utils/channel";
import type { ChatMessage } from "@/types/message";

interface ChannelViewProps {
  channelId: string;
}

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

export function ChannelView({ channelId }: ChannelViewProps) {
  const router = useRouter();
  const [channelState, setChannelState] = useState<ChannelSessionState>({
    connection: "connecting",
    participants: [],
    isEnded: false,
    error: null,
  });
  const { resolved, session: participantSession } =
    useParticipantSession(channelId);

  useEffect(() => {
    // 참여자 세션이 없으면(예: 공유 링크로 직접 진입) join 페이지로 보낸다.
    if (resolved && !participantSession) {
      router.replace(getChannelJoinPath(channelId));
    }
  }, [resolved, participantSession, channelId, router]);

  useEffect(() => {
    if (!participantSession) return;
    let isActive = true;
    try {
      const disconnect = connectChannel(
        channelId,
        participantSession,
        (state) => {
          if (isActive) setChannelState(state);
        },
      );
      return () => {
        isActive = false;
        void disconnect().catch(console.error);
      };
    } catch (error) {
      queueMicrotask(() => {
        if (!isActive) return;
        setChannelState({
          connection: "failed",
          participants: [],
          isEnded: false,
          error:
            error instanceof Error
              ? error.message
              : "채널 연결에 실패했습니다.",
        });
      });
      return () => {
        isActive = false;
      };
    }
  }, [channelId, participantSession]);

  if (!participantSession) {
    return <ChannelSkeleton />;
  }

  const role: "host" | "participant" = participantSession.isHost
    ? "host"
    : "participant";

  const participants = channelState.participants;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const shareUrl = `${siteUrl}${getChannelPath(channelId)}`;

  if (channelState.isEnded) {
    return <ChannelEnded />;
  }

  if (channelState.error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p role="alert" className="text-sm text-destructive">
          {channelState.error}
        </p>
        <Button onClick={() => router.replace("/")}>홈으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ChannelTopBar
        title={channelState.title}
        shareUrl={shareUrl}
        connection={channelState.connection}
        role={role}
      />
      <ConnectionBanner state={channelState.connection} />

      <div className="flex min-h-0 w-full flex-1">
        <TransferSidebar role={role} />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            {channelState.connection === "connected" ? (
              <HostScreenPanel
                role={role}
                channelId={channelId}
                session={participantSession}
              />
            ) : (
              <ChannelSkeleton />
            )}
          </div>
          <ParticipantsMain
            participants={participants}
            messages={MOCK_CHAT_MESSAGES}
          />
        </div>
        <ParticipantsSidebar
          participants={participants}
          messages={MOCK_CHAT_MESSAGES}
        />
      </div>
    </div>
  );
}
