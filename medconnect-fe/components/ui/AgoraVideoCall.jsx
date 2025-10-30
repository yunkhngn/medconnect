import { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default function AgoraVideoCall({ channel, token, uid, localVideoRef, remoteVideoRef, muted = false, camOff = false, onLeave, onRemoteVideoChange }) {
  const joinedRef = useRef(false);
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const remoteTracksRef = useRef([]);
  // TODO: Optionally nhận callback để truyền trạng thái overlay remote lên parent

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

  useEffect(() => {
    if (localTracksRef.current[0]) {
      localTracksRef.current[0].setEnabled(!muted);
    }
  }, [muted]);

  useEffect(() => {
    if (localTracksRef.current[1]) {
      localTracksRef.current[1].setEnabled(!camOff);
    }
  }, [camOff]);

  async function join() {
    if (!APP_ID || !channel || !token || uid === undefined || uid === null) {
      alert("Không đủ thông tin phòng hoặc token, vui lòng thử lại!");
      return;
    }
    const client = clientRef.current;
    await client.join(APP_ID, channel, token, uid);
    // Cho phép join kể cả không có thiết bị đầu vào
    let audioTrack = null, videoTrack = null, tracks = [];
    try {
      [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    } catch (err) {
      console.warn('Lỗi tạo track audio/cam:', err?.message || err);
      // Thử audio riêng
      try { audioTrack = await AgoraRTC.createMicrophoneAudioTrack(); } catch {}
      // Thử video riêng
      try { videoTrack = await AgoraRTC.createCameraVideoTrack(); } catch {}
    }
    tracks = [audioTrack, videoTrack].filter(Boolean);
    localTracksRef.current = tracks;
    if (videoTrack && localVideoRef && localVideoRef.current) videoTrack.play(localVideoRef.current);
    if (tracks.length > 0) {
      await client.publish(tracks);
    }
    joinedRef.current = true;
    // Khi join xong, subscribe lại remote
    client.remoteUsers.forEach(async (user) => {
      if (user.hasVideo) {
        await client.subscribe(user, "video");
        if (remoteVideoRef && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
          remoteTracksRef.current = [user.videoTrack];
          if (onRemoteVideoChange) onRemoteVideoChange(true);
        }
      }
      if (user.hasAudio) {
        await client.subscribe(user, "audio");
        user.audioTrack.play();
      }
    });
    // Lắng nghe user-published
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video" && remoteVideoRef && remoteVideoRef.current) {
        user.videoTrack.play(remoteVideoRef.current);
        remoteTracksRef.current = [user.videoTrack];
        if (onRemoteVideoChange) onRemoteVideoChange(true);
      }
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    });
    client.on("user-unpublished", (user, mediaType) => {
      if (mediaType === "video" && onRemoteVideoChange) onRemoteVideoChange(false);
    });
    // TODO: (extension) listen for remote track mute/unmute for overlay
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

  return null; // logic only
}
