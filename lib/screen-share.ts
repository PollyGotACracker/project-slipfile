import { createClient } from "@/database/client";
import type { ParticipantSession } from "@/types/participant";

interface ScreenSignal {
  from: string;
  to: string;
  connectionId: string;
  description: RTCSessionDescriptionInit;
}

interface ScreenPeer {
  pc: RTCPeerConnection;
  connectionId: string;
  abort: AbortController;
}

/**
 * 화면 공유 연결 메시지의 형식과 길이를 검사하는 타입 가드.
 * @param value 수신한 연결 메시지.
 * @returns 허용된 offer 또는 answer 메시지인지 여부.
 */
function isScreenSignal(value: unknown): value is ScreenSignal {
  if (
    typeof value !== "object" ||
    value === null ||
    !("from" in value) ||
    typeof value.from !== "string" ||
    value.from.length > 128 ||
    !("to" in value) ||
    typeof value.to !== "string" ||
    value.to.length > 128 ||
    !("connectionId" in value) ||
    typeof value.connectionId !== "string" ||
    value.connectionId.length > 128 ||
    !("description" in value) ||
    typeof value.description !== "object" ||
    value.description === null
  ) {
    return false;
  }
  return (
    "type" in value.description &&
    (value.description.type === "offer" ||
      value.description.type === "answer") &&
    "sdp" in value.description &&
    typeof value.description.sdp === "string" &&
    value.description.sdp.length > 0 &&
    value.description.sdp.length <= 131072
  );
}

/**
 * SDP에 포함할 ICE 후보 수집 완료를 기다리는 함수.
 * @param peer 수집 상태를 확인할 영상 연결.
 * @returns 수집 완료 시 이행되는 Promise.
 * @throws 수집 시간이 10초를 초과하거나 연결이 종료된 경우.
 */
function waitForIce(peer: ScreenPeer): Promise<void> {
  if (peer.pc.iceGatheringState === "complete") return Promise.resolve();
  /**
   * ICE 상태와 연결 종료 이벤트를 구독하는 Promise 실행 콜백.
   * @param resolve 수집 완료 시 호출하는 콜백.
   * @param reject 시간 초과 또는 연결 종료 시 호출하는 콜백.
   * @returns 반환값 없음.
   */
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      /** ICE 수집 시간 초과를 오류로 처리하는 타이머 콜백. */
      () => finish(new Error("영상 연결 주소 수집 시간이 초과되었습니다.")),
      10000,
    );
    /**
     * 타이머와 이벤트 구독을 정리하고 ICE 대기를 완료하는 함수.
     * @param error Promise를 거부할 오류. 생략하면 정상 완료.
     * @returns 반환값 없음.
     */
    function finish(error?: Error) {
      clearTimeout(timer);
      peer.pc.removeEventListener("icegatheringstatechange", handleChange);
      peer.abort.signal.removeEventListener("abort", handleAbort);
      if (error) reject(error);
      else resolve();
    }
    /**
     * ICE 수집 완료 상태를 확인하는 이벤트 콜백.
     * @returns 반환값 없음.
     */
    function handleChange() {
      if (peer.pc.iceGatheringState === "complete") finish();
    }
    /**
     * 연결 종료 시 ICE 대기를 취소하는 이벤트 콜백.
     * @returns 반환값 없음.
     */
    function handleAbort() {
      finish(new Error("영상 연결이 종료되었습니다."));
    }
    peer.pc.addEventListener("icegatheringstatechange", handleChange);
    peer.abort.signal.addEventListener("abort", handleAbort, { once: true });
    if (peer.abort.signal.aborted) handleAbort();
    else handleChange();
  });
}

/**
 * 호스트 화면 캡처와 Presence 기반 게스트 영상 연결을 관리하는 함수.
 * @param channelId 화면 공유용 Realtime 채널을 구분할 ID.
 * @param session 현재 참여자의 세션과 호스트 여부.
 * @param onStream 호스트 캡처 또는 게스트 수신 영상을 전달하는 콜백.
 * 영상 제거 시 null을 전달하며 콜백의 반환값은 사용하지 않음.
 * @param onReady 구독과 Presence 등록 완료 여부를 전달하는 콜백.
 * 준비 완료 시 true를 전달하며 콜백의 반환값은 사용하지 않음.
 * @param onError 연결과 상태 등록 오류를 전달하는 콜백.
 * 오류는 unknown으로 전달하며 콜백의 반환값은 사용하지 않음.
 * @returns start, stop, close 메서드를 가진 화면 공유 제어 객체.
 */
