import { createClient } from "@/database/client";

export function connectChannel(
  channelId: string,
  participantId: string,
  onParticipantsChange: (ids: string[]) => void,
  onError: (error: unknown) => void,
) {
  if (!channelId.trim() || !participantId.trim()) {
    throw new Error("Channel ID와 Participant ID가 필요합니다.");
  }

  const supabase = createClient();
  const channel = supabase.channel(`channel:${channelId.trim()}`, {
    config: {
      presence: { key: participantId.trim() },
    },
  });
  let isClosed = false;

  channel
    .on("presence", { event: "sync" }, () => {
      if (!isClosed) {
        onParticipantsChange(Object.keys(channel.presenceState()));
      }
    })
    .subscribe(async (status) => {
      if (isClosed) return;

      if (status !== "SUBSCRIBED") {
        onParticipantsChange([]);
        onError(new Error(`Channel 연결 상태: ${status}`));
        return;
      }

      try {
        const result = await channel.track({ participantId });
        if (!isClosed && result !== "ok") {
          onError(new Error(`참여자 등록 실패: ${result}`));
        }
      } catch (error) {
        if (!isClosed) onError(error);
      }
    });

  return async function disconnectChannel() {
    isClosed = true;
    const result = await supabase.removeChannel(channel);
    if (result !== "ok") {
      throw new Error(`Channel 연결 해제 실패: ${result}`);
    }
  };
}
