/** Room 채팅에 표시되는 메시지 한 건을 나타내는 타입. */
export interface ChatMessage {
  /** 메시지를 식별하는 고유 id. */
  id: string;
  /** 메시지를 보낸 참여자의 id. */
  participantId: string;
  /** 메시지를 보낸 참여자의 닉네임. */
  nickname: string;
  /** 메시지를 보낸 참여자의 아바타 인덱스. 참여자 목록의 아바타와 동일한 아이콘을 표시하는 데 사용한다. */
  avatarIndex: number;
  /** 현재 화면을 보고 있는 본인이 보낸 메시지인지 여부. */
  isSelf: boolean;
  /** 메시지 본문. */
  body: string;
  /** 메시지를 보낸 시각(ms 단위 타임스탬프). */
  sentAt: number;
}
