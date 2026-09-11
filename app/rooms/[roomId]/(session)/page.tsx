import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomView } from "@/components/room/RoomView";
import { MOCK_ROOM_TITLE } from "@/utils/room";

const ROOM_ID_PATTERN = /^[A-Z0-9]{4,8}$/;

export async function generateMetadata(
  props: PageProps<"/rooms/[roomId]">,
): Promise<Metadata> {
  const { roomId } = await props.params;
  return {
    title: MOCK_ROOM_TITLE ?? `Room ${roomId.toUpperCase()}`,
    robots: { index: false, follow: false },
  };
}

export default async function RoomPage(props: PageProps<"/rooms/[roomId]">) {
  const { roomId } = await props.params;
  const normalized = roomId.toUpperCase();

  if (!ROOM_ID_PATTERN.test(normalized)) {
    notFound();
  }

  return <RoomView roomId={normalized} />;
}
