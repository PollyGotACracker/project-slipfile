/** Channel 페이지 경로를 반환하는 함수. */
export function getChannelPath(channelId: string): string {
  return `/channels/${channelId}`;
}

/**
 * Channel 참여 페이지 경로를 반환하는 함수.
 * 호스트와 게스트 모두 동일한 페이지가 표시된다.
 * 생성 의도는 안내용이며, 실제 생성·입장은 Presence 동기화 후 판정한다.
 */
export function getChannelJoinPath(
  channelId: string,
  options?: { asHost?: boolean },
): string {
  const base = `${getChannelPath(channelId)}/join`;
  return options?.asHost ? `${base}?intent=host` : base;
}
