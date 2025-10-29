"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, Avatar, Input, Divider, Chip } from "@heroui/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Maximize2, MessageSquare, Bot } from "lucide-react";

export default function DoctorOnlineExam() {
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Draggable AI assistant panel (snaps to corners)
  const [aiPos, setAiPos] = useState({ x: 16, y: 16, corner: "top-left" });
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (total) => {
    const mm = String(Math.floor(total / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const onMouseDown = (e) => {
    draggingRef.current = true;
    startRef.current = { x: e.clientX - aiPos.x, y: e.clientY - aiPos.y };
  };
  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    setAiPos((p) => ({ ...p, x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y }));
  };
  const onMouseUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // Snap to nearest corner
    const viewportW = window.innerWidth - (showChat ? 380 : 0);
    const viewportH = window.innerHeight;
    const candidates = [
      { corner: "top-left", x: 16, y: 16 },
      { corner: "top-right", x: Math.max(16, viewportW - 16 - 240), y: 16 },
      { corner: "bottom-left", x: 16, y: Math.max(16, viewportH - 16 - 160) },
      { corner: "bottom-right", x: Math.max(16, viewportW - 16 - 240), y: Math.max(16, viewportH - 16 - 160) },
    ];
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const best = candidates.reduce((best, c) => (dist(aiPos, c) < dist(aiPos, best) ? c : best), candidates[0]);
    setAiPos(best);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        {/* Left: Video Area (fills available width) */}
        <div className="flex-1 min-w-0 relative bg-black">
          {/* Remote video placeholder - fill whole area */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-zinc-950 to-zinc-800" />
          </div>

          {/* Local preview */}
          <div className="absolute right-5 top-5 w-56 aspect-video rounded-xl bg-gray-800/70 ring-1 ring-white/15 flex items-center justify-center text-white/70 text-xs select-none">
            Doctor preview
          </div>

          {/* Draggable AI helper (snaps to corners) */}
          <div
            className="absolute z-20 w-60 h-40 rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-lg cursor-move select-none flex items-center justify-center text-white"
            style={{ left: aiPos.x, top: aiPos.y }}
            onMouseDown={onMouseDown}
          >
            <div className="flex items-center gap-2">
              <Bot />
              <span className="text-sm">AI hỗ trợ</span>
            </div>
          </div>

          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 p-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3">
              <Chip color="primary" variant="flat">Phiên khám online • Bác sĩ</Chip>
              <Chip variant="flat">{formatTime(seconds)}</Chip>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto pr-2">
              <Button size="sm" variant="flat" startContent={<Maximize2 size={16} />}>
                Toàn màn hình
              </Button>
              <Button size="sm" variant="flat" onPress={()=>setShowChat(v=>!v)} startContent={<MessageSquare size={16}/> }>
                Chat
              </Button>
            </div>
          </div>

          {/* Controls - glassy */}
          <div className="absolute left-0 right-0 bottom-0 pb-6 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-3 ring-1 ring-white/20 shadow-lg">
              <Button isIconOnly variant="flat" color={muted?"warning":"default"} onPress={()=>setMuted(!muted)} className="bg-white/10">
                {muted? <MicOff/> : <Mic/>}
              </Button>
              <Button isIconOnly variant="flat" color={camOff?"warning":"default"} onPress={()=>setCamOff(!camOff)} className="bg-white/10">
                {camOff? <VideoOff/> : <Video/>}
              </Button>
              <Button isIconOnly variant="flat" color="default" className="bg-white/10">
                <MonitorUp/>
              </Button>
              <Divider orientation="vertical" className="h-8 mx-1 bg-white/30" />
              <Button color="danger" startContent={<PhoneOff/>} className="font-semibold">
                Kết thúc
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Chat panel */}
        {showChat && (
          <div className="w-[380px] h-full bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 flex items-center gap-3">
              <Avatar name="Patient" size="sm"/>
              <div>
                <p className="font-semibold">Bệnh nhân</p>
                <p className="text-xs text-gray-500">Đang kết nối…</p>
              </div>
            </div>
            <Divider/>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <Card shadow="none" className="bg-gray-50"><CardBody className="p-3 text-sm">Xin chào bác sĩ.</CardBody></Card>
              <div className="flex justify-end">
                <Card shadow="none" className="bg-blue-50 max-w-[80%]"><CardBody className="p-3 text-sm">Chào bạn, tôi là bác sĩ phụ trách.</CardBody></Card>
              </div>
            </div>
            <Divider/>
            <div className="p-3 flex gap-2">
              <Input placeholder="Nhập tin nhắn…" className="flex-1"/>
              <Button color="primary">Gửi</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}