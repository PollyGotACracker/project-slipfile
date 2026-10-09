import { createClient } from "@/database/client";
import type { ConnectionState } from "@/types/channel";
import type { Participant, ParticipantSession } from "@/types/participant";

interface ChannelPresence {
  participantId: string;
  nickname: string;
  avatarIndex: number;
  isHost: boolean;
  channelTitle: string;
}

/** 방 연결 상태와 Presence 참여자 정보를 담는 타입. */
export interface ChannelSessionState {
  connection: ConnectionState;
  participants: Participant[];
  title?: string;
  isEnded: boolean;
  error: string | null;
}

/**
 * 새로운 방의 영문·숫자 8자리 코드를 생성하는 함수.
 * @returns 생성한 방 코드. 실제 개설 시 Presence에서 사용 여부 확인.
 */
export function generateChannelCode(): string {
  return crypto.randomUUID().slice(0, 8).toUpperCase();
}

/**
 * 외부 Presence 메타데이터의 형식과 입력 길이를 검사하는 타입 가드.
 * @param value 수신한 참여자 메타데이터.
 * @returns 허용된 참여자 정보인지 여부.
 */
function isChannelPresence(value: unknown): value is ChannelPresence {
  if (typeof value !== "object" || value === null) return false;
  return (
    "participantId" in value &&
    typeof value.participantId === "string" &&
    value.participantId.length > 0 &&
    value.participantId.length <= 128 &&
    "nickname" in value &&
    typeof value.nickname === "string" &&
    value.nickname.trim().length > 0 &&
    value.nickname.length <= 20 &&
    "avatarIndex" in value &&
    typeof value.avatarIndex === "number" &&
    Number.isInteger(value.avatarIndex) &&
    value.avatarIndex >= 0 &&
    value.avatarIndex <= 1000 &&
    "isHost" in value &&
    typeof value.isHost === "boolean" &&
    "channelTitle" in value &&
    typeof value.channelTitle === "string" &&
    value.channelTitle.length <= 30
  );
}

/**
 * Presence로 방을 개설하거나 호스트가 있는 방에 입장하는 함수.
 * @param channelId 접속할 방 코드.
 * @param session 현재 참여자의 세션과 생성 의도.
 * @param onStateChange 연결 상태·참여자·제목·오류를 전달하는 콜백.
 * 콜백의 반환값은 사용하지 않음.
 * @returns 비동기 채널 해제 함수. 구독과 대기 타이머 정리.
 */
