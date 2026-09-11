import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomJoinView } from "@/components/room/RoomJoinView";

const ROOM_ID_PATTERN = /^[A-Z0-9]{4,8}$/;

export async function generateMetadata(
  props: PageProps<"/rooms/[roomId]/join">,
): Promise<Metadata> {
  const { roomId } = await props.params;
  const searchParams = await props.searchParams;
  const isHost = searchParams.intent === "host";
  return {
    title: `Room ${roomId.toUpperCase()} ${isHost ? "생성" : "입장"}`,
    robots: { index: false, follow: false },
  };
}

export default async function RoomJoinPage(
  props: PageProps<"/rooms/[roomId]/join">,
) {
  const { roomId } = await props.params;
  const searchParams = await props.searchParams;
  const normalized = roomId.toUpperCase();

  if (!ROOM_ID_PATTERN.test(normalized)) {
    notFound();
  }

  const isHost = searchParams.intent === "host";

  return <RoomJoinView roomId={normalized} isHost={isHost} />;
}
