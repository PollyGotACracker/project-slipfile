"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LeaveButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 브라우저 뒤로 가기로 Room을 바로 벗어나지 못하도록 가드 히스토리를 쌓아두고,
    // 뒤로 가기가 감지되면 나가기 버튼을 누른 것과 동일하게 확인 다이얼로그를 띄운다.
    history.pushState(null, "", location.href);

    function handlePopState() {
      history.pushState(null, "", location.href);
      setOpen(true);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Room 나가기" />}>
        <LogOut className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room을 나가시겠어요?</DialogTitle>
          <DialogDescription>
            연결이 종료되고 진행 중인 전송이 모두 중단됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button variant="destructive" onClick={() => router.push("/")}>
            나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
