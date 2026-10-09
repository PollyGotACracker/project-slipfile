/** 참여자의 연결 상태를 나타내는 타입. */
export type StatusTone =
  | "online" // 정상적으로 연결된 상태
  | "pending" // 연결을 시도하는 중인 상태
  | "offline" // 연결이 끊어진 상태
  | "error"; // 연결에 오류가 발생한 상태

/** Channel에 있는 참여자 한 명을 나타내는 타입. */
export interface Participant {
  /** 참여자를 식별하는 고유 id. */
  id: string;
  /** 참여자가 설정한 닉네임. */
  nickname: string;
  /** Channel을 개설한 호스트인지 여부. */
  isHost: boolean;
  /** 현재 화면을 보고 있는 본인인지 여부. */
  isSelf: boolean;
  /** 참여자의 연결 상태. */
  status: StatusTone;
  /**
   * `ParticipantAvatar`의 `AVATAR_ICONS` 배열 인덱스.
   * 참여자 세션이 없으면 값이 없을 수 있다.
   */
  avatarIndex?: number;
}

/** 참여자가 특정 channel에 있음을 나타내는 세션 정보 타입. */
export interface ParticipantSession {
  /** 참여자를 식별하는 고유 id. */
  participantId: string;
  /** 참여자가 설정한 닉네임. */
  nickname: string;
  /** `ParticipantAvatar`의 `AVATAR_ICONS` 배열 인덱스. */
  avatarIndex: number;
  /** 이 channel에 최초로 합류한 시각(ms 단위 타임스탬프). */
  joinedAt: number;
  /** 호스트가 설정한 방 제목. Presence로 게스트에게 전달하는 값. */
  channelTitle?: string;
  /**
   * "이 channel을 만들었다"는 힌트일 뿐, 진짜 권한의 근거는 아닌 값.
   * `participantId`/`joinedAt`처럼 세션 최초 생성 시점에만 고정된다.
   * 방 연결 시 Presence의 기존 호스트 여부와 함께 생성·입장 의도를 판정한다.
   */
  isHost: boolean;
}
