"use client";

import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";

interface HostFilePickerButtonProps {
  className?: string;
}

// TODO: 실제 전송은 WebRTC 연동 작업에서 연결한다.
/** 파일 선택 다이얼로그를 여는 버튼.
 * 호스트 화면 공유 영역과 모바일 파일 카드에서 공용으로 사용한다.
 * */
export function HostFilePickerButton({ className }: HostFilePickerButtonProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={() => inputRef.current?.click()}
      >
        파일 선택
      </Button>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        className="sr-only"
      />
    </>
  );
}
