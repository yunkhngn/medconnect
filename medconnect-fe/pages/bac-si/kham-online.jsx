"use client";

import { useState } from "react";
import { Button, Card, CardBody, Avatar, Input, Divider, Chip } from "@heroui/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Maximize2, MessageSquare } from "lucide-react";

export default function DoctorOnlineExam() {
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        {/* Left: Video Area (8/12) */}
        <div className="flex-1 min-w-0 relative bg-black">
          {/* Remote video placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[78%] aspect-video bg-gray-900/70 rounded-2xl ring-1 ring-white/10 flex items-center justify-center">
              <p className="text-white/60">Remote video (Patient)</p>
            </div>
          </div>

          {/* Local preview */}
          <div className="absolute right-5 top-5 w-52 aspect-video rounded-xl bg-gray-800/80 ring-1 ring-white/10 flex items-center justify-center">
            <p className="text-white/60 text-xs">Doctor preview</p>
          </div>

          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 p-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto">
              <Chip color="primary" variant="flat">Phiên khám online • Bác sĩ</Chip>
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

          {/* Controls */}
          <div className="absolute left-0 right-0 bottom-0 pb-6 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur rounded-full px-4 py-3">
              <Button isIconOnly variant="flat" color={muted?"warning":"default"} onPress={()=>setMuted(!muted)}>
                {muted? <MicOff/> : <Mic/>}
              </Button>
              <Button isIconOnly variant="flat" color={camOff?"warning":"default"} onPress={()=>setCamOff(!camOff)}>
                {camOff? <VideoOff/> : <Video/>}
              </Button>
              <Button isIconOnly variant="flat" color="default">
                <MonitorUp/>
              </Button>
              <Divider orientation="vertical" className="h-8 mx-1 bg-white/20" />
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