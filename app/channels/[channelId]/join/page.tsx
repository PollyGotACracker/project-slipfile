import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelJoinView } from "@/components/channel/ChannelJoinView";

const CHANNEL_ID_PATTERN = /^[A-Z0-9]{4,8}$/;

export async function generateMetadata(
  props: PageProps<"/channels/[channelId]/join">,
): Promise<Metadata> {
  const { channelId } = await props.params;
  const searchParams = await props.searchParams;
  const isHost = searchParams.intent === "host";
  return {
    title: `Channel ${channelId.toUpperCase()} ${isHost ? "생성" : "입장"}`,
    robots: { index: false, follow: false },
  };
}

export default async function ChannelJoinPage(
  props: PageProps<"/channels/[channelId]/join">,
) {
  const { channelId } = await props.params;
  const searchParams = await props.searchParams;
  const normalized = channelId.toUpperCase();

  if (!CHANNEL_ID_PATTERN.test(normalized)) {
    notFound();
  }

  const isHost = searchParams.intent === "host";

  return <ChannelJoinView channelId={normalized} isHost={isHost} />;
}
