import React from "react";

export default function VideoCallLayout({ localVideoRef, remoteVideoRef, roleLabel, onLeave, connected }) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex gap-12 my-10">
        <div>
          <div ref={localVideoRef} style={{ width: 400, height: 300, background: "#232323", borderRadius: 12, overflow: 'hidden' }} />
          <div className="text-center mt-2 font-medium text-xl">Bạn ({roleLabel})</div>
        </div>
        <div>
          <div ref={remoteVideoRef} style={{ width: 400, height: 300, background: "#444", borderRadius: 12, overflow: 'hidden' }} />
          <div className="text-center mt-2 font-medium text-xl">Đối phương</div>
          {!connected && (
            <div className="text-center text-gray-500 text-base mt-2">Đang đợi đối phương kết nối...</div>
          )}
        </div>
      </div>
      <button
        onClick={onLeave}
        className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-lg transition hover:bg-red-600 text-lg"
      >
        Kết thúc cuộc gọi
      </button>
    </div>
  );
}
