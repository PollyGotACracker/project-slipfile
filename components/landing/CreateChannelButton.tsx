"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateMockChannelCode, getChannelJoinPath } from "@/utils/channel";

export function CreateChannelButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  function handleCreateChannel() {
    setIsCreating(true);
    const code = generateMockChannelCode();
    router.push(getChannelJoinPath(code, { asHost: true }));
  }

  return (
    <Button
      size="lg"
      onClick={handleCreateChannel}
      disabled={isCreating}
      className="h-12 gap-2 bg-primary-gradient px-7 text-base hover:brightness-110"
    >
      Channel 만들기
      {isCreating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-2" />
      )}
    </Button>
  );
}