export function connectChannel(
  channelId: string,
  session: ParticipantSession,
  onStateChange: (state: ChannelSessionState) => void,
) {
  const metadata: ChannelPresence = {
    participantId: session.participantId,
    nickname: session.nickname,
    avatarIndex: session.avatarIndex,
    isHost: session.isHost,
    channelTitle: session.channelTitle ?? "",
  };
  if (!/^[A-Z0-9]{4,8}$/.test(channelId) || !isChannelPresence(metadata)) {
    throw new Error("방 코드 또는 참여자 정보가 올바르지 않습니다.");
  }

  // shortcut: 공개 Presence는 호스트 신원을 보장하지 않음, 비공개 채널 도입 시 서버 권한 검증 필요.
  const supabase = createClient(false);
  const presenceKey = crypto.randomUUID();
  const channel = supabase.channel(`channel:${channelId}`, {
    config: { presence: { key: presenceKey } },
  });
  let isClosed = false;
  let isSubscribed = false;
  let isTracking = false;
  let isTracked = false;
  let hasJoined = false;
  const timer = setTimeout(
    () => fail(new Error("채널 연결 시간이 초과되었습니다.")),
    10000,
  );

  /**
   * 채널 구독과 입장 대기를 정리하는 함수.
   * @returns 채널 해제 완료 시 이행되는 Promise.
   * @throws 채널 해제 결과가 ok가 아닌 경우.
   */
  async function disconnectChannel() {
    if (isClosed) return;
    isClosed = true;
    clearTimeout(timer);
    const result = await supabase.removeChannel(channel);
    if (result !== "ok") throw new Error("채널 연결 해제에 실패했습니다.");
  }

  /**
   * 입장 오류 또는 호스트 종료 상태를 전달하고 연결을 정리하는 함수.
   * @param error 사용자에게 표시할 오류.
   * @param isEnded 호스트 퇴장으로 방이 종료되었는지 여부.
   * @returns 반환값 없음. 채널 해제 완료는 기다리지 않음.
   */
  function fail(error: unknown, isEnded = false) {
    if (isClosed) return;
    onStateChange({
      connection: "failed",
      participants: [],
      isEnded,
      error:
        error instanceof Error ? error.message : "채널 연결에 실패했습니다.",
    });
    void disconnectChannel().catch(console.error);
  }

  /**
   * 검증한 Presence 정보를 접속별 참여자 목록으로 변환하는 함수.
   * @returns 화면 공유용 세션과 구분되는 접속별 참여자 목록.
   */
  function getParticipants() {
    const participants: (Participant & {
      channelTitle: string;
      participantId: string;
    })[] = [];
    for (const [id, entries] of Object.entries(
      channel.presenceState<Record<string, unknown>>(),
    )) {
      if (id.length === 0 || id.length > 128) continue;
      for (const entry of entries) {
        if (!isChannelPresence(entry)) continue;
        participants.push({
          id,
          participantId: entry.participantId,
          nickname: entry.nickname,
          avatarIndex: entry.avatarIndex,
          isHost: entry.isHost,
          isSelf: id === presenceKey,
          status: "online",
          channelTitle: entry.channelTitle,
        });
        break;
      }
    }
    return participants;
  }

  /**
   * 첫 Presence 동기화 후 입장을 판정하고 참여자 변경을 전달하는 콜백.
   * @returns 참여자 등록과 상태 처리 완료 시 이행되는 Promise.
   */
  async function handlePresenceSync() {
    if (isClosed || !isSubscribed || isTracking) return;
    const participants = getParticipants();
    const hosts = participants
      .filter((participant) => participant.isHost)
      .sort((first, second) => first.id.localeCompare(second.id));

    if (!isTracked) {
      if (
        session.isHost &&
        hosts.some((host) => host.participantId === session.participantId)
      ) {
        return;
      }
      if (session.isHost ? hosts.length > 0 : hosts.length === 0) {
        fail(
          new Error(
            session.isHost
              ? "이미 사용 중인 채널 코드입니다. 새 채널을 만들어 주세요."
              : "호스트가 없는 채널에는 입장할 수 없습니다.",
          ),
        );
        return;
      }
      isTracking = true;
      try {
        const result = await channel.track(metadata);
        if (isClosed) return;
        if (result !== "ok") throw new Error("참여자 등록에 실패했습니다.");
        isTracked = true;
      } catch (error) {
        fail(error);
      } finally {
        isTracking = false;
      }
      if (!isClosed) void handlePresenceSync();
      return;
    }

    if (!participants.some((participant) => participant.isSelf)) return;
    const host = hosts[0];
    if (!host || (session.isHost && !host.isSelf)) {
      fail(
        new Error(
          session.isHost
            ? "이미 사용 중인 채널 코드입니다. 새 채널을 만들어 주세요."
            : "호스트가 채널을 나갔습니다.",
        ),
        hasJoined && !session.isHost,
      );
      return;
    }
    clearTimeout(timer);
    hasJoined = true;
    onStateChange({
      connection: "connected",
      participants,
      title: host.channelTitle || undefined,
      isEnded: false,
      error: null,
    });
  }

  channel
    .on("presence", { event: "sync" }, handlePresenceSync)
    .subscribe((status) => {
      if (isClosed) return;
      if (status !== "SUBSCRIBED") {
        fail(new Error(`채널 연결에 실패했습니다: ${status}`));
        return;
      }
      isSubscribed = true;
    });

  return disconnectChannel;
}
