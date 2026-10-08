"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="size-5 text-destructive" />
          </div>
          <CardTitle>문제가 발생했습니다</CardTitle>
          <CardDescription>
            일시적인 오류일 수 있습니다. 다시 시도해 주세요.
          </CardDescription>
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
