import { FileSymlink } from "lucide-react";
import { cn } from "@/utils/utils";

interface WordmarkProps {
  isCompact?: boolean;
  size?: "sm" | "lg";
  className?: string;
}

export function Wordmark({
  isCompact = false,
  size = "sm",
  className,
}: WordmarkProps) {
  const isLarge = size === "lg";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold tracking-tight",
        isLarge ? "gap-2.5 text-2xl" : "text-base",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-md bg-primary-gradient text-primary-foreground",
          isLarge ? "size-9 rounded-lg" : "size-6",
        )}
      >
        <FileSymlink
          className={isLarge ? "size-5" : "size-3.5"}
          // fill="currentColor"
          strokeWidth={2}
        />
      </span>
      {!isCompact && <span>slipfile</span>}
    </span>
  );
}
