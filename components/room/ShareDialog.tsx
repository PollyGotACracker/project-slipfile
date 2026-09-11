"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/common/CopyButton";
import { QrSlot } from "@/components/room/QrSlot";

interface ShareDialogProps {
  shareUrl: string;
}

// TODO: 모바일 등 지원 환경에서 공유하기 버튼을 누르면 `navigator.share`로 네이티브 공유 시트를 띄운다.
export function ShareDialog({ shareUrl }: ShareDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <Share2 className="size-3.5" />
        <span className="hidden sm:inline">공유</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room 공유</DialogTitle>
          <DialogDescription>
            링크가 있는 사람은 Room이 열려 있는 동안
            <br />
            언제든 참여할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input readOnly value={shareUrl} className="font-mono text-xs" />
          <CopyButton value={shareUrl} className="h-8" />
        </div>

        <Button type="button" variant="outline" className="w-full gap-1.5">
          <Share2 className="size-3.5" />
          공유하기
        </Button>

        <Separator />

        <div className="flex justify-center py-1">
          <QrSlot />
        </div>
      </DialogContent>
    </Dialog>
  );
}
