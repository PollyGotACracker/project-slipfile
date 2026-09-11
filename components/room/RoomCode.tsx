"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/utils";

interface RoomCodeProps {
  code: string;
  className?: string;
}

export function RoomCode({ code, className }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // 무시: 사용자가 직접 선택해 복사 가능
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Room 코드 ${code} 복사`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-sm tracking-widest uppercase transition-colors hover:bg-muted",
        className,
      )}
    >
      {code}
      {copied ? (
        <Check className="size-3.5 text-status-online" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" />
      )}
    </button>
  );
}
