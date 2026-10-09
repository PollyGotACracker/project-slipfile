# Slipfile 구현 계획

작성 날짜: 2026. 10. 07.
수정 날짜: 2026. 10. 07.

이 문서는 임시 Channel의 화면 공유, 채팅, 파일 전송을 구현할 개발자를 위한 설계안이다.
코드는 사용할 API와 핵심 처리 흐름을 보여주는 구현 예시이다.
완성된 애플리케이션이나 실행 검증을 마친 코드로 취급하지 않는다.

## 확인한 현재 상태

- **서비스 요구사항**
  - 임시 Channel 생성과 입장을 구현한다.
  - URL과 QR 코드로 Channel을 공유한다.
  - 호스트의 기기 화면 또는 카메라 화면을 공유한다.
  - 참여자 채팅, 파일 전송, 브라우저 파일 열기, 다운로드를 구현한다.
    근거: `AGENTS.md:15`
- **데이터 처리 원칙**
  - Channel과 Participant 정보를 DB에 저장하지 않는다.
  - 파일을 서버나 Supabase Storage에 저장하지 않는다.
  - Presence로 참여자 상태를 관리한다.
  - Broadcast로 WebRTC Signaling을 전달한다.
  - RTCDataChannel로 파일을 전달한다.
    근거: `AGENTS.md:32`
- **현재 코드**
  - `app/page.tsx:1`은 Next.js 초기 화면이다.
  - `database/client.ts:1`은 기존 Supabase 브라우저 클라이언트 생성 함수이다.
  - `database/server.ts:1`은 서버용 Supabase 클라이언트 생성 함수이다.
  - `database/schema.sql`은 확인 시점에 0바이트이다.
  - `package.json:12`에는 Next.js 16.3.4와 Supabase JS ^2.116.0이 선언되어 있다.
  - 로컬 설정에서는 Realtime이 활성화되어 있다.
  - 로컬 설정에서는 Supabase anonymous sign-in이 비활성화되어 있다.
    근거: `supabase/config.toml:86`, `supabase/config.toml:177`
- **조사 보고서**
  - `deep-research-report.md:1`부터 414행까지 확인했다.
  - 핵심 WebRTC API, 네트워크 구조, 모바일 수명주기, 파일 전송 제약을 구현 근거로 사용한다.
  - 보고서의 내부 citation 식별자 대신 열람 가능한 공식 링크를 사용한다.

## 구현 구조

- **호스트 중심 영상과 참여자 간 데이터 연결을 제안한다.** [추론]
  호스트만 화면을 공유하지만 파일과 채팅은 참여자 사이에 전달해야 한다.
  영상은 호스트에서 각 게스트로 보내고 데이터는 참여자 쌍마다 직접 연결하면 기존 데이터 처리 원칙을 유지할 수 있다.
  근거: `AGENTS.md:19`, `AGENTS.md:38`, `deep-research-report.md:214`
- **브라우저가 서비스 상태를 소유한다.**
  - Channel, 참여자 목록, 채팅, 전송 진행률은 메모리에 둔다.
  - 기존 `database/client.ts`를 재사용한다.
  - Supabase DB 쿼리와 Storage 업로드는 사용하지 않는다.
  - 새로고침이나 브라우저 종료 후 기록 복원을 보장하지 않는다.
- **영상은 호스트에서 게스트로 전달한다.**
  - 호스트와 각 게스트 사이에 RTCPeerConnection을 만든다.
  - 호스트의 video track을 각 연결의 RTCRtpSender에 연결한다.
  - 게스트는 `track` 이벤트로 영상을 수신한다.
- **채팅과 파일은 참여자 사이에 전달한다.**
  - 참여자 쌍마다 하나의 RTCPeerConnection을 유지한다.
  - 호스트와 게스트의 연결은 영상과 데이터를 함께 처리한다.
  - 게스트끼리의 연결은 데이터만 처리한다.
  - 채팅과 파일 전송 제어는 별도 DataChannel을 사용한다.
  - 수락한 파일마다 별도의 DataChannel을 만들어 파일 경계를 구분한다.
- **연결 수와 비용**
  - 전체 참여자가 N명일 때 참여자 쌍의 연결 수는 `N(N-1)/2`이다.
  - 게스트가 G명이고 영상 비트레이트가 R이면 호스트 영상 업로드는 단순 모델에서 `G × R`이다.
  - 같은 파일을 G명에게 보내면 송신자는 파일 내용을 G번 전송한다.
  - 참여자 상한과 영상 품질은 실제 기기와 네트워크 측정 후 결정한다.
    근거: `deep-research-report.md:223`

```text
참여자 ↔ Supabase Presence: 접속 상태
참여자 ↔ Supabase Broadcast: SDP와 ICE
호스트 → WebRTC 영상 → 각 게스트
참여자 ↔ RTCDataChannel → 채팅과 파일
연결 실패 → TURN 경유 재시도
```

