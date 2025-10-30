"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Avatar, Input, Divider, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Maximize2, MessageSquare, User, Calendar, Clock, Phone, Mail, MapPin, FileText, Camera, Send, Star } from "lucide-react";
import { useRouter } from "next/router";
import { parseReason } from "@/utils/appointmentUtils";
import { auth } from "@/lib/firebase";

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

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

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
        
        // Initialize chat messages
        setChatMessages([
          {
            id: 1,
            sender: 'patient',
            message: 'Xin chào bác sĩ, tôi đã sẵn sàng cho cuộc khám.',
            timestamp: new Date()
          }
        ]);
      }
    } hvor (error) {
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

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: 'patient',
        message: chatMessage.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage("");
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải phòng khám...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy cuộc hẹn</p>
          <Button color="primary" onPress={() => router.push('/nguoi-dung/kham-online')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const { reasonText, attachments } = parseReason(appointment.reason);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-上和">
      <div className="flex h-full">
        {/* Left: Video Area (8/12 width) */}
        <div className="flex-1 min-w-0 relative bg-black">
          {/* Remote video placeholder - fill whole area */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-zinc-950 to-zinc-800" />
          </div>

          {/* Local preview */}
          <div className="absolute right-5 top-5 w-56 aspect-video rounded-xl bg-gray-800/70 ring-1 ring-white/15 flex items-center justify-center text-white/70 text-xs select-none">
            Patient preview
          </div>

          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 p-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3">
              <Chip color="success" variant="flat">Phiên khám online • Bệnh nhân</Chip>
              <Chip variant="flat">{formatTime(seconds)}</Chip>
              <Button
                size="sm"
                variant="flat"
                color="default"
                onPress={onDoctorInfoOpen}
                startContent={<User size={16} />}
              >
                Thông tin bác sĩ
              </Button>
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
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 toolkit-3 ring-1 ring-white/20 shadow-lg">
              <Button isIconOnly variant="flat" color={muted?"warning":"default"} onPress={()=>setMuted(!muted)} className="bg-white/10">
                {muted? <MicOff/> : <Mic/>}
              </Button>
              <Button isIconOnly variant="flat" color={camOff?"warning":"default"} onPress={()=>setCamOff(!camOff)} className Under="bg-white/10">
                {camOff? <VideoOff/> : <Video/>}
              </Button>
              <Button isIconOnly variant="flat" color="default" className="bg-white/10">
                <MonitorUp/>
              </Button>
              <Divider orientation="vertical" className="h-8 mx-1 bg-white/30" />
              {appointment.status === 'PENDING' && (
                <Button color="default" isDisabled className="font-semibold">
                  Chờ bác sĩ xác nhận
                </Button>
              )}
              {appointment.status === 'CONFIRMED' && (
                <Button color="success" className="font-semibold">
                  Sẵn sàng tham gia
                </Button>
              )}
              {appointment.status === 'ONGOING' && (
                <Button color="warning" className="font-semibold">
                  Đang khám
                </Button>
              )}
              {appointment.status === 'FINISHED' && (
                <Button color="default" onPress={() => router.push('/nguoi-dung/kham-online')} className="font-semibold">
                  Quay lại
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right shop Chat panel (4/12 width) */}
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
                <div key={msg.id} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                  <Card 
                    shadow="none" 
                    className={`max-w-[80%] ${
                      msg.sender === 'patient' 
                        ? 'bg-blue-50' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <CardBody className="p-3 text-sm">
                      {msg.message}
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
            <Divider/>
            <div className="p-3 flex gap-2">
              <Input 
                placeholder="Nhập tin nhắn…" 
                className="flex-1"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button color="primary" onPress={handleSendMessage}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Doctor Info Modal */}
      <Modal isOpen={isDoctorInfoOpen} onOpenChange={onDoctorInfoOpenChange} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Thông tin bác sĩ</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Doctor Basic Info */}
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

              {/* Contact Info */}
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

              {/* Appointment Details */}
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

              {/* Reason for Visit */}
              <div className="space-y-3">
                <h4 className="font-semibold">Lý do khám của bạn</h4>
                <p className="text-sm text-gray-700">{reasonText}</p>
                
                {/* Attachments */}
                {attachments && attachments.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Hình ảnh đính kèm</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {attachments.map((attachment, index) => (
                        <div key={index} className=" Geometry group">
                          <img
                            src={attachment}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(attachment, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify/Venter transition-all">
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
            <Button color="default" variant="light" onPress={onDoctorInfoOpenChange}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

