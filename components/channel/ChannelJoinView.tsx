"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getRandomAvatarIndex } from "@/components/common/ParticipantAvatar";
import { IdentityFields } from "@/components/landing/IdentityFields";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  upsertParticipantSession,
  useParticipantSession,
  type ParticipantSessionSnapshot,
} from "@/utils/participant";
import { getChannelPath } from "@/utils/channel";

interface ChannelJoinViewProps {
  channelId: string;
  /**
   * "방금 이 channel을 만들었다"는 안내 문구용 힌트일 뿐, 이 화면에서는 참고용으로만 쓰이는 값.
   * TODO: 실제 호스트 여부는 Presence 참여 순서 연동 후 그 값으로 계산한다.
   */
  isHost: boolean;
}

export function ChannelJoinView({ channelId, isHost }: ChannelJoinViewProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  // TODO: 지금은 입력만 받고 저장하지 않는다.
  // 실제로 Channel에 반영하려면 sessionStorage 저장 및 게스트 전달(Presence 연동) 구현이 필요하다.
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  // 호스트는 제목 입력 → 닉네임/아바타 설정
  // 게스트는 단계 없이 바로 시작
  const [step, setStep] = useState<"title" | "identity">(
    isHost ? "title" : "identity",
  );

  // 이미 이 channel에 참여자 세션이 있으면(예: 자기 공유 링크 재클릭) 기존 값을 프리필하고,
  // 없으면 랜덤 아바타를 배정한다.
  const sessionSnapshot = useParticipantSession(channelId);
  const [appliedSnapshot, setAppliedSnapshot] =
    useState<ParticipantSessionSnapshot | null>(null);
  if (sessionSnapshot.resolved && sessionSnapshot !== appliedSnapshot) {
    setAppliedSnapshot(sessionSnapshot);
    if (sessionSnapshot.session) {
      setNickname(sessionSnapshot.session.nickname);
      setAvatarIndex(sessionSnapshot.session.avatarIndex);
    } else {
      setAvatarIndex(getRandomAvatarIndex());
    }
  }

  function handleJoin() {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("닉네임을 입력하세요.");
      return;
    }
    setError(null);
    setIsJoining(true);
    upsertParticipantSession(channelId, trimmed, avatarIndex, isHost);
    router.push(getChannelPath(channelId));
  }

  const isTitleStep = isHost && step === "title";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader />

      <div className="mx-auto flex w-full max-w-xs flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="space-y-1.5">
          <h1 className="break-keep text-3xl font-semibold tracking-tight">
            <span className="font-mono">{channelId}</span>{" "}
            <span className="whitespace-nowrap">
              {isHost ? "Channel 생성" : "Channel 입장"}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {isTitleStep
              ? "Channel 이름을 설정하세요."
              : "사용할 닉네임과 아바타를 설정하세요."}
          </p>
        </div>

        <div className="flex justify-center">
          <Badge variant={isHost ? "default" : "secondary"}>
            {isHost ? "호스트" : "게스트"}
          </Badge>
        </div>

        {isTitleStep ? (
          <div className="w-full space-y-2 text-left">
            <Label
              htmlFor="channel-title"
              className="text-xs font-medium text-muted-foreground"
            >
              Channel 이름 (선택)
            </Label>
            <Input
              id="channel-title"
              placeholder="Channel 이름을 입력하세요"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={30}
              spellCheck="false"
            />
          </div>
        ) : (
          <IdentityFields
            nickname={nickname}
            onNicknameChange={(value) => {
              setNickname(value);
              if (error) setError(null);
            }}
            avatarIndex={avatarIndex}
            onAvatarIndexChange={setAvatarIndex}
            nicknameError={error}
          />
        )}

        {isTitleStep ? (
          <Button
            size="lg"
            onClick={() => setStep("identity")}
            className="h-12 w-full gap-2 bg-primary-gradient text-base hover:brightness-110"
          >
            다음
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleJoin}
            disabled={isJoining}
            className="h-12 w-full gap-2 bg-primary-gradient text-base hover:brightness-110"
          >
            {isHost ? "Channel 생성" : "Channel 입장"}
            {isJoining ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </Button>
        )}

        <div
          className={`flex w-full items-center ${
            isHost && !isTitleStep ? "justify-between" : "justify-center"
          }`}
        >
          {isHost && !isTitleStep && (
            <button
              type="button"
              onClick={() => setStep("title")}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              이전으로
            </button>
          )}
          <Link
            href="/"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            메인으로
          </Link>
        </div>
      </div>
    </div>
  );
}
