import { cn } from "@/utils/utils";
import type { StatusTone } from "@/types/participant";

const TONE_CLASS: Record<StatusTone, string> = {
  online: "bg-status-online",
  pending: "bg-status-pending",
  offline: "bg-status-offline",
  error: "bg-status-error",
};

interface StatusDotProps {
  tone: StatusTone;
  isPulsing?: boolean;
  className?: string;
}

export function StatusDot({
  tone,
  isPulsing = false,
  className,
}: StatusDotProps) {
  return (
    <span className={cn("relative inline-flex size-2", className)}>
      {isPulsing && (
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-60",
            TONE_CLASS[tone],
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex size-2 rounded-full",
          TONE_CLASS[tone],
        )}
      />
    </span>
  );
}
