import { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default function AgoraVideoCall({ channel, token, uid, localVideoRef, remoteVideoRef, muted = false, camOff = false, onLeave }) {
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
    localTracksRef.current = await AgoraRTC.createMicrophoneAndCameraTracks();
    const [audioTrack, videoTrack] = localTracksRef.current;
    if(localVideoRef && localVideoRef.current) videoTrack.play(localVideoRef.current);
    await client.publish([audioTrack, videoTrack]);
    joinedRef.current = true;
    // Khi join xong, duyệt và play lại remote đã có trước đó (fix bug ai vào trước/sau đều thấy nhau)
    client.remoteUsers.forEach(async (user) => {
      if (user.hasVideo) {
        await client.subscribe(user, "video");
        if (remoteVideoRef && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
          remoteTracksRef.current = [user.videoTrack];
        }
      }
      if (user.hasAudio) {
        await client.subscribe(user, "audio");
        user.audioTrack.play();
      }
    });
    // Khi có user mới publish hoặc user-published, vẫn phải lắng nghe
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
