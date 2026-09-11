import type { ReactNode } from "react";
import { FileTypeIcon } from "@/components/room/FileTypeIcon";

interface FileRowProps {
  fileName: string;
  sizeLabel: string;
  progress: number;
  isActive?: boolean;
  actions?: ReactNode;
}

export function FileRow({
  fileName,
  sizeLabel,
  progress,
  isActive = false,
  actions,
}: FileRowProps) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2.5 transition-colors hover:bg-muted/40">
      <FileTypeIcon
        fileName={fileName}
        className="size-4 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">{fileName}</p>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {sizeLabel}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={
              isActive
                ? "h-full rounded-full bg-live-gradient transition-[width] duration-300 ease-out"
                : "h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            }
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-1">{actions}</div>
      )}
    </div>
  );
}
