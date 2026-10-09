import { DoorOpen } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function ChannelEnded() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <DoorOpen className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">
          채널이 종료되었습니다.
        </h1>
        <p className="text-sm text-muted-foreground">
          호스트가 나가서 이 채널은 더 이상 사용할 수 없습니다.
        </p>
      </div>
      <Link href="/" className={buttonVariants()}>
        홈으로 돌아가기
      </Link>
    </div>
  );
}
