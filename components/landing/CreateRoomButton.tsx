"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateMockRoomCode, getRoomJoinPath } from "@/utils/room";

export function CreateRoomButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  function handleCreateRoom() {
    setIsCreating(true);
    const code = generateMockRoomCode();
    router.push(getRoomJoinPath(code, { asHost: true }));
  }

  return (
    <Button
      size="lg"
      onClick={handleCreateRoom}
      disabled={isCreating}
      className="h-12 gap-2 bg-primary-gradient px-7 text-base hover:brightness-110"
    >
      Room 만들기
      {isCreating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-2" />
      )}
    </Button>
  );
}
