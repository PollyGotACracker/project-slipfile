import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileRow } from "@/components/room/FileRow";

type OutgoingStatus = "queued" | "sending" | "sent" | "failed";

interface OutgoingFile {
  id: string;
  name: string;
  sizeLabel: string;
  status: OutgoingStatus;
  progress?: number;
}

// TODO: 목데이터. 실제 업로드 상태는 WebRTC에서 대체
const MOCK_OUTGOING_FILES: OutgoingFile[] = [
  {
    id: "f1",
    name: "keynote-slides.pdf",
    sizeLabel: "8.4 MB",
    status: "sent",
    progress: 100,
  },
  {
    id: "f2",
    name: "demo-recording.mp4",
    sizeLabel: "142 MB",
    status: "sending",
    progress: 63,
  },
  {
    id: "f3",
    name: "design-assets.zip",
    sizeLabel: "26.1 MB",
    status: "queued",
  },
  {
    id: "f4",
    name: "notes.txt",
    sizeLabel: "2 KB",
    status: "failed",
    progress: 18,
  },
];

export function HostFileList() {
  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border border-b border-border">
        {MOCK_OUTGOING_FILES.map((file) => (
          <FileRow
            key={file.id}
            fileName={file.name}
            sizeLabel={file.sizeLabel}
            progress={file.status === "queued" ? 0 : (file.progress ?? 0)}
            isActive={file.status === "sending"}
            actions={
              <Button variant="ghost" size="icon-sm" aria-label="파일 삭제">
                <X className="size-3.5" />
              </Button>
            }
          />
        ))}
      </div>
    </ScrollArea>
  );
}