## 기능과 API

| **기능**     | **주요 API**                               | **보관 위치**     |
| :----------- | :----------------------------------------- | :---------------- |
| Channel 생성 | `crypto.randomUUID()`                      | 브라우저 메모리   |
| URL 공유     | `URL`, `navigator.clipboard.writeText()`   | 공유 URL          |
| QR 생성      | 로컬 QR 인코더의 `toCanvas()`              | 브라우저 canvas   |
| 참여자 상태  | `channel()`, `track()`, `presenceState()`  | Realtime Presence |
| Signaling    | `on("broadcast")`, `send()`                | Realtime 메시지   |
| 화면 공유    | `getDisplayMedia()`                        | MediaStream       |
| 카메라 공유  | `getUserMedia()`                           | MediaStream       |
| 영상 전송    | `addTransceiver()`, `replaceTrack()`       | RTCPeerConnection |
| 영상 수신    | `track`, `video.srcObject`                 | 브라우저 메모리   |
| 채팅         | `createDataChannel()`, `send()`, `message` | 브라우저 메모리   |
| 파일 전송    | `File.slice()`, `arrayBuffer()`, `send()`  | 송수신 브라우저   |
| 혼잡 제어    | `bufferedAmount`, `bufferedamountlow`      | 송신 버퍼         |
| 파일 열기    | `Blob`, `URL.createObjectURL()`            | 브라우저 메모리   |
| 다운로드     | `<a download>`                             | 사용자 기기       |
| 연결 복구    | `restartIce()`, 연결 상태 이벤트           | 브라우저 메모리   |
| 자원 정리    | `stop()`, `close()`, `removeChannel()`     | 해당 연결         |

## Channel과 공유

- **생성 절차**
  1.  사용자 동작으로 Channel ID와 현재 접속의 Participant ID를 생성한다.
  2.  해당 Channel의 Realtime 채널에 구독한다.
  3.  구독과 Presence 등록이 성공하면 Channel이 열렸다고 표시한다.
  4.  공유 URL과 QR 코드를 표시한다.
- **입장 절차**
  1.  URL의 Channel ID 형식을 검사한다.
  2.  새 Participant ID를 생성한다.
  3.  채널을 구독하고 Presence 상태를 확인한다.
  4.  호스트가 없으면 기다림 또는 종료 상태를 표시한다.
  5.  호스트의 존재 확인과 참여자 연결 완료를 구분한다.
- **Channel ID는 인증 수단이 아니다.**
  - UUID는 충돌 위험을 줄이는 식별자이다.
  - 공개 채널에서는 링크를 아는 클라이언트가 접근할 수 있다.
  - URL의 host ID나 Presence의 role을 신뢰할 수 있는 호스트 인증으로 취급하지 않는다.

```ts
function createChannelLink() {
  const channelId = crypto.randomUUID();
  const participantId = crypto.randomUUID();
  const url = new URL("/channel", window.location.origin);
  url.hash = new URLSearchParams({ channelId }).toString();
  return { channelId, participantId, url: url.toString() };
}

async function copyChannelLink(url: string) {
  await navigator.clipboard.writeText(url);
}
```

- **초기 경로는 `/channel#channelId=...`를 제안한다.**
  - 고정 `/channel` 페이지에서 hash를 읽으면 임의 Channel ID마다 서버 경로를 만들 필요가 없다.
  - hash는 인증이나 비밀 보관 기능을 제공하지 않는다.
  - 동적 경로를 선택하면 Next.js 16.3.4 가이드에 따라 `params` Promise를 처리한다.
    근거: 설치된 Next.js `dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`
