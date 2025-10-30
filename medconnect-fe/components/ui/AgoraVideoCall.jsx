import React, { useRef, useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default function AgoraVideoCall({ channel, token, uid }) {
  const [joined, setJoined] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const remoteTracksRef = useRef([]);

  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    return () => {
      leave();
    }; // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!joined && APP_ID && channel && token && (uid !== undefined && uid !== null)) {
      // Log
      console.log("[AgoraVideoCall] Joining call:", { APP_ID, channel, token, uid });
      join();
    }
    // eslint-disable-next-line
  }, [APP_ID, channel, token, uid]);

  async function join() {
    if (!APP_ID || !channel || !token || uid === undefined || uid === null) {
      alert("Không đủ thông tin phòng hoặc token, vui lòng thử lại!");
      return;
    }
    const client = clientRef.current;
    // Check bằng localStorage để xem thử có bị trùng UID không
    console.log("[AgoraVideoCall] Đang join...", { channel, uid });
    await client.join(APP_ID, channel, token, uid);
    localTracksRef.current = await AgoraRTC.createMicrophoneAndCameraTracks();
    const [audioTrack, videoTrack] = localTracksRef.current;
    videoTrack.play(localVideoRef.current);
    await client.publish([audioTrack, videoTrack]);
    setJoined(true);
    setRemoteConnected(false);
    client.on("user-published", async (user, mediaType) => {
      console.log("[AgoraVideoCall] Remote user published: ", user, mediaType);
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteConnected(true);
        user.videoTrack.play(remoteVideoRef.current);
        remoteTracksRef.current = [user.videoTrack];
      }
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    });
    client.on("user-unpublished", (user, mediaType) => {
      console.log("[AgoraVideoCall] Remote user unpublished: ", user, mediaType);
      setRemoteConnected(false);
    });
    client.on("user-left", user => {
      console.log("[AgoraVideoCall] Remote user left:", user);
      setRemoteConnected(false);
    });
  }

  async function leave() {
    if (localTracksRef.current.length) {
      localTracksRef.current.forEach(track => track.close());
    }
    if (remoteTracksRef.current.length) {
      remoteTracksRef.current.forEach(track => track.close());
    }
    await clientRef.current?.leave();
    setJoined(false);
    setRemoteConnected(false);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 16 }}>
        <div>
          <div ref={localVideoRef} style={{ width: 320, height: 240, background: "#232323" }} />
          <div style={{ textAlign: "center" }}>Local</div>
        </div>
        <div>
          <div ref={remoteVideoRef} style={{ width: 320, height: 240, background: "#444" }} />
          <div style={{ textAlign: "center" }}>Remote</div>
          {!remoteConnected && joined && (
            <div style={{ color: '#888', textAlign: 'center', marginTop: 4, fontSize: 14 }}>
              Đợi đối phương vào phòng...
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        {joined && <button onClick={leave} style={{ padding: "8px 16px", background: "#ff0033", color: "#fff", border: "none", borderRadius: 5 }}>Leave</button>}
      </div>
    </div>
  );
}
