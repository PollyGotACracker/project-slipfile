import { QrCode } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// TODO: 실제 QR 생성 방식(경량 인코더 vendoring vs 라이브러리)은 공유 기능 구현 시 결정한다.
export function QrSlot() {
  return (
    <AspectRatio
      ratio={1}
      className="flex max-w-[200px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40"
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <QrCode className="size-8" />
        <span className="text-xs">QR 코드 준비 중</span>
      </div>
    </AspectRatio>
  );
}
