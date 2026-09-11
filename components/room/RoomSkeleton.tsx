import { Skeleton } from "@/components/ui/skeleton";

export function RoomSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Skeleton className="h-6 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <div className="flex-1 space-y-3 p-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
        <div className="hidden w-72 shrink-0 space-y-2 border-l border-border p-3 lg:block">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}
