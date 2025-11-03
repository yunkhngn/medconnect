import { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default function AgoraVideoCall({ channel, token, uid, localVideoRef, remoteVideoRef, muted = false, camOff = false, onLeave, onRemoteVideoChange, autoJoin = true, onJoinReady }) {
  const joinedRef = useRef(false);
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const remoteTracksRef = useRef([]);
  const creatingTracksRef = useRef(false);
  // TODO: Optionally nhận callback để truyền trạng thái overlay remote lên parent

  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    // Nếu là chế độ pre-join (autoJoin=false): tạo preview sớm không cần join
    if (!autoJoin) {
      (async () => {
        const tracks = await createLocalTracksWithFallback();
        const v = tracks.find(t => t.trackMediaType === 'video');
        if (v) {
          if (remoteVideoRef && remoteVideoRef.current) v.play(remoteVideoRef.current); // preview lớn
          if (localVideoRef && localVideoRef.current) v.play(localVideoRef.current);   // preview nhỏ
        }
      })();
    }
    if (typeof onJoinReady === 'function') {
      onJoinReady(() => join());
    }
    return () => {
      leave();
    }; // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (autoJoin && !joinedRef.current && APP_ID && channel && token && (uid !== undefined && uid !== null)) {
      join();
    }
    // eslint-disable-next-line
  }, [APP_ID, channel, token, uid, autoJoin]);

  useEffect(() => {
    const audio = localTracksRef.current.find((t) => t.trackMediaType === 'audio');
    if (audio) {
      audio.setEnabled(!muted);
    }
  }, [muted]);

  useEffect(() => {
    const video = localTracksRef.current.find((t) => t.trackMediaType === 'video');
    if (video) {
      video.setEnabled(!camOff);
    }
    // Nếu người dùng bật camera nhưng hiện chưa có video track, thử tạo/publish lại
    if (!camOff && joinedRef.current) {
      const hasVideo = localTracksRef.current.some((t) => t.trackMediaType === 'video');
      if (!hasVideo) {
        ensureLocalVideoTrack();
      }
    }
  }, [camOff]);

  function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

  async function createLocalTracksWithFallback() {
    if (creatingTracksRef.current) return localTracksRef.current;
    creatingTracksRef.current = true;
    let audioTrack = null, videoTrack = null;
    // Try 2 rounds: both together, then individually; with a short retry
    for (let attempt = 0; attempt < 2 && (!audioTrack || !videoTrack); attempt++) {
      try {
        const [a, v] = await AgoraRTC.createMicrophoneAndCameraTracks();
        audioTrack = a; videoTrack = v;
      } catch (err) {
        // Fallback to individual creation
        try { if (!audioTrack) audioTrack = await AgoraRTC.createMicrophoneAudioTrack(); } catch {}
        try { if (!videoTrack) videoTrack = await AgoraRTC.createCameraVideoTrack(); } catch {}
        if (!audioTrack && !videoTrack) {
          await sleep(400);
        }
      }
    }
    const tracks = [audioTrack, videoTrack].filter(Boolean);
    localTracksRef.current = tracks;
    creatingTracksRef.current = false;
    return tracks;
  }

  async function ensureLocalVideoTrack() {
    try {
      const client = clientRef.current;
      const existingVideo = localTracksRef.current.find((t) => t.getTrack && t.getTrack().kind === 'video');
      if (existingVideo) return existingVideo;
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      localTracksRef.current = [...localTracksRef.current, videoTrack];
      if (localVideoRef && localVideoRef.current) videoTrack.play(localVideoRef.current);
      try { await client.publish([videoTrack]); } catch (e) { console.warn('[Agora] publish video retry failed:', e); }
      return videoTrack;
    } catch (e) {
      console.warn('[Agora] ensureLocalVideoTrack failed:', e);
      return null;
    }
  }

  async function join() {
    if (!APP_ID || !channel || !token || uid === undefined || uid === null) {
      alert("Không đủ thông tin phòng hoặc token, vui lòng thử lại!");
      return;
    }
    const client = clientRef.current;
    await client.join(APP_ID, channel, token, uid);
    // Cho phép join kể cả không có thiết bị đầu vào, có retry
    const tracks = await createLocalTracksWithFallback();
    const videoTrack = tracks.find(t => t.trackMediaType === 'video');
    if (videoTrack && localVideoRef && localVideoRef.current) videoTrack.play(localVideoRef.current);
    if (tracks.length > 0) {
      try { await client.publish(tracks); } catch (e) { console.warn('[Agora] publish failed:', e); }
    }
    joinedRef.current = true;
    // Khi join xong, subscribe lại remote
    client.remoteUsers.forEach(async (user) => {
      if (user.hasVideo) {
        try {
          await client.subscribe(user, "video");
          if (remoteVideoRef && remoteVideoRef.current) {
            user.videoTrack.play(remoteVideoRef.current);
            remoteTracksRef.current = [user.videoTrack];
            if (onRemoteVideoChange) onRemoteVideoChange(true);
          }
        } catch(e) { console.warn('[Agora] subscribe video (late) failed:', e); }
      }
      if (user.hasAudio) {
        try {
          await client.subscribe(user, "audio");
          user.audioTrack.play();
        } catch(e) { console.warn('[Agora] subscribe audio (late) failed:', e); }
      }
    });
    // Lắng nghe user-published
    client.on("user-published", async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoRef && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
          remoteTracksRef.current = [user.videoTrack];
          if (onRemoteVideoChange) onRemoteVideoChange(true);
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      } catch (e) {
        console.warn('[Agora] subscribe on published failed:', e);
      }
    });
    client.on("user-unpublished", (user, mediaType) => {
      if (mediaType === "video" && onRemoteVideoChange) onRemoteVideoChange(false);
    });
    // Khi remote rời phòng thì coi như không còn video
    client.on("user-left", () => {
      if (onRemoteVideoChange) onRemoteVideoChange(false);
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
