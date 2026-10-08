import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelView } from "@/components/channel/ChannelView";
import { MOCK_CHANNEL_TITLE } from "@/utils/channel";

const CHANNEL_ID_PATTERN = /^[A-Z0-9]{4,8}$/;

export async function generateMetadata(
  props: PageProps<"/channels/[channelId]">,
): Promise<Metadata> {
  const { channelId } = await props.params;
  return {
    title: MOCK_CHANNEL_TITLE ?? `Channel ${channelId.toUpperCase()}`,
    robots: { index: false, follow: false },
  };
}

export default async function ChannelPage(
  props: PageProps<"/channels/[channelId]">,
) {
  const { channelId } = await props.params;
  const normalized = channelId.toUpperCase();

  if (!CHANNEL_ID_PATTERN.test(normalized)) {
    notFound();
  }

  return <ChannelView channelId={normalized} />;
}
