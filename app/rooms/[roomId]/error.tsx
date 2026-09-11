"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoomError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
            <WifiOff className="size-5 text-destructive" />
          </div>
          <CardTitle>Room 연결이 끊어졌습니다</CardTitle>
          <CardDescription>네트워크 상태를 확인한 뒤 다시 시도해 주세요.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={reset}>
            다시 시도
          </Button>
          <Link href="/" className={buttonVariants({ className: "flex-1 bg-primary-gradient" })}>
            홈으로
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
