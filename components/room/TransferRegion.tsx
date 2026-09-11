import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HostDropzone } from "@/components/room/HostDropzone";
import { HostFileList } from "@/components/room/HostFileList";
import { HostFilePickerButton } from "@/components/room/HostFilePickerButton";
import { IncomingFileList } from "@/components/room/IncomingFileList";

interface TransferRegionProps {
  role: "host" | "participant";
}

export function TransferContent({ role }: TransferRegionProps) {
  return (
    <div className="space-y-4 p-4 flex flex-col grow">
      {role === "host" && <HostDropzone className="hidden lg:flex" />}

      <Card className="min-h-0 flex-1 animate-in fade-in duration-300">
        <CardHeader>
          <CardTitle className="text-sm font-medium">공유된 파일</CardTitle>
          {role === "host" && (
            <CardAction className="lg:hidden">
              <HostFilePickerButton />
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-0">
          {role === "host" ? <HostFileList /> : <IncomingFileList />}
        </CardContent>
      </Card>
    </div>
  );
}

export function TransferSidebar({ role }: TransferRegionProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-r border-border lg:flex">
      <TransferContent role={role} />
    </aside>
  );
}
