"use client";

import { PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConnectionPill } from "@/components/channel/ConnectionStatus";
import { ShareDialog } from "@/components/channel/ShareDialog";
import { TransferContent } from "@/components/channel/TransferRegion";
import { ThemeToggle } from "@/components/layouts/ThemeToggle";
import type { ConnectionState } from "@/types/channel";

interface ChannelMobileMenuProps {
  connection: ConnectionState;
  shareUrl: string;
  role: "host" | "participant";
}

export function ChannelMobileMenu({
  connection,
  shareUrl,
  role,
}: ChannelMobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="메뉴"
          />
        }
      >
        <PanelRight className="size-4" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-72 max-w-[85vw] flex-col gap-0 overflow-y-auto p-0"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>메뉴</SheetTitle>
          <SheetDescription className="sr-only">
            연결 상태, 공유, 파일, 테마 설정
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-16 items-center justify-between px-4">
          <span className="text-sm font-medium text-muted-foreground">
            연결 상태
          </span>
          <ConnectionPill state={connection} />
        </div>
        <Separator />
        <div className="flex h-16 items-center justify-between px-4">
          <span className="text-sm font-medium text-muted-foreground">
            채널 공유
          </span>
          <ShareDialog shareUrl={shareUrl} />
        </div>
        <Separator />
        <div className="flex h-16 items-center justify-between px-4">
          <span className="text-sm font-medium text-muted-foreground">
            테마
          </span>
          <ThemeToggle />
        </div>
        <Separator />
        <TransferContent role={role} />
      </SheetContent>
    </Sheet>
  );
}
