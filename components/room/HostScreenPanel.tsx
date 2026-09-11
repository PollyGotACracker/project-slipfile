"use client";

import { MonitorPlay, MonitorX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ScreenShareState } from "@/types/room";

interface HostScreenPanelProps {
  role: "host" | "participant";
}

/** 전체 화면 보기 버튼이 대상으로 삼는 화면 공유 영역의 DOM id. */
export const HOST_SCREEN_STAGE_ID = "host-screen-stage";

// TODO: 실제 화면 공유는 getDisplayMedia + WebRTC 연동 후 대체한다.
export function HostScreenPanel({ role }: HostScreenPanelProps) {
  const [state, setState] = useState<ScreenShareState>("idle");
  const isSharing = state === "sharing";

  return (
    <div className="relative flex size-full items-center justify-center animate-in fade-in duration-300">
      <div
        id={HOST_SCREEN_STAGE_ID}
        className="flex aspect-video h-full max-w-full items-center justify-center rounded-lg bg-muted/30"
      >
        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
          {isSharing ? (
            <>
              <MonitorPlay className="size-8" />
              <p className="text-sm">호스트 화면이 공유되고 있습니다.</p>
            </>
          ) : (
            <>
              <MonitorX className="size-8" />
              <p className="text-sm">
                {role === "host"
                  ? "화면 공유를 시작하면 여기에 표시됩니다."
                  : "호스트가 화면 공유를 시작하면 여기에 표시됩니다."}
              </p>
            </>
          )}
        </div>
      </div>
      {role === "host" && (
        <Button
          variant={isSharing ? "outline" : "default"}
          size="sm"
          className="absolute top-3 right-3"
          onClick={() => setState(isSharing ? "idle" : "sharing")}
        >
          {isSharing ? "화면 공유 중지" : "화면 공유 시작"}
        </Button>
      )}
    </div>
  );
}
