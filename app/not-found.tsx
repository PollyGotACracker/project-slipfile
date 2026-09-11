import { Compass } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <Compass className="size-5 text-muted-foreground" />
          </div>
          <CardTitle>이 페이지를 찾을 수 없습니다</CardTitle>
          <CardDescription>주소가 잘못되었거나 Room이 이미 닫혔을 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className={buttonVariants({ className: "w-full bg-primary-gradient" })}>
            홈으로 돌아가기
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
