"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRoomJoinPath } from "@/utils/room";

const ROOM_CODE_PATTERN = /^[A-Z0-9]{8}$/;

export function JoinRoomForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();

    if (!normalized) {
      setError("Room 코드를 입력하세요.");
      return;
    }
    if (!ROOM_CODE_PATTERN.test(normalized)) {
      setError("코드는 영문/숫자 8자리입니다.");
      return;
    }
    setError(null);
    router.push(getRoomJoinPath(normalized));
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <Label
        htmlFor="room-code"
        className="block text-xs font-medium text-muted-foreground"
      >
        코드로 참여하기
      </Label>
      <div className="flex gap-2">
        <Input
          id="room-code"
          placeholder="코드 입력"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "room-code-error" : undefined}
          className="font-mono uppercase tracking-widest"
          maxLength={8}
          spellCheck="false"
        />
        <Button type="submit" variant="outline">
          참여
        </Button>
      </div>
      {error && (
        <p
          id="room-code-error"
          className="text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}
