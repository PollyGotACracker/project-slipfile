"use client";

import { MonitorX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createScreenShare } from "@/lib/screen-share";
import type { ParticipantSession } from "@/types/participant";

interface HostScreenPanelProps {
  role: "host" | "participant";
  channelId: string;
  session: ParticipantSession;
}

/** 전체 화면 보기 버튼이 대상으로 삼는 화면 공유 영역의 DOM id. */
export const HOST_SCREEN_STAGE_ID = "host-screen-stage";

export function HostScreenPanel({
  role,
  channelId,
  session,
}: HostScreenPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<ReturnType<typeof createScreenShare> | null>(
    null,
  );
  const [isSharing, setIsSharing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleError(value: unknown) {
    setError(
      value instanceof Error ? value.message : "화면 공유에 실패했습니다.",
    );
  }

  useEffect(() => {
    const video = videoRef.current;
    let isActive = true;
    try {
      const screenShare = createScreenShare(
        channelId,
        session,
        (stream) => {
          if (video) video.srcObject = stream;
          setIsSharing(stream !== null);
        },
        setIsReady,
        handleError,
      );
      screenShareRef.current = screenShare;
      return () => {
        isActive = false;
        screenShareRef.current = null;
        if (video) video.srcObject = null;
        screenShare.close();
      };
    } catch (value) {
      queueMicrotask(() => {
        if (isActive) handleError(value);
      });
      return () => {
        isActive = false;
      };
    }
  }, [channelId, session]);

  async function handleStartSharing() {
    setError(null);
    setIsStarting(true);
    try {
      await screenShareRef.current?.start();
    } catch (value) {
      handleError(value);
    } finally {
      setIsStarting(false);
    }
  }

  function handleStopSharing() {
    setError(null);
    screenShareRef.current?.stop();
  }

  return (
    <div className="relative flex size-full items-center justify-center animate-in fade-in duration-300">
      <div
        id={HOST_SCREEN_STAGE_ID}
        className="flex aspect-video h-full max-w-full items-center justify-center rounded-lg bg-muted/30"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline // 전체화면이 아닌 페이지 안에서 재생
          muted // TODO: 호스트는 muted, 게스트는 X
          controls
          aria-label="호스트 공유 화면"
          className={`size-full object-contain ${isSharing ? "" : "hidden"}`}
        />
        {!isSharing && (
          <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
            <MonitorX className="size-8" />
            <p className="text-sm">
              {role === "host"
                ? "화면 공유를 시작하면 여기에 표시됩니다."
                : "호스트가 화면 공유를 시작하면 여기에 표시됩니다."}
            </p>
          </div>
        )}
      </div>
      {role === "host" && (
        <Button
          variant={isSharing ? "outline" : "default"}
          size="sm"
          className="absolute top-3 right-3"
          disabled={isStarting || (!isSharing && !isReady)}
          onClick={isSharing ? handleStopSharing : handleStartSharing}
        >
          {isStarting
            ? "화면 선택 중…"
            : isSharing
              ? "화면 공유 중지"
              : "화면 공유 시작"}
        </Button>
      )}
      {error && (
        <p
          role="alert"
          className="absolute bottom-3 left-3 right-3 rounded-md bg-background/90 p-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
