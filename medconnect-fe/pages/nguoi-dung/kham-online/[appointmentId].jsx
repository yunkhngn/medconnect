"use client";

import { useRef, useEffect, useState } from "react";
import { Button, Card, CardHeader, CardBody, Avatar, Input, Divider, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, MessageSquare, User, Calendar, Clock, Phone, Mail, MapPin, Camera, Send, Star, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/router";
import { parseReason, formatReasonForDisplay } from "@/utils/appointmentUtils";
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
  const [tokenError, setTokenError] = useState("");
  const [agoraUid, setAgoraUid] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const n = window.crypto.getRandomValues(new Uint32Array(1))[0];
        return String(n);
      }
      return String(Math.floor(Math.random() * 1000000));
    } catch {
      return String(Math.floor(Math.random() * 1000000));
    }
  });
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [remoteCamOff, setRemoteCamOff] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);

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
    if (!appointmentId || !agoraUid) return;
    const fetchToken = async () => {
      try {
        const tokenResp = await fetch(
          `http://localhost:8080/api/agora/token?channel=${appointmentId}&uid=${agoraUid}`
        );
        if (tokenResp.ok) {
          const data = await tokenResp.json();
          setAgoraToken(data.token);
          setTokenError("");
        } else {
          console.warn('[Patient] Failed to fetch Agora token:', tokenResp.status);
          setAgoraToken("");
          setTokenError(`Không lấy được token (HTTP ${tokenResp.status})`);
        }
      } catch (e) {
        console.error('[Patient] Error fetching Agora token:', e);
        setAgoraToken("");
        setTokenError('Không lấy được token. Vui lòng thử lại');
      }
    };
    fetchToken();
  }, [appointmentId, agoraUid]);

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
    if (text) {
      await sendChatMessage(appointmentId, {
        senderId: user?.uid,
        senderName: user?.displayName || "Bệnh nhân",
        senderRole: "patient",
        text,
      });
    }
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

  // Parse reason safely
  const reasonData = parseReason(appointment.reason);
  const reasonText = reasonData?.reasonText ? String(reasonData.reasonText) : '';
  const attachments = Array.isArray(reasonData?.attachments) ? reasonData.attachments : [];

  // Derive doctor info from appointment (with fallbacks)
  const doctorName = appointment?.doctor?.name || appointment?.doctorName || 'Bác sĩ';
  const doctorAvatar = appointment?.doctor?.avatar || appointment?.doctorAvatar || undefined;
  const doctorPhone = appointment?.doctor?.phone || appointment?.doctorPhone || '';
  const doctorEmail = appointment?.doctor?.email || appointment?.doctorEmail || '';
  const doctorSpecialty = appointment?.doctor?.specialization || appointment?.doctor?.specialty || appointment?.specialty || '';

  // Parse appointment date safely
  const apptDateObj = appointment?.appointmentDate ? new Date(appointment.appointmentDate) : (appointment?.date ? new Date(appointment.date) : null);
  const apptDateStr = apptDateObj && !isNaN(apptDateObj.getTime()) ? apptDateObj.toLocaleDateString('vi-VN') : '—';
  const apptTimeStr = apptDateObj && !isNaN(apptDateObj.getTime()) ? apptDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';

  if (appointment.status !== 'ONGOING') return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">{appointment.status === 'CONFIRMED' ? 'Phòng đang chờ bác sĩ bắt đầu' : 'Chờ xác nhận hoặc đã kết thúc...'}</p>
        <Button color="default" onClick={() => router.push('/nguoi-dung/kham-online')} className="mt-4">Quay lại</Button>
      </div>
    </div>
  );

  // Derive names/avatars for header (patient view)
  const selfName = auth.currentUser?.displayName || appointment?.patientName || 'Bạn';
  const selfAvatar = auth.currentUser?.photoURL || appointment?.patientAvatar || undefined;
  const rawDoctorName = appointment?.doctorName || appointment?.doctor?.name || 'Bác sĩ';
  const partnerName = /^\s*BS\.?/i.test(rawDoctorName) ? rawDoctorName : `BS. ${rawDoctorName}`;
  const partnerAvatar = appointment?.doctorAvatar || appointment?.doctor?.avatar || undefined;

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        {/* Left: Side Panel */}
        <div className="w-[300px] h-full bg-gray-50 overflow-y-auto border-r border-gray-200">
          <div className="p-4 space-y-4">
            {/* Stats Cards */}
            <div className="space-y-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Thời gian khám</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{formatTime(seconds)}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center">
                      <Clock className="text-blue-700" size={20} />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Trạng thái</p>
                      <p className="text-lg font-bold text-green-900 mt-1">{remoteConnected ? 'Đã kết nối' : 'Chờ kết nối'}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-300 rounded-full flex items-center justify-center">
                      {remoteConnected ? <CheckCircle className="text-green-700" size={20} /> : <AlertCircle className="text-green-700" size={20} />}
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-teal-100 uppercase tracking-wide">Phiên khám</p>
                      <p className="text-xl font-bold mt-1">Online</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Video className="text-white" size={20} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Doctor Quick Info */}
            <Card>
              <CardHeader className="flex gap-3 pb-2">
                <User className="text-teal-600" size={20} />
                <h3 className="text-sm font-semibold">Thông tin nhanh</h3>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Bác sĩ:</span>
                  <span className="text-gray-600 truncate">{partnerName}</span>
                </div>
                {doctorSpecialty && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Chuyên khoa:</span>
                    <span className="text-gray-600 truncate">{doctorSpecialty}</span>
                  </div>
                )}
                {doctorPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-gray-400" />
                    <span className="text-gray-600 truncate">{doctorPhone}</span>
                  </div>
                )}
                {doctorEmail && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gray-400" />
                    <span className="text-gray-600 truncate">{doctorEmail}</span>
                  </div>
                )}
                {apptDateStr !== '—' && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-gray-600">{apptDateStr} {apptTimeStr}</span>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-700">Chú thích</h3>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Đã kết nối</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Chờ kết nối</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Đang khám</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Center: Video Area */}
        <div className="flex-1 min-w-0 relative bg-black">
          {/* Remote video fill area */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div ref={remoteVideoRef} className="w-full h-full" />
            {!hasRemoteVideo && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                {remoteConnected ? (
                  <span className="bg-black bg-opacity-60 px-5 py-2 rounded-xl text-white text-lg font-medium">Bác sĩ đang tắt camera</span>
                ) : (
                  <span className="bg-black bg-opacity-60 px-5 py-2 rounded-xl text-white text-lg font-medium">Đang đợi kết nối với Bác sĩ</span>
                )}
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
              <Chip color="success" variant="bordered" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900">Phiên khám online • Bệnh nhân</Chip>
              <Chip variant="bordered" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900">{formatTime(seconds)}</Chip>
              <Button size="md" variant="bordered" color="primary" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900" onPress={onDoctorInfoOpen} startContent={<User size={18} />}>Thông tin bác sĩ</Button>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto pr-2">
              <Button size="md" variant="bordered" color="primary" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900" startContent={<Maximize2 size={18} />}>Toàn màn hình</Button>
              <Button size="md" variant="bordered" color="primary" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900" onPress={()=>setShowChat(v=>!v)} startContent={<MessageSquare size={18}/> }>Chat</Button>
            </div>
          </div>
          {tokenError && (
            <div className="absolute left-0 right-0 top-16 px-4 flex justify-center z-20">
              <div className="bg-red-600 text-white text-sm px-3 py-2 rounded-md shadow">{tokenError}</div>
            </div>
          )}
          {/* Controls bottom - mute/tắt cam/leave giống doctor */}
          <div className="absolute left-0 right-0 bottom-0 pb-6 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md rounded-full px-4 py-3 border border-white/30 shadow-lg">
              <Button isIconOnly variant="bordered" color={muted ? "warning" : "default"} onPress={()=>setMuted(v => !v)} className="bg-white/40 border border-white/30 shadow-md" title={muted?"Bật mic":"Tắt mic"}>{muted ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}</Button>
              <Button isIconOnly variant="bordered" color={camOff ? "warning" : "default"} onPress={()=>setCamOff(v => !v)} className="bg-white/40 border border-white/30 shadow-md" title={camOff?"Bật camera":"Tắt camera"}>{camOff ? <VideoOff className="w-5 h-5"/> : <Video className="w-5 h-5"/>}</Button>
              <Button color="danger" variant="bordered" onPress={()=>window.location.href='/nguoi-dung/kham-online'} className="bg-red-500/80 backdrop-blur-md border border-red-300/30 shadow-lg font-semibold ml-6 text-white">Rời phòng</Button>
            </div>
          </div>
        </div>
        {/* Right: Chat and modal info... (unchanged)*/}
        {showChat && (
          <div className="w-[380px] h-full bg-gray-50 flex flex-col">
            {/* Header trạng thái kết nối + avatar bác sĩ */}
            <div className="p-4 flex items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Avatar src={partnerAvatar} name={partnerName} size="sm"/>
                <div className="flex flex-col">
                  <p className="font-semibold">{partnerName}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`inline-block w-2 h-2 rounded-full ${remoteConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-gray-600">{remoteConnected ? 'Đã kết nối' : 'Đang kết nối…'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderRole === 'patient' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl ${msg.senderRole === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} px-4 py-2.5`}>
                    <div className="text-sm whitespace-pre-wrap break-words">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 flex gap-2 items-center bg-gray-50/50">
              <Input placeholder="Nhập tin nhắn…" className="flex-1" variant="flat" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
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
                  src={doctorAvatar}
                  name={doctorName}
                  size="lg"
                  className="ring-2 ring-blue-100"
                />
                <div>
                  <h3 className="text-xl font-semibold">{doctorName}</h3>
                  {doctorSpecialty && <p className="text-gray-600">{doctorSpecialty}</p>}
                  {appointment?.doctorRating && (
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
                  <span className="text-sm">{doctorPhone || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{doctorEmail || "Chưa cập nhật"}</span>
                </div>
              </div>
              <Divider />
              <div className="space-y-3">
                <h4 className="font-semibold">Chi tiết cuộc hẹn</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{apptDateStr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{apptTimeStr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Khám online</span>
                </div>
              </div>
              <Divider />
              <div className="space-y-3">
                <h4 className="font-semibold">Lý do khám của bạn</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{formatReasonForDisplay(appointment.reason)}</p>
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
      <AgoraVideoCall
        channel={appointmentId}
        token={agoraToken}
        uid={agoraUid}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        muted={muted}
        camOff={camOff}
        onRemoteVideoChange={setHasRemoteVideo}
        onRemotePresenceChange={setRemoteConnected}
        /* autoJoin = default true */
        autoJoin={!!agoraToken}
      />
    </div>
  );
}
