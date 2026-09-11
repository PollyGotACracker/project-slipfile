import { Wordmark } from "@/components/layouts/Wordmark";
import { ThemeToggle } from "@/components/layouts/ThemeToggle";
import { ConnectionPill } from "@/components/room/ConnectionStatus";
import { LeaveButton } from "@/components/room/LeaveButton";
import { RoomMobileMenu } from "@/components/room/RoomMobileMenu";
import { ShareDialog } from "@/components/room/ShareDialog";
import type { ConnectionState } from "@/types/room";

interface RoomTopBarProps {
  title?: string;
  shareUrl: string;
  connection: ConnectionState;
  role: "host" | "participant";
}

export function RoomTopBar({
  title,
  shareUrl,
  connection,
  role,
}: RoomTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Wordmark className="sm:inline-flex" />
        {title && <span className="truncate font-medium">{title}</span>}
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-1.5 sm:gap-2 lg:flex">
          <ConnectionPill state={connection} />
          <ShareDialog shareUrl={shareUrl} />
          <ThemeToggle />
        </div>
        <RoomMobileMenu
          connection={connection}
          shareUrl={shareUrl}
          role={role}
        />
        <LeaveButton />
      </div>
    </header>
  );
}
