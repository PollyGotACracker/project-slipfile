import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/common/StatusDot";
import type { ConnectionState } from "@/types/room";

const LABEL: Record<ConnectionState, string> = {
  connecting: "대기 중",
  connected: "참여 중",
  degraded: "연결 불안정",
  failed: "연결 끊김",
};

export function ConnectionPill({ state }: { state: ConnectionState }) {
  const tone =
    state === "connected"
      ? "online"
      : state === "connecting"
        ? "pending"
        : "error";

  return (
    <Badge
      variant="outline"
      className="gap-1.5 rounded-none border-0 font-normal transition-colors"
      role="status"
      aria-live="polite"
    >
      {state === "connecting" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <StatusDot tone={tone} isPulsing={state === "connected"} />
      )}
      {LABEL[state]}
    </Badge>
  );
}

export function ConnectionBanner({ state }: { state: ConnectionState }) {
  if (state !== "degraded" && state !== "failed") return null;

  return (
    <Alert
      variant={state === "failed" ? "destructive" : "default"}
      className="animate-in fade-in slide-in-from-top-1 rounded-none border-x-0 border-t-0 duration-200"
    >
      <AlertTriangle className="size-4" />
      <AlertTitle>
        {state === "failed" ? "연결이 끊어졌습니다" : "연결이 불안정합니다"}
      </AlertTitle>
      <AlertDescription>
        {state === "failed"
          ? "다시 연결을 시도하는 중입니다. 계속되면 새로고침해 다시 참여해 보세요."
          : "네트워크 상태에 따라 전송 속도가 느려질 수 있습니다."}
      </AlertDescription>
    </Alert>
  );
}
