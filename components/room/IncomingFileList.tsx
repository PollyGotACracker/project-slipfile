import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileRow } from "@/components/room/FileRow";

type IncomingStatus = "incoming" | "ready";

interface IncomingFile {
  id: string;
  name: string;
  sizeLabel: string;
  status: IncomingStatus;
  progress: number;
}

// TODO: 목데이터. 실제 전송 상태는 WebRTC에서 대체
const MOCK_INCOMING_FILES: IncomingFile[] = [
  {
    id: "i1",
    name: "keynote-slides.pdf",
    sizeLabel: "8.4 MB",
    status: "ready",
    progress: 0,
  },
  {
    id: "i2",
    name: "demo-recording.mp4",
    sizeLabel: "142 MB",
    status: "incoming",
    progress: 41,
  },
  {
    id: "i3",
    name: "playground.html",
    sizeLabel: "4 KB",
    status: "ready",
    progress: 0,
  },
  {
    id: "i4",
    name: "build-tool",
    sizeLabel: "1.2 MB",
    status: "ready",
    progress: 0,
  },
];

export function IncomingFileList() {
  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border border-b border-border">
        {MOCK_INCOMING_FILES.map((file) => (
          <FileRow
            key={file.id}
            fileName={file.name}
            sizeLabel={file.sizeLabel}
            progress={file.status === "incoming" ? file.progress : 0}
            isActive={file.status === "incoming"}
            actions={
              <Button variant="outline" size="icon-sm" aria-label="다운로드">
                <Download className="size-3.5" />
              </Button>
            }
          />
        ))}
      </div>
    </ScrollArea>
  );
}
