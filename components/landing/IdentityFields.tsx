"use client";

import { Shuffle } from "lucide-react";
import {
  ParticipantAvatar,
  getRandomAvatarIndex,
} from "@/components/common/ParticipantAvatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IdentityFieldsProps {
  nickname: string;
  onNicknameChange: (value: string) => void;
  avatarIndex: number;
  onAvatarIndexChange: (index: number) => void;
  nicknameError?: string | null;
}

export function IdentityFields({
  nickname,
  onNicknameChange,
  avatarIndex,
  onAvatarIndexChange,
  nicknameError,
}: IdentityFieldsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => onAvatarIndexChange(getRandomAvatarIndex(avatarIndex))}
          aria-label="랜덤 아바타로 변경"
          className="group relative rounded-full transition-transform active:scale-95"
        >
          <ParticipantAvatar
            key={avatarIndex}
            nickname={nickname || "?"}
            avatarIndex={avatarIndex}
            className="size-24"
            iconClassName="size-10 animate-avatar-pop"
          />
          <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors group-hover:text-primary">
            <Shuffle className="size-3.5" />
          </span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Label
            htmlFor="nickname"
            className="shrink-0 text-xs font-medium text-muted-foreground"
          >
            닉네임
          </Label>
          <Input
            id="nickname"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            aria-invalid={nicknameError ? true : undefined}
            aria-describedby={nicknameError ? "nickname-error" : undefined}
            maxLength={20}
            spellCheck="false"
          />
        </div>
        {nicknameError && (
          <p
            id="nickname-error"
            className="text-xs text-destructive"
            role="alert"
          >
            {nicknameError}
          </p>
        )}
      </div>
    </div>
  );
}