- **QR 생성 방식은 구현 전에 선택한다.**
  - 로컬 QR 인코더를 사용하면 공유 URL을 외부 QR 서비스에 전달하지 않는다.
  - 외부 QR 생성 서비스는 의존성을 줄이지만 Channel URL을 외부로 전송한다.
  - 로컬 인코더 추가를 권고하며 현재는 의존성을 추가하지 않는다.
  - 브라우저의 BarcodeDetector는 QR 생성 API가 아니다.
  - 다음 예시는 `qrcode` 채택이 승인된 경우의 API 사용법이다.
    근거: [node-qrcode 공식 저장소](https://github.com/soldair/node-qrcode)

```ts
import QRCode from "qrcode";

async function renderChannelQr(canvas: HTMLCanvasElement, url: string) {
  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: "M",
    width: 256,
  });
}
```

## Presence와 Signaling

- **Presence**
  - 접속마다 다른 key를 사용한다.
  - 재구독 후 `track()`을 다시 실행한다.
  - `sync`의 전체 상태를 기준으로 참여자 목록을 갱신한다.
  - `join`과 `leave` 하나만으로 실제 입퇴장을 확정하지 않는다.
  - Presence metadata도 외부 입력으로 검증한다.
    근거: [Supabase Presence](https://supabase.com/docs/guides/realtime/presence)
- **Broadcast**
  - SDP와 ICE만 전달한다.
  - 파일 본문은 전달하지 않는다.
  - `ack: true`는 Supabase 서버 수신 확인이다.
  - 상대 브라우저가 메시지를 처리했다는 확인으로 사용하지 않는다.
  - 대상 Participant ID는 클라이언트 라우팅 정보이다.
  - 같은 채널의 다른 참여자에게 메시지를 숨기는 접근 제어가 아니다.
    근거: [Supabase Broadcast](https://supabase.com/docs/guides/realtime/broadcast)

```ts
import { createClient } from "@/database/client";

type SignalBody =
  | { description: RTCSessionDescriptionInit }
  | { candidate: RTCIceCandidateInit };

type SignalMessage = {
  version: 1;
  channelId: string;
  from: string;
  to: string;
  connectionId: string;
  body: SignalBody;
};

function createChannelChannel(channelId: string, participantId: string) {
  const supabase = createClient();
  const channel = supabase.channel(`channel:${channelId}`, {
    config: {
      presence: { key: participantId },
      broadcast: { ack: true, self: false },
    },
  });
  return { supabase, channel };
}

async function sendSignal(
  channel: ReturnType<typeof createChannelChannel>["channel"],
  payload: SignalMessage,
) {
  const result = await channel.send({
    type: "broadcast",
    event: "signal",
    payload,
  });
  if (result !== "ok") {
    throw new Error(`Signaling 전송 실패: ${result}`);
  }
}
```

- **구독 연결**
  - `on()`으로 모든 수신 핸들러를 등록한 다음 `subscribe()`를 호출한다.
  - `SUBSCRIBED`일 때만 정상 송신과 Presence 등록을 시작한다.
  - `track()`의 결과도 `"ok"`인지 확인한다.
  - `CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`를 UI와 복구 상태에 반영한다.
  - 자동 재접속 중에는 새로운 파일 전송을 시작하지 않는다.
    근거: 설치된 Realtime JS 2.116.0 `src/RealtimeChannel.ts`
- **수신 검증**
  - 수신 payload를 `unknown`으로 취급한다.
  - version, Channel ID, 발신자, 수신자, connection ID를 검사한다.
  - SDP type은 offer와 answer만 허용한다.
  - SDP 문자열과 candidate 필드의 타입 및 길이를 제한한다.
  - 현재 연결에 속하지 않는 이전 메시지는 폐기한다.
  - 발신자 필드만으로 상대 신원을 인증하지 않는다.
  - SDP와 ICE를 콘솔에 무조건 기록하지 않는다.

## WebRTC 연결

- **협상 역할**
  - 호스트가 포함된 연결에서는 호스트만 offer를 만든다.
  - 게스트끼리는 Participant ID 비교로 한쪽만 offer를 만든다.
  - 호스트 연결에는 video transceiver를 처음부터 만든다.
  - 게스트는 video track을 추가하지 않는다.
  - 이 조건을 바꾸어 양쪽에서 협상하게 되면 perfect negotiation을 적용한다.
    근거: [WebRTC 협상 패턴](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation)
- **ICE 처리**
  - `icecandidate` 이벤트에서 candidate를 Broadcast로 전달한다.
  - remote description보다 먼저 받은 candidate는 연결별 큐에 보관한다.
  - remote description 적용 후 큐를 순서대로 비운다.
  - 연결별 수신 작업을 Promise 체인으로 직렬화한다.
  - 연결 교체 시 이전 candidate 큐와 connection ID를 폐기한다.

```ts
function createPeer(
  configuration: RTCConfiguration,
  isOfferer: boolean,
  isHost: boolean,
  send: (body: SignalBody) => Promise<void>,
  onError: (error: unknown) => void,
) {
  const pc = new RTCPeerConnection(configuration);
  const pendingCandidates: RTCIceCandidateInit[] = [];
  let signalQueue = Promise.resolve();
  const sender = isHost
    ? pc.addTransceiver("video", { direction: "sendonly" }).sender
    : undefined;

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      void send({ candidate: candidate.toJSON() }).catch(onError);
    }
  };

  pc.onnegotiationneeded = async () => {
    if (!isOfferer) return;
    try {
      await pc.setLocalDescription();
      if (pc.localDescription) {
        await send({ description: pc.localDescription.toJSON() });
      }
    } catch (error) {
      onError(error);
    }
  };

  function handleSignal(body: SignalBody) {
    signalQueue = signalQueue
      .then(async () => {
        if ("description" in body) {
          await pc.setRemoteDescription(body.description);
          for (const candidate of pendingCandidates.splice(0)) {
            await pc.addIceCandidate(candidate);
          }
          if (body.description.type === "offer") {
            await pc.setLocalDescription();
            if (pc.localDescription) {
              await send({ description: pc.localDescription.toJSON() });
            }
          }
        } else if (pc.remoteDescription) {
          await pc.addIceCandidate(body.candidate);
        } else {
          pendingCandidates.push(body.candidate);
        }
      })
      .catch(onError);
    return signalQueue;
  }

  return { pc, sender, handleSignal };
}
```

- **코드 접속 조건**
  - `handleSignal()`에는 앞 절의 검증을 통과한 현재 연결 메시지만 전달한다.
  - `onError()`는 협상 실패를 화면에 표시하고 해당 연결을 정리한다.
  - offerer가 채팅 DataChannel을 만들면 최초 협상이 시작된다.
  - 새 연결의 핸들러를 등록한 뒤 DataChannel을 생성한다.
  - offer 진행 중 추가 협상 요청과 ICE restart를 직접 겹쳐 실행하지 않는다.
  - candidate 큐의 개수와 협상 대기 시간을 제한한다.

## 화면과 카메라

- **캡처**
  - 화면 공유 버튼에서 즉시 `getDisplayMedia()`를 호출한다.
  - 화면 선택을 요청하기 전에 비동기 네트워크 요청을 기다리지 않는다.
  - 화면 공유 권한은 매번 다시 요청될 수 있다.
  - 초기 예시는 요구사항에 명시된 영상만 캡처한다.
  - 마이크와 시스템 오디오는 별도 요구사항으로 확정한다.
    근거: [W3C Screen Capture](https://www.w3.org/TR/screen-capture/)

```ts
async function captureScreen() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("이 환경에서는 화면 공유를 지원하지 않습니다.");
  }
  return navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 15 } },
    audio: false,
  });
}

async function captureCamera() {
  return navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    },
    audio: false,
  });
}

async function setSharedVideo(sender: RTCRtpSender, stream: MediaStream) {
  const track = stream.getVideoTracks()[0];
  if (!track) throw new Error("공유할 영상 track이 없습니다.");
  await sender.replaceTrack(track);
}

function setRemoteVideo(pc: RTCPeerConnection, video: HTMLVideoElement) {
  pc.ontrack = ({ track, streams }) => {
    video.srcObject = streams[0] ?? new MediaStream([track]);
    void video.play().catch(() => {
      video.controls = true;
    });
  };
}
```

- **공유 변경과 종료**
  - 현재 stream을 저장하고 새로 입장한 게스트의 sender에도 연결한다.
  - 모든 게스트의 sender 교체 결과를 확인한다.
  - 일부 교체 실패 시 해당 게스트를 실패 상태로 표시하고 연결을 복구한다.
  - 기존 stream은 교체 결과를 처리한 다음 종료한다.
  - `replaceTrack()`이 재협상 필요 오류를 내면 새 연결로 복구한다.
  - 화면 선택 UI의 공유 중지는 track의 `ended` 이벤트로 처리한다.
  - 앱의 공유 중지는 sender의 `replaceTrack(null)`과 track의 `stop()`으로 처리한다.
  - 직접 `stop()`한 경우 종료 UI도 직접 갱신한다.
    근거: [replaceTrack 제약](https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack)

## 채팅

- **송신**
  - reliable, ordered DataChannel을 사용한다.
  - 연결된 각 참여자에게 같은 message ID로 전달한다.
  - 일부 참여자에게 전달하지 못하면 부분 전송 상태를 표시한다.
  - 송신 성공을 상대의 읽음 상태로 표시하지 않는다.
- **수신**
  - JSON parsing 오류를 처리한다.
  - 메시지 type, ID, 문자열 길이를 검증한다.
  - 발신자는 현재 DataChannel이 연결된 상대의 식별자를 사용한다.
  - payload 안의 발신자 이름을 신원 증명으로 사용하지 않는다.
  - 중복 ID를 제거한다.
  - React 텍스트로 렌더링하고 수신 문자열을 HTML로 삽입하지 않는다.

```ts
function createChatChannel(pc: RTCPeerConnection) {
  return pc.createDataChannel("chat", { ordered: true });
}

function sendChat(channel: RTCDataChannel, text: string) {
  const message = text.trim();
  if (!message) return;
  if (channel.readyState !== "open") {
    throw new Error("채팅 연결이 열리지 않았습니다.");
  }
  channel.send(
    JSON.stringify({
      type: "chat",
      id: crypto.randomUUID(),
      text: message,
    }),
  );
}
```

## 파일 전송

- **전송 절차**
  1.  제어 채널로 파일 ID, 이름, 크기를 제안한다.
  2.  수신자는 크기와 보관 가능 여부를 확인하고 수락하거나 거절한다.
  3.  수락한 파일에 해당하는 DataChannel을 연결한다.
  4.  송신자는 파일을 잘라 ArrayBuffer로 전송한다.
  5.  수신자는 실제 누적 바이트와 예정 크기를 대조한다.
  6.  송신자는 종료 메시지를 보낸다.
  7.  수신자는 Blob 생성 후 완료 응답을 보낸다.
  8.  송신자는 완료 응답을 받은 뒤 완료 상태를 표시한다.
- **전송 채널**
  - 파일마다 새 채널을 사용해 다른 파일의 청크가 섞이지 않게 한다.
  - `ordered: true`와 기본 reliable 전송을 사용한다.
  - `maxRetransmits`와 `maxPacketLifeTime`을 지정하지 않는다.
  - 협상된 `pc.sctp.maxMessageSize`를 초과하지 않는다.
  - 다음 16 KiB 청크와 256 KiB 버퍼는 초기 제안값이며 검증된 최적값이 아니다.
    근거: [RTCDataChannel.send](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/send)

```ts
function waitForSendCapacity(channel: RTCDataChannel) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(
      () => finish(new Error("파일 전송 버퍼 대기 시간 초과")),
      30_000,
    );
    function finish(error?: Error) {
      clearTimeout(timer);
      channel.removeEventListener("bufferedamountlow", handleLow);
      channel.removeEventListener("close", handleClose);
      channel.removeEventListener("error", handleClose);
      if (error) reject(error);
      else resolve();
    }
    function handleLow() {
      finish();
    }
    function handleClose() {
      finish(new Error("파일 전송 연결 종료"));
    }
    channel.addEventListener("bufferedamountlow", handleLow);
    channel.addEventListener("close", handleClose);
    channel.addEventListener("error", handleClose);
    if (channel.readyState !== "open") handleClose();
    else if (channel.bufferedAmount <= channel.bufferedAmountLowThreshold) {
      handleLow();
    }
  });
}

async function sendAcceptedFile(
  pc: RTCPeerConnection,
  channel: RTCDataChannel,
  file: File,
) {
  const negotiatedLimit = pc.sctp?.maxMessageSize;
  const chunkSize =
    negotiatedLimit && negotiatedLimit > 0
      ? Math.min(16 * 1024, negotiatedLimit)
      : 16 * 1024;
  channel.bufferedAmountLowThreshold = 256 * 1024;

  for (let offset = 0; offset < file.size; offset += chunkSize) {
    await waitForSendCapacity(channel);
    const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
    if (channel.readyState !== "open") {
      throw new Error("파일 전송 연결 종료");
    }
    channel.send(chunk);
  }
  await waitForSendCapacity(channel);
  channel.send("eof");
}
```

- **송신 함수의 연결 조건**
  - 수락이 확인되고 채널이 열린 다음 호출한다.
  - 완료 응답 수신 핸들러는 송신 전에 등록한다.
  - `"eof"` 송신은 수신 완료를 의미하지 않는다.
  - 수신 완료 응답에도 대기 시간 제한을 둔다.
  - 취소 시 파일 채널을 닫아 대기와 다음 송신을 중단한다.
    근거: [DataChannel 버퍼 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/bufferedAmountLowThreshold)

```ts
function receiveAcceptedFile(
  channel: RTCDataChannel,
  expectedSize: number,
  maxFileBytes: number,
  onComplete: (blob: Blob) => void,
  onError: (error: unknown) => void,
) {
  if (
    !Number.isSafeInteger(expectedSize) ||
    expectedSize < 0 ||
    expectedSize > maxFileBytes
  ) {
    throw new Error("허용하지 않는 파일 크기입니다.");
  }
  channel.binaryType = "arraybuffer";
  let chunks: ArrayBuffer[] = [];
  let receivedBytes = 0;
  let isComplete = false;

  function handleFailure(error: unknown) {
    chunks = [];
    channel.close();
    onError(error);
  }

  channel.onmessage = ({ data }: MessageEvent<unknown>) => {
    try {
      if (isComplete) throw new Error("완료 후 추가 데이터 수신");
      if (data instanceof ArrayBuffer) {
        if (receivedBytes + data.byteLength > expectedSize) {
          throw new Error("예정 크기를 초과한 파일 수신");
        }
        chunks.push(data);
        receivedBytes += data.byteLength;
      } else if (data === "eof" && receivedBytes === expectedSize) {
        const blob = new Blob(chunks, { type: "application/octet-stream" });
        chunks = [];
        onComplete(blob);
        channel.send("complete");
        isComplete = true;
      } else {
        throw new Error("잘못되었거나 불완전한 파일 전송");
      }
    } catch (error) {
      handleFailure(error);
    }
  };
  channel.onclose = () => {
    chunks = [];
    if (!isComplete) onError(new Error("파일 수신 중 연결 종료"));
  };
  channel.onerror = () => {
    handleFailure(new Error("파일 수신 채널 오류"));
  };
}
```

- **수신 함수의 연결 조건**
  - 파일 제안 검증과 사용자 수락 후에만 등록한다.
  - 수신 허용 파일 ID와 channel label을 대조한다.
  - `maxFileBytes`는 서비스에서 정한 메모리 한도로 전달한다.
  - 개별 파일 한도 외에 동시 수신 파일 수와 총 보관 바이트도 제한한다.
  - 빈 파일은 0바이트 수신 후 `"eof"`로 완료한다.
  - 장시간 아무 데이터도 오지 않으면 채널을 닫고 청크를 해제한다.
  - 종료·오류 알림은 실제 UI 연결 시 중복 호출되지 않도록 처리한다.
  - 이 방식은 파일 전체를 메모리에 모으므로 대용량 파일을 무제한 지원하지 않는다.
  - 재개 전송과 전체 파일 hash 검증은 별도 구현 범위이다.

## 파일 열기와 다운로드

- **파일 실행의 범위**
  - 이미지, 텍스트, 브라우저가 지원하는 영상과 오디오는 열기를 제공한다.
  - 실행 파일과 설치 파일은 다운로드만 제공한다.
  - HTML 실행은 사용자 선택 후 격리된 iframe에서만 제공한다.
  - 수신 파일의 확장자와 MIME 선언을 안전성 증명으로 사용하지 않는다.
  - 미리보기용 형식을 결정하기 전에는 일반 binary Blob으로 보관한다.
- **HTML 격리**
  - `allow-scripts`를 사용하면 수신 HTML의 JavaScript가 실행된다.
  - `allow-same-origin`은 함께 추가하지 않는다.
  - script 실행이 필요 없는 문서는 빈 sandbox를 사용한다.
  - sandbox는 HTML의 외부 네트워크 요청까지 모두 차단하지 않는다.
  - 불특정 사용자의 HTML을 안전하게 실행한다고 보장하려면 별도 origin과 CSP 설계가 필요하다.
  - 여러 파일의 상대 경로와 외부 의존성은 단일 Blob URL만으로 재현되지 않는다.
    근거: [iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe)

```tsx
function HtmlPreview({ url }: { url: string }) {
  return (
    <iframe
      title="수신 HTML 미리보기"
      src={url}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
    />
  );
}

function createReceivedFileUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}

function FileDownload({ url, name }: { url: string; name: string }) {
  return (
    <a href={url} download={name}>
      파일 다운로드
    </a>
  );
}
```

- **URL 수명**
  - 미리보기와 다운로드가 사용하는 동안 object URL을 유지한다.
  - 파일 제거, 미리보기 해제, Channel 종료 시 `URL.revokeObjectURL()`을 호출한다.
  - 다운로드 클릭 직후 URL을 즉시 폐기하지 않는다.
  - 파일명에서 경로 문자와 제어 문자를 제거하고 길이를 제한한다.
    근거: [Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static)

## 인프라와 보안

- **서버 의존성**
  - 별도 Channel DB와 파일 저장 서버 없이 구현할 수 있다.
  - Supabase Realtime 서버는 Presence와 Signaling에 필요하다.
  - NAT와 방화벽 환경에서 연결하려면 TURN이 필요할 수 있다.
  - TURN은 암호화된 영상과 파일 패킷을 중계할 수 있다.
  - 파일을 저장하지 않는 것과 파일 패킷이 서버를 경유하지 않는 것은 다른 조건이다.
    근거: [WebRTC TURN 안내](https://webrtc.org/getting-started/turn-server)
- **TURN 설정**
  - `new RTCPeerConnection({ iceServers })`로 설정한다.
  - 장기 TURN 비밀번호를 `NEXT_PUBLIC_*`나 브라우저 번들에 넣지 않는다.
  - 단기 자격 증명 발급은 신뢰할 수 있는 backend 또는 관리형 서비스로 처리한다.
  - 자격 증명 발급 주체와 제공자는 현재 미확정이다.
  - 직접 연결이 불가능한 환경과 TURN-only 환경을 실제로 검증한다.
- **Channel 접근 제어**
  - 공개 채널과 링크 기반 입장은 인증된 비공개 Channel과 다르다.
  - private 채널은 인증과 Realtime RLS 정책이 필요하다.
  - anonymous sign-in도 인증 사용자 데이터를 생성하므로 무단 도입하지 않는다.
  - Channel과 Participant 행을 저장하지 않는다면 서명된 JWT claim을 검증하는 정책을 검토할 수 있다.
  - JWT 발급·갱신·만료·호스트 권한 검증은 신뢰할 수 있는 발급 주체가 필요하다.
  - 채널 접근 권한과 개별 Broadcast 발신자의 신원 검증을 구분한다.
    근거: [Supabase Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)
- **키 관리**
  - 기존 publishable key는 브라우저 클라이언트에 사용한다.
  - secret key와 service role 자격 증명은 클라이언트에 넣지 않는다.
- **IP와 통신 보안**
  - WebRTC는 전송 암호화를 제공한다.
  - 이 사실만으로 호스트 인증과 Signaling 위변조 방지가 해결되지는 않는다.
  - 직접 연결은 상대에게 네트워크 주소 정보를 노출할 수 있다.
  - IP 비공개가 요구되면 `iceTransportPolicy: "relay"`를 검토한다.
  - relay 정책은 TURN 가용성과 중계 비용에 의존한다.
    근거: [W3C WebRTC](https://www.w3.org/TR/webrtc/)

## 브라우저 제약

- **권한과 HTTPS**
  - 카메라와 화면 캡처는 secure context와 사용자 권한이 필요하다.
  - 거절, 장치 없음, 권한 요청 대기를 구분한다.
  - 화면 공유는 지원 여부를 검사하고 사용자 동작에서 호출한다.
  - 시스템 오디오 공유는 환경에 따라 제공되지 않는다.
    근거: [getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
- **모바일**
  - 카메라 지원으로 기기 화면 공유 지원까지 판단하지 않는다.
  - 미지원 환경에서는 화면 공유 버튼을 비활성화하고 카메라 공유를 제공한다.
  - iOS 브라우저의 기능을 desktop Chrome 버전으로 추정하지 않는다.
  - 실제 기기에서 API 검사와 권한 요청 결과를 확인한다.
    근거: `deep-research-report.md:111`
- **백그라운드**
  - 화면 잠금과 앱 전환 중 지속 전송을 보장하지 않는다.
  - Service Worker에 RTCPeerConnection을 옮겨 연결을 유지하는 구조로 만들지 않는다.
  - `visibilitychange` 복귀 시 track과 연결 상태를 확인한다.
  - 화면 공유 재시작에는 다시 사용자 동작이 필요할 수 있다.
    근거: `deep-research-report.md:118`, `deep-research-report.md:136`
- **규모와 한도**
  - Realtime 연결 수와 메시지 한도는 사용 중인 요금제와 설정을 확인한다.
  - 가격이나 참여자 상한을 조사 보고서의 고정 숫자로 확정하지 않는다.
  - `getStats()`로 실제 비트레이트, 손실, RTT를 확인한다.
    근거: [Supabase Realtime Limits](https://supabase.com/docs/guides/realtime/limits)

## 복구와 종료

- **복구**
  - `disconnected`를 즉시 영구 실패로 취급하지 않는다.
  - `failed` 상태에서는 지정된 offerer가 ICE restart를 수행한다.
  - 제한된 재시도 후에도 실패하면 연결을 닫고 새 connection ID로 다시 연결한다.
  - Realtime 재구독 후 Presence를 다시 등록한다.
  - 파일 전송 중 연결이 끊기면 실패로 표시하고 재전송을 제안한다.
  - 이미 받은 일부 청크를 완성된 파일로 제공하지 않는다.
- **종료**
  - 캡처 track을 종료한다.
  - DataChannel과 RTCPeerConnection을 닫는다.
  - 모든 타이머와 이벤트 리스너를 해제한다.
  - Presence 등록과 Realtime 채널을 해제한다.
  - Blob, 청크, object URL을 해제한다.
  - React Effect cleanup은 개발 모드의 재실행에도 안전하게 작성한다.
- **호스트 퇴장**
  - 호스트 퇴장 시 Channel 종료를 초기 정책으로 제안한다.
  - 호스트 자동 승계는 현재 요구사항에 없으므로 포함하지 않는다.
  - Presence 기반 퇴장 감지에는 지연이 있을 수 있다.
  - DB 없는 공개 채널에서는 URL의 영구 만료를 서버 권한으로 보장할 수 없다.

## 구현 위치

아래는 실제 기능 구현 시의 파일 배치 제안이다.
이 문서를 생성하는 작업에서는 아래 파일을 생성하거나 수정하지 않는다.

```text
app/
├── page.tsx
└── channel/
    ├── page.tsx
    └── ChannelClient.tsx
components/
├── SharedVideo.tsx
├── ParticipantList.tsx
├── ChatPanel.tsx
└── FilePanel.tsx
lib/
├── channel-session.ts
├── peer-connection.ts
└── file-transfer.ts
database/
└── client.ts
```

- **Next.js 경계**
  - ChannelClient에 `"use client"`를 선언한다.
  - `window`, `navigator`, WebRTC 객체 생성은 Effect나 이벤트 핸들러에서 수행한다.
  - 모듈 최상위와 서버 렌더링 중 브라우저 API를 호출하지 않는다.
  - server용 Supabase 클라이언트로 WebRTC를 실행하지 않는다.
    근거: [Next.js use client](https://nextjs.org/docs/app/api-reference/directives/use-client)
- **초기 구현 제외**
  - SFU, MCU, WebTransport, WebCodecs, 영상 효과를 추가하지 않는다.
  - 녹화, 서버 파일 보관, 전송 기록 복원, 호스트 승계를 추가하지 않는다.
  - Encoded Transform 기반 별도 E2EE는 초기 P2P 요구사항의 필수 요소로 넣지 않는다.
  - 초기 서비스 요구사항과 보안 요구가 달라질 때 다시 판단한다.
    근거: `AGENTS.md:15`, `deep-research-report.md:297`

## 검증 기준

1. **Channel과 Presence**
   - DB 쓰기 없이 생성과 입장이 동작하는지 확인한다.
   - 재구독, 중복 탭, 호스트 종료 시 목록과 상태를 확인한다.
   - 잘못된 Channel ID와 호스트가 없는 URL을 확인한다.
2. **Signaling과 연결**
   - SDP 전에 도착한 ICE와 이전 connection ID를 확인한다.
   - 동시 입장, 재접속, 협상 실패를 확인한다.
   - 같은 LAN, 서로 다른 네트워크, TURN-only 연결을 확인한다.
3. **영상**
   - 권한 거절, 카메라 없음, 화면 선택 취소를 확인한다.
   - 화면과 카메라 전환, 공유 종료, 늦은 입장을 확인한다.
   - 모바일 미지원, 앱 전환, 잠금 후 복귀를 확인한다.
4. **채팅**
   - 잘못된 JSON, 과대 메시지, 중복 ID, HTML 문자열을 확인한다.
   - 일부 연결 실패가 부분 전송 상태로 표시되는지 확인한다.
5. **파일**
   - 빈 파일, 청크 경계 크기, 최대 허용 파일을 확인한다.
   - 수락과 거절, 취소, 연결 종료, 완료 응답 누락을 확인한다.
   - 예정 크기 초과와 부족 수신을 확인한다.
   - 한 명 또는 여러 명에게 보낸 파일의 원본 바이트를 대조한다.
6. **파일 열기**
   - 지원 형식과 다운로드 전용 형식을 확인한다.
   - 수신 HTML이 부모 페이지의 저장소와 DOM에 접근하지 못하는지 확인한다.
   - 외부 요청 제약은 별도 CSP 정책에 맞게 확인한다.
7. **정리와 자원**
   - 퇴장 후 캡처 표시, 연결, 타이머, object URL이 남지 않는지 확인한다.
   - 동시 전송과 장시간 사용의 메모리 및 호스트 업로드를 측정한다.

## 미확정 사항

- **접근 정책**
  공개 링크 Channel 또는 인증된 비공개 Channel의 선택
- **호스트 신원**
  호스트 권한의 서명 및 검증 방식
- **TURN 운영**
  제공자, 배포 지역, 단기 자격 증명 발급 주체
- **QR 생성**
  로컬 QR 라이브러리 추가 승인
- **파일 실행**
  단순 열기 또는 사용자 HTML script 실행의 허용 범위
- **서비스 한도**
  참여자 수, 파일 크기, 총 보관 바이트, 동시 전송 수
- **동작 검증**
  예시 코드의 타입 검사, 브라우저 실행, 실제 기기 테스트
- **현재 배포 설정**
  원격 Supabase 프로젝트의 Realtime 보안 정책과 실제 한도

## 검색 결과 요약

- **Presence와 Broadcast** [확인 완료]
  - [Supabase Presence](https://supabase.com/docs/guides/realtime/presence) `본문 열람`
  - [Supabase Broadcast](https://supabase.com/docs/guides/realtime/broadcast) `본문 열람`
  - 설치된 Realtime JS 2.116.0 소스 `발췌만 확인`
- **접근 제어와 한도** [확인 완료]
  - [Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization) `본문 열람`
  - [Realtime Limits](https://supabase.com/docs/guides/realtime/limits) `본문 열람`
- **영상과 파일 API** [확인 완료]
  - W3C WebRTC와 Screen Capture 사양 `본문 열람`
  - MDN 협상, DataChannel, replaceTrack, iframe, Object URL 문서 `본문 열람`
  - [WebRTC TURN](https://webrtc.org/getting-started/turn-server) `본문 열람`
- **Next.js와 QR** [확인 완료]
  - 설치된 Next.js 16.3.4 use-client 및 dynamic-routes 가이드 `전문 열람`
  - [Next.js use client](https://nextjs.org/docs/app/api-reference/directives/use-client) `본문 열람`
  - [node-qrcode](https://github.com/soldair/node-qrcode) `본문 열람`
- **실제 운영 환경** [미조사]
  - 원격 프로젝트 설정과 실기기 성능은 문서 조사만으로 확인하지 않는다.
