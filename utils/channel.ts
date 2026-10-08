/** 새로운 Channel 코드를 생성하는 함수. */
export function generateMockChannelCode(): string {
  const code = crypto.randomUUID().slice(0, 8).toUpperCase();
  return code;
}

// TODO: 목데이터. ChannelJoinView에서 호스트가 입력한 제목을 실제로 저장하도록 연동한다.
export const MOCK_CHANNEL_TITLE: string | undefined = "금요일 저녁 스터디";

/** Channel 페이지 경로를 반환하는 함수. */
export function getChannelPath(channelId: string): string {
  return `/channels/${channelId}`;
}

/**
 * Channel 참여 페이지 경로를 반환하는 함수.
 * 호스트와 게스트 모두 동일한 페이지가 표시된다.
 * TODO: 실제 호스트 판별은 Presence 참여 순서 연동 후 그 값으로 계산한다.
 */
export function getChannelJoinPath(
  channelId: string,
  options?: { asHost?: boolean },
): string {
  const base = `${getChannelPath(channelId)}/join`;
  return options?.asHost ? `${base}?intent=host` : base;
}
