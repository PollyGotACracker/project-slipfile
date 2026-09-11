import { useSyncExternalStore } from "react";
import type { ParticipantSession } from "@/types/participant";

function getStorageKey(roomId: string): string {
  return `slipfile:room:${roomId}`;
}

/**
 * 새 참여자 세션을 생성하는 함수.
 * room 진입 시 한 번만 호출하고, 이후에는 {@link loadParticipantSession}으로 재사용한다.
 */
export function createParticipantSession(
  nickname: string,
  avatarIndex: number,
  isHost: boolean,
): ParticipantSession {
  return {
    participantId: crypto.randomUUID(),
    nickname,
    avatarIndex,
    joinedAt: Date.now(),
    isHost,
  };
}

/**
 * roomId에 해당하는 참여자 세션을 sessionStorage에서 불러오는 함수.
 * 세션이 없거나 접근할 수 없으면 null을 반환한다.
 */
export function loadParticipantSession(
  roomId: string,
): ParticipantSession | null {
  try {
    const raw = sessionStorage.getItem(getStorageKey(roomId));
    if (!raw) return null;
    return JSON.parse(raw) as ParticipantSession;
  } catch {
    return null;
  }
}

/**
 * 참여자 세션을 sessionStorage에 저장하는 함수.
 * 저장에 실패해도 예외를 던지지 않는다.
 */
export function saveParticipantSession(
  roomId: string,
  participantSession: ParticipantSession,
): void {
  try {
    sessionStorage.setItem(
      getStorageKey(roomId),
      JSON.stringify(participantSession),
    );
  } catch {}
}

/**
 * 기존 참여자 세션이 있으면 닉네임·아바타만 갱신하고, 없으면 새로 생성하는 함수.
 * host 판별 기준이 깨지지 않도록 기존 세션은 덮어쓰지 않는다.
 */
export function upsertParticipantSession(
  roomId: string,
  nickname: string,
  avatarIndex: number,
  isHost: boolean,
): ParticipantSession {
  const existing = loadParticipantSession(roomId);
  const participantSession: ParticipantSession = existing
    ? { ...existing, nickname, avatarIndex }
    : createParticipantSession(nickname, avatarIndex, isHost);
  saveParticipantSession(roomId, participantSession);
  return participantSession;
}

/**
 * 참여자 세션 조회가 끝났는지와 그 결과를 함께 담는 타입.
 * {@link useParticipantSession}이 반환한다.
 */
export interface ParticipantSessionSnapshot {
  /** 클라이언트에서 sessionStorage 조회를 마쳤는지 여부 */
  resolved: boolean;
  session: ParticipantSession | null;
}

const UNRESOLVED_SNAPSHOT: ParticipantSessionSnapshot = {
  resolved: false,
  session: null,
};

const snapshotCache = new Map<
  string,
  { raw: string | null; snapshot: ParticipantSessionSnapshot }
>();

function getParticipantSessionSnapshot(
  roomId: string,
): ParticipantSessionSnapshot {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(getStorageKey(roomId));
  } catch {
    raw = null;
  }

  const cached = snapshotCache.get(roomId);
  if (cached && cached.raw === raw) {
    return cached.snapshot;
  }

  let session: ParticipantSession | null = null;
  if (raw) {
    try {
      session = JSON.parse(raw) as ParticipantSession;
    } catch {
      session = null;
    }
  }
  const snapshot: ParticipantSessionSnapshot = { resolved: true, session };
  snapshotCache.set(roomId, { raw, snapshot });
  return snapshot;
}

function getParticipantSessionServerSnapshot(): ParticipantSessionSnapshot {
  return UNRESOLVED_SNAPSHOT;
}

function subscribeToParticipantSession(): () => void {
  // 외부 변경을 구독할 필요 없음
  return () => {};
}

/**
 * roomId에 해당하는 참여자 세션을 sessionStorage에서 읽어오는 훅.
 * 서버 렌더링·최초 하이드레이션 동안 하이드레이션 오류를 피하기 위해 `resolved: false`를 반환하고,
 * 이후 클라이언트에서 실제 값으로 동기화된다.
 */
export function useParticipantSession(
  roomId: string,
): ParticipantSessionSnapshot {
  return useSyncExternalStore(
    subscribeToParticipantSession,
    () => getParticipantSessionSnapshot(roomId),
    getParticipantSessionServerSnapshot,
  );
}
