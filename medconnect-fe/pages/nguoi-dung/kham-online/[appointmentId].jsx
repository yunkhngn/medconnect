"use client";

import { useRef, useEffect, useState } from "react";
import { Button, Card, CardBody, Avatar, Input, Divider, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, MessageSquare, User, Calendar, Clock, Phone, Mail, MapPin, Camera, Send, Star } from "lucide-react";
import { useRouter } from "next/router";
import { parseReason } from "@/utils/appointmentUtils";
import { auth } from "@/lib/firebase";
import dynamic from "next/dynamic";
import { subscribeRoomMessages, sendChatMessage, setPresence, cleanupRoomIfEmpty } from "@/services/chatService";
import { v4 as uuidv4 } from 'uuid';

const AgoraVideoCall = dynamic(() => import("@/components/ui/AgoraVideoCall"), { ssr: false });

export default function PatientOnlineExamRoom() {
  const router = useRouter();
  const { appointmentId } = router.query;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const { isOpen: isDoctorInfoOpen, onOpen: onDoctorInfoOpen, onOpenChange: onDoctorInfoOpenChange } = useDisclosure();
  const [agoraToken, setAgoraToken] = useState("");
  const [agoraUid, setAgoraUid] = useState(() => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      return window.crypto.getRandomValues(new Uint32Array(1))[0];
    } else {
      return Math.floor(Math.random() * 1000000);
    }
  });
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [remoteCamOff, setRemoteCamOff] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  // Video refs cho injection của Agora
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!appointmentId) return;
    fetchAppointmentDetails();
    // Chỉ subscribe sau khi user đã đăng nhập để tránh lỗi PERMISSION
    let unsubFS = null;
    const stopAuth = auth.onAuthStateChanged((u) => {
      if (u && !unsubFS) {
        unsubFS = subscribeRoomMessages(appointmentId, setChatMessages);
      }
    });
    return () => {
      stopAuth && stopAuth();
      unsubFS && unsubFS();
    };
  }, [appointmentId]);

  // Presence: bệnh nhân online khi phòng đang ONGOING; rời sẽ cleanup nếu cả 2 out
  useEffect(() => {
    if (!appointmentId) return;
    if (appointment && appointment.status === 'ONGOING') {
      setPresence(appointmentId, 'patient', true);
      return () => {
        setPresence(appointmentId, 'patient', false);
        cleanupRoomIfEmpty(appointmentId);
      };
    }
  }, [appointmentId, appointment?.status]);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (appointment && appointment.status === 'ONGOING') {
      const fetchToken = async () => {
        const tokenResp = await fetch(
          `http://localhost:8080/api/agora/token?channel=${appointmentId}&uid=${agoraUid}`
        );
        if (tokenResp.ok) {
          const data = await tokenResp.json();
          setAgoraToken(data.token);
        } else {
          setAgoraToken("");
        }
      };
      fetchToken();
    }
  }, [appointment, appointmentId, agoraUid]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointment(data);

        setChatMessages([
          {
            id: 1,
            sender: 'patient',
            message: 'Xin chào bác sĩ, tôi đã sẵn sàng cho cuộc khám.',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (total) => {
    const mm = String(Math.floor(total / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleSendMessage = async () => {
    const text = chatMessage.trim();
    if (!text) return;
    setChatMessage("");
    const user = auth.currentUser;
    await sendChatMessage(appointmentId, {
      senderId: user?.uid,
      senderName: user?.displayName || "Bệnh nhân",
      senderRole: "patient",
      text,
    });
  };

  // Đợi loading hoặc chưa có appointment/status
  if (loading) return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải phòng khám...</p>
      </div>
    </div>
  );

  if (!appointment) return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Không tìm thấy cuộc hẹn</p>
        <Button color="success" onClick={() => router.push('/nguoi-dung/kham-online')}>Quay lại danh sách</Button>
      </div>
    </div>
  );

  if (appointment.status !== 'ONGOING') return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">{appointment.status === 'CONFIRMED' ? 'Phòng đang chờ bác sĩ bắt đầu' : 'Chờ xác nhận hoặc đã kết thúc...'}</p>
        <Button color="default" onClick={() => router.push('/nguoi-dung/kham-online')} className="mt-4">Quay lại</Button>
      </div>
    </div>
  );

  const { reasonText, attachments } = parseReason(appointment.reason);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        {/* Left: Video Area */}
        <div className="flex-1 min-w-0 relative bg-black">
          {/* Remote video fill area */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div ref={remoteVideoRef} className="w-full h-full" />
            {!hasRemoteVideo && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <span className="bg-black bg-opacity-60 px-5 py-2 rounded-xl text-white text-lg font-medium">
                  Đang đợi kết nối với Bác sĩ
                </span>
              </div>
            )}
          </div>

          {/* Local preview nhỏ góc phải như doctor */}
          <div className="absolute right-5 top-5 w-56 aspect-video rounded-xl bg-gray-800/70 ring-1 ring-white/15 flex items-center justify-center text-white/70 text-xs select-none">
            <div ref={localVideoRef} className="absolute inset-0 rounded-xl overflow-hidden" />
            <span className="absolute bottom-2 left-2 text-xs text-white/70">Patient preview</span>
            {muted && <MicOff className="absolute top-2 right-2 text-red-400 w-6 h-6" />}
            {camOff && <VideoOff className="absolute top-2 right-10 text-red-400 w-6 h-6" />}
          </div>

          {/* Top bar giống doctor */}
          <div className="absolute left-0 right-0 top-0 p-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3">
              <Chip color="success" variant="flat">Phiên khám online • Bệnh nhân</Chip>
              <Chip variant="flat">{formatTime(seconds)}</Chip>
              <Button size="sm" variant="flat" color="default" onPress={onDoctorInfoOpen} startContent={<User size={16} />}>Thông tin bác sĩ</Button>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto pr-2">
              <Button size="sm" variant="flat" startContent={<Maximize2 size={16} />}>Toàn màn hình</Button>
              <Button size="sm" variant="flat" onPress={()=>setShowChat(v=>!v)} startContent={<MessageSquare size={16}/> }>Chat</Button>
            </div>
          </div>
          {/* Controls bottom - mute/tắt cam/leave giống doctor */}
          <div className="absolute left-0 right-0 bottom-0 pb-6 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-3 ring-1 ring-white/20 shadow-lg">
              <Button isIconOnly variant="flat" color={muted ? "warning" : "default"} onPress={()=>setMuted(v => !v)} className="bg-white/10" title={muted?"Bật mic":"Tắt mic"}>{muted ? <MicOff/> : <Mic/>}</Button>
              <Button isIconOnly variant="flat" color={camOff ? "warning" : "default"} onPress={()=>setCamOff(v => !v)} className="bg-white/10" title={camOff?"Bật camera":"Tắt camera"}>{camOff ? <VideoOff/> : <Video/>}</Button>
              <Button color="danger" onPress={()=>window.location.href='/nguoi-dung/kham-online'} className="font-semibold ml-6">Rời phòng</Button>
            </div>
          </div>
        </div>
        {/* Right: Chat and modal info... (unchanged)*/}
        {showChat && (
          <div className="w-[380px] h-full bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 flex items-center gap-3">
              <Avatar name={appointment.doctorName} size="sm"/>
              <div>
                <p className="font-semibold">BS. {appointment.doctorName}</p>
                <p className="text-xs text-gray-500">Đang kết nối…</p>
              </div>
            </div>
            <Divider/>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderRole === 'patient' ? 'justify-end' : 'justify-start'}`}>
                  <Card shadow="none" className={`max-w-[80%] ${msg.senderRole === 'patient' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <CardBody className="p-3 text-sm">{msg.text}</CardBody>
                  </Card>
                </div>
              ))}
            </div>
            <Divider/>
            <div className="p-3 flex gap-2">
              <Input placeholder="Nhập tin nhắn…" className="flex-1" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
              <Button color="success" onPress={handleSendMessage}><Send size={16} /></Button>
            </div>
          </div>
        )}
      </div>
      {/* Modal, info modal (keep unchanged)  ... */}
      <Modal isOpen={isDoctorInfoOpen} onOpenChange={onDoctorInfoOpenChange} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Thông tin bác sĩ</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar
                  src={appointment.doctorAvatar}
                  name={appointment.doctorName}
                  size="lg"
                  className="ring-2 ring-blue-100"
                />
                <div>
                  <h3 className="text-xl font-semibold">BS. {appointment.doctorName}</h3>
                  <p className="text-gray-600">{appointment.specialty}</p>
                  {appointment.doctorRating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{appointment.doctorRating}/5</span>
                    </div>
                  )}
                </div>
              </div>
              <Divider />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{appointment.doctorPhone || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{appointment.doctorEmail}</span>
                </div>
              </div>
              <Divider />
              <div className="space-y-3">
                <h4 className="font-semibold">Chi tiết cuộc hẹn</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{new Date(appointment.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Khám online</span>
                </div>
              </div>
              <Divider />
              <div className="space-y-3">
                <h4 className="font-semibold">Lý do khám của bạn</h4>
                <p className="text-sm text-gray-700">{reasonText}</p>
                {attachments && attachments.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Hình ảnh đính kèm</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={attachment}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(attachment, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all">
                            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDoctorInfoOpenChange}>Đóng</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Agora logic inject video + audio vào UI layout này */}
      {agoraToken && appointmentId && (
        <AgoraVideoCall
          channel={appointmentId}
          token={agoraToken}
          uid={agoraUid}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          muted={muted}
          camOff={camOff}
          onRemoteVideoChange={setHasRemoteVideo}
          /* autoJoin = default true */
        />
      )}
    </div>
  );
}
