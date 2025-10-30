import { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default function AgoraVideoCall({ channel, token, uid, localVideoRef, remoteVideoRef, onLeave }) {
  const joinedRef = useRef(false);
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
    if (!joinedRef.current && APP_ID && channel && token && (uid !== undefined && uid !== null)) {
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
    await client.join(APP_ID, channel, token, uid);
    localTracksRef.current = await AgoraRTC.createMicrophoneAndCameraTracks();
    const [audioTrack, videoTrack] = localTracksRef.current;
    if(localVideoRef && localVideoRef.current) videoTrack.play(localVideoRef.current);
    await client.publish([audioTrack, videoTrack]);
    joinedRef.current = true;
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video" && remoteVideoRef && remoteVideoRef.current) {
        user.videoTrack.play(remoteVideoRef.current);
        remoteTracksRef.current = [user.videoTrack];
      }
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    });
    client.on("user-unpublished", (user, mediaType) => {
      // Optionally: stop video in remoteVideoRef.current
    });
    client.on("user-left", user => {
      // Optionally: stop video in remoteVideoRef.current
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
    joinedRef.current = false;
    if (typeof onLeave === "function") onLeave();
  }

  return null; // logic only, UI ở layout ngoài
}
