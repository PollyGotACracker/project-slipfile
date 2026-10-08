"use client";

import { SendHorizontal } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// TODO: 실제 메시지 전송은 WebRTC DataChannel 연동 후 연결한다.
export function ChatComposer() {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1.5 border-t border-border p-2"
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="메시지를 입력하세요"
        aria-label="채팅 메시지 입력"
      />
      <Button
        type="submit"
        size="icon"
        aria-label="전송"
        disabled={!value.trim()}
      >
        <SendHorizontal className="size-4" />
      </Button>
    </form>
  );
}
