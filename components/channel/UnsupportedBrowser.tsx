"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UnsupportedBrowser() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="size-5 text-destructive" />
          </div>
          <CardTitle>이 브라우저는 지원하지 않습니다</CardTitle>
          <CardDescription>
            slipfile은 WebRTC가 필요합니다. 최신 버전의 Chrome, Edge, Firefox, Safari로
            다시 시도해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => location.reload()}>
            다시 시도
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
