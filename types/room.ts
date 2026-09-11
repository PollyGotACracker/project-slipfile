/** Room의 WebRTC 연결 상태를 나타내는 타입. */
export type ConnectionState =
  | "connecting" // 연결을 시도하는 중
  | "connected" // 연결이 정상적으로 이루어진 상태
  | "degraded" // 연결은 유지되지만 불안정한 상태
  | "failed"; // 연결이 끊어진 상태

/** 호스트의 화면 공유 상태를 나타내는 타입. */
export type ScreenShareState =
  | "idle" // 공유하지 않는 상태
  | "sharing" // 호스트가 화면을 공유 중인 상태
  | "unavailable"; // 이 환경에서 화면 공유를 지원하지 않는 상태
