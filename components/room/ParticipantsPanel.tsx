"use client";

import { Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ChatPanel } from "@/components/room/ChatPanel";
import { HOST_SCREEN_STAGE_ID } from "@/components/room/HostScreenPanel";
import { ParticipantList } from "@/components/room/ParticipantList";
import type { ChatMessage } from "@/types/message";
import type { Participant } from "@/types/participant";

interface ParticipantsProps {
  participants: Participant[];
  messages: ChatMessage[];
}

function handleFullscreen() {
  document.getElementById(HOST_SCREEN_STAGE_ID)?.requestFullscreen();
}

function ParticipantsTabs({ participants, messages }: ParticipantsProps) {
  return (
    <Tabs defaultValue="participants" className="min-h-0 flex-1">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <TabsList className="flex-1 p-0">
          <TabsTrigger value="participants" className="gap-1.5">
            참여자
            <Badge variant="secondary">{participants.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="chat">채팅</TabsTrigger>
          <TabsIndicator />
        </TabsList>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="전체 화면 보기"
          onClick={handleFullscreen}
        >
          <Maximize className="size-3.5" />
        </Button>
      </div>
      <TabsContent value="participants" className="overflow-hidden">
        <ParticipantList participants={participants} />
      </TabsContent>
      <TabsContent value="chat" className="overflow-hidden">
        <ChatPanel messages={messages} />
      </TabsContent>
    </Tabs>
  );
}

/**
 * 모바일에서 화면 공유 영역 아래에 표시되는 참여자/채팅 영역.
 * 데스크톱에서는 {@link ParticipantsSidebar}가 대신한다.
 */
export function ParticipantsMain({
  participants,
  messages,
}: ParticipantsProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:hidden">
      <ParticipantsTabs participants={participants} messages={messages} />
    </div>
  );
}

/** 데스크톱에서 우측에 고정되는 참여자/채팅 사이드바. */
export function ParticipantsSidebar({
  participants,
  messages,
}: ParticipantsProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border lg:flex">
      <ParticipantsTabs participants={participants} messages={messages} />
    </aside>
  );
}
