"use client";

import { UploadCloud } from "lucide-react";
import { type DragEvent, useState } from "react";
import { HostFilePickerButton } from "@/components/room/HostFilePickerButton";
import { cn } from "@/utils/utils";

interface HostDropzoneProps {
  className?: string;
}

// TODO: 실제 전송은 WebRTC 연동 작업에서 연결한다.
export function HostDropzone({ className }: HostDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDragOver ? "border-primary bg-primary/5" : "border-border",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <UploadCloud className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">파일을 여기에 끌어다 놓으세요</p>
        <p className="text-sm text-muted-foreground">
          또는 아래 버튼으로 선택하세요.
        </p>
      </div>
      <HostFilePickerButton />
    </div>
  );
}