export function createScreenShare(
  channelId: string,
  session: ParticipantSession,
  onStream: (stream: MediaStream | null) => void,
  onReady: (isReady: boolean) => void,
  onError: (error: unknown) => void,
) {
  const supabase = createClient();
  const participantId = crypto.randomUUID();
  const channel = supabase.channel(`screen:${channelId}`, {
    config: {
      presence: { key: participantId },
      broadcast: { ack: true, self: false },
    },
  });
  const peers = new Map<string, ScreenPeer>();
  const pendingOffers = new Map<string, ScreenSignal>();
  let stream: MediaStream | null = null;
  let connectionId: string | null = null;
  let isReady = false;
  let isClosed = false;
  let isCapturing = false;
  let signalQueue = Promise.resolve();

  /**
   * 종료되지 않은 화면 공유의 오류를 외부 콜백에 전달하는 함수.
   * @param error 전달할 오류.
   * @returns 반환값 없음.
   */
  function reportError(error: unknown) {
    if (!isClosed) onError(error);
  }

  /**
   * 참여자의 영상 연결과 ICE 대기를 종료하는 함수.
   * @param id 연결을 종료할 참여자의 화면 공유용 ID.
   * @returns 반환값 없음.
   */
  function closePeer(id: string) {
    const peer = peers.get(id);
    if (!peer) return;
    peers.delete(id);
    peer.abort.abort();
    peer.pc.close();
    if (!session.isHost && !isClosed) onStream(null);
  }

  /**
   * 기존 연결을 정리하고 참여자별 영상 연결을 생성하는 함수.
   * @param id 상대 참여자의 화면 공유용 ID.
   * @param idOfConnection 현재 화면 공유를 구분할 연결 ID.
   * @returns PeerConnection, 연결 ID, 취소 제어기를 가진 객체.
   */
  function createPeer(id: string, idOfConnection: string) {
    closePeer(id);
    const peer: ScreenPeer = {
      pc: new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      }),
      connectionId: idOfConnection,
      abort: new AbortController(),
    };
    peers.set(id, peer);
    /**
     * 현재 연결에서 받은 영상을 외부 콜백에 전달하는 이벤트 콜백.
     * @param event 수신 트랙과 연결된 스트림을 포함한 이벤트.
     * @returns 반환값 없음.
     */
    peer.pc.ontrack = ({ track, streams }) => {
      if (!isClosed && peers.get(id) === peer) {
        onStream(streams[0] ?? new MediaStream([track]));
      }
    };
    /**
     * 영상 연결 실패 시 연결을 정리하고 오류를 전달하는 이벤트 콜백.
     * @returns 반환값 없음.
     */
    peer.pc.onconnectionstatechange = () => {
      if (peer.pc.connectionState === "failed") {
        closePeer(id);
        reportError(new Error("게스트 영상 연결에 실패했습니다."));
      }
    };
    return peer;
  }

  /**
   * ICE 후보를 포함한 로컬 SDP를 상대에게 Broadcast로 전송하는 함수.
   * @param id 수신 참여자의 화면 공유용 ID.
   * @param peer SDP를 생성할 영상 연결.
   * @returns 전송 처리 완료 시 이행되는 Promise. 연결이 무효하면 전송 생략.
   * @throws SDP 생성, ICE 수집 또는 Broadcast 전송에 실패한 경우.
   */
  async function sendDescription(id: string, peer: ScreenPeer) {
    await peer.pc.setLocalDescription();
    // ICE를 SDP에 포함하여 별도 candidate 메시지와 대기 큐를 생략한다.
    await waitForIce(peer);
    if (isClosed || peers.get(id) !== peer || !isReady) return;
    if (!peer.pc.localDescription) {
      throw new Error("영상 연결 정보를 생성하지 못했습니다.");
    }
    const result = await channel.send({
      type: "broadcast",
      event: "screen-signal",
      payload: {
        from: participantId,
        to: id,
        connectionId: peer.connectionId,
        description: peer.pc.localDescription.toJSON(),
      },
    });
    if (result !== "ok") throw new Error("영상 연결 정보 전송에 실패했습니다.");
  }

  /**
   * 현재 호스트 여부와 화면 공유 연결 ID를 Presence에 등록하는 함수.
   * @returns 등록 완료 시 이행되는 Promise.
   * @throws Presence 등록 결과가 ok가 아닌 경우.
   */
  async function trackPresence() {
    const result = await channel.track({
      isHost: session.isHost,
      connectionId,
    });
    if (result !== "ok") throw new Error("화면 공유 상태 등록에 실패했습니다.");
  }

  /**
   * Presence 메타데이터의 타입을 검사해 참여자 목록을 구성하는 함수.
   * @returns 참여자 ID를 키로 호스트 여부와 연결 ID를 보관하는 Map.
   */
  function getParticipants() {
    const participants = new Map<
      string,
      { isHost: boolean; connectionId: string | null }
    >();
    for (const [id, entries] of Object.entries(
      channel.presenceState<{ isHost: unknown; connectionId: unknown }>(),
    )) {
      for (const entry of entries) {
        if (
          typeof entry.isHost === "boolean" &&
          (entry.connectionId === null ||
            typeof entry.connectionId === "string")
        ) {
          participants.set(id, {
            isHost: entry.isHost,
            connectionId: entry.connectionId,
          });
        }
      }
    }
    return participants;
  }

  /**
   * 수신 SDP의 순차 처리를 예약하는 함수.
   * @param signal 상대가 보낸 offer 또는 answer 메시지.
   * @returns 반환값 없음. 처리 오류는 onError 콜백으로 전달.
   */
  function enqueueSignal(signal: ScreenSignal) {
    signalQueue = signalQueue
      /**
       * 참여자와 연결 ID를 확인하고 SDP를 적용하는 비동기 콜백.
       * @returns SDP 적용과 필요한 answer 전송 완료 시 이행되는 Promise.
       */
      .then(async () => {
        if (isClosed || !isReady) return;
        const participant = getParticipants().get(signal.from);
        if (!participant || participant.isHost === session.isHost) return;
        let peer = peers.get(signal.from);
        if (session.isHost) {
          if (
            signal.description.type !== "answer" ||
            !peer ||
            peer.connectionId !== signal.connectionId ||
            peer.pc.signalingState !== "have-local-offer"
          )
            return;
        } else {
          if (
            signal.description.type !== "offer" ||
            participant.connectionId !== signal.connectionId
          )
            return;
          if (!peer || peer.connectionId !== signal.connectionId) {
            peer = createPeer(signal.from, signal.connectionId);
          }
        }
        await peer.pc.setRemoteDescription(signal.description);
        if (!session.isHost) await sendDescription(signal.from, peer);
      })
      .catch(reportError);
  }

  /**
   * Presence 상태에 맞춰 영상 연결을 정리하거나 생성하는 이벤트 콜백.
   * @returns 반환값 없음. 대기 중인 offer도 상태 확인 후 처리 예약.
   */
  function handlePresenceSync() {
    if (isClosed || !isReady) return;
    const participants = getParticipants();
    for (const [id, peer] of peers) {
      const participant = participants.get(id);
      if (
        !participant ||
        participant.isHost === session.isHost ||
        (!session.isHost && participant.connectionId !== peer.connectionId)
      )
        closePeer(id);
    }
    if (session.isHost && stream && connectionId) {
      for (const [id, participant] of participants) {
        if (id === participantId || participant.isHost || peers.has(id))
          continue;
        const peer = createPeer(id, connectionId);
        peer.pc.addTransceiver(stream.getVideoTracks()[0], {
          direction: "sendonly",
          streams: [stream],
        });
        /**
         * 현재 연결의 offer 전송 실패를 정리하는 오류 콜백.
         * @param error SDP 생성 또는 전송 중 발생한 오류.
         * @returns 반환값 없음.
         */
        void sendDescription(id, peer).catch((error: unknown) => {
          if (peers.get(id) !== peer) return;
          closePeer(id);
          reportError(error);
        });
      }
    }
    for (const [id, offer] of pendingOffers) {
      if (participants.get(id)?.connectionId !== offer.connectionId) continue;
      pendingOffers.delete(id);
      enqueueSignal(offer);
    }
  }

  /**
   * 캡처와 모든 영상 연결을 중지하고 공유 상태를 갱신하는 함수.
   * @returns 반환값 없음. Presence 갱신 완료는 기다리지 않음.
   */
  function stop() {
    stream?.getTracks().forEach(
      /**
       * 캡처 트랙을 종료하는 순회 콜백.
       * @param track 종료할 캡처 트랙.
       * @returns 반환값 없음.
       */
      (track) => track.stop(),
    );
    stream = null;
    connectionId = null;
    for (const id of peers.keys()) closePeer(id);
    if (!isClosed) onStream(null);
    if (isReady && !isClosed) void trackPresence().catch(reportError);
  }

  channel
    .on("presence", { event: "sync" }, handlePresenceSync)
    /**
     * 수신 메시지를 검사하고 offer를 보관하거나 SDP 처리를 예약하는 콜백.
     * @param message payload에 연결 메시지를 담은 Broadcast 수신 객체.
     * @returns 반환값 없음.
     */
    .on("broadcast", { event: "screen-signal" }, ({ payload }) => {
      if (!isScreenSignal(payload) || payload.to !== participantId) return;
      if (!session.isHost && payload.description.type === "offer") {
        if (pendingOffers.size >= 32) return;
        pendingOffers.set(payload.from, payload);
        handlePresenceSync();
      } else {
        enqueueSignal(payload);
      }
    })
    /**
     * 구독 상태에 따라 공유를 중지하거나 Presence를 재등록하는 콜백.
     * @param status Realtime 채널 구독 상태.
     * @returns 상태 처리와 필요한 Presence 등록 완료 시 이행되는 Promise.
     */
    .subscribe(async (status) => {
      if (isClosed) return;
      isReady = false;
      onReady(false);
      if (status !== "SUBSCRIBED") {
        stop();
        reportError(new Error(`화면 공유 연결 상태: ${status}`));
        return;
      }
      try {
        await trackPresence();
        if (isClosed) return;
        isReady = true;
        onReady(true);
        handlePresenceSync();
      } catch (error) {
        reportError(error);
      }
    });

  return {
    /**
     * 사용자 화면을 캡처하고 게스트별 영상 연결을 시작하는 메서드.
     * @returns 캡처와 Presence 등록 완료 시 이행되는 Promise.
     * 게스트 영상 연결 완료까지 기다리지는 않으며 시작 조건 미충족 시 생략.
     * @throws 화면 캡처 미지원, 권한 거절, 영상 없음 또는 상태 등록 실패 시.
     */
    async start() {
      if (!session.isHost || !isReady || isClosed || isCapturing || stream)
        return;
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("이 브라우저에서는 화면 공유를 지원하지 않습니다.");
      }
      isCapturing = true;
      try {
        const captured = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 15 } },
          audio: false,
        });
        if (isClosed || !isReady) {
          captured.getTracks().forEach(
            /**
             * 공유 시작이 취소된 뒤 남은 캡처 트랙을 종료하는 콜백.
             * @param track 종료할 캡처 트랙.
             * @returns 반환값 없음.
             */
            (track) => track.stop(),
          );
          return;
        }
        stream = captured;
        const track = captured.getVideoTracks()[0];
        if (!track || track.readyState === "ended") {
          throw new Error("공유할 화면 영상이 없습니다.");
        }
        track.addEventListener("ended", stop, { once: true });
        connectionId = crypto.randomUUID();
        onStream(captured);
        await trackPresence();
        handlePresenceSync();
      } catch (error) {
        stop();
        throw error;
      } finally {
        isCapturing = false;
      }
    },
    stop,
    /**
     * 화면 공유 자원을 정리하고 Realtime 채널 해제를 요청하는 메서드.
     * 비동기 채널 해제 완료는 기다리지 않음.
     */
    close() {
      isClosed = true;
      isReady = false;
      stop();
      pendingOffers.clear();
      void supabase
        .removeChannel(channel)
        /**
         * 채널 해제 실패 결과를 콘솔에 기록하는 완료 콜백.
         * @param result Realtime 채널 해제 결과.
         * @returns 반환값 없음.
         */
        .then((result) => {
          if (result !== "ok") {
            console.error("화면 공유 채널 해제에 실패했습니다.");
          }
        })
        /**
         * 채널 해제 중 발생한 예외를 콘솔에 기록하는 오류 콜백.
         * @returns 반환값 없음.
         */
        .catch(() => {
          console.error("화면 공유 채널 해제에 실패했습니다.");
        });
    },
  };
}
