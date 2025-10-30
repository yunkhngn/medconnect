"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Avatar, Input, Divider, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Maximize2, MessageSquare, User, Calendar, Clock, Phone, Mail, MapPin, FileText, Camera, Send } from "lucide-react";
import { useRouter } from "next/router";
import { parseReason } from "@/utils/appointmentUtils";
import { auth } from "@/lib/firebase";

export default function DoctorOnlineExamRoom() {
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
  const { isOpen: isPatientInfoOpen, onOpen: onPatientInfoOpen, onOpenChange: onPatientInfoOpenChange } = useDisclosure();

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

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: 'doctor',
        message: chatMessage.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage("");
    }
  };

  const handleStartAppointment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/start`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setAppointment(prev => ({ ...prev, status: 'ONGOING' }));
      }
    } catch (error) {
      console.error("Failed to start appointment:", error);
    }
  };

  const handleEndAppointment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/finish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setAppointment(prev => ({ ...prev, status: 'FINISHED' }));
        router.push('/bac-si/kham-online');
      }
    } catch (error) {
      console.error("Failed to end appointment:", error);
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
          <Button color="primary" onPress={() => router.push('/bac-si/kham-online')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const { reasonText, attachments } = parseReason(appointment.reason);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        {/* Left: Video Area (8/12 width) */}
        <div className="flex-1 min-w-0 relative bg-black">
          {/* Remote video placeholder - fill whole area */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-zinc-950 to-zinc-800" />
          </div>

          {/* Local preview */}
          <div className="absolute right-5 top-5 w-56 aspect-video rounded-xl bg-gray-800/70 ring-1 ring-white/15 flex items-center justify-center text-white/70 text-xs select-none">
            Doctor preview
          </div>

          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 p-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3">
              <Chip color="primary" variant="flat">Phiên khám online • Bác sĩ</Chip>
              <Chip variant="flat">{formatTime(seconds)}</Chip>
              <Button
                size="sm"
                variant="flat"
                color="default"
                onPress={onPatientInfoOpen}
                startContent={<User size={16} />}
              >
                Thông tin bệnh nhân
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
              {appointment.status === 'CONFIRMED' && (
                <Button color="success" onPress={handleStartAppointment} className="font-semibold">
                  Bắt đầu khám
                </Button>
              )}
              {appointment.status === 'ONGOING' && (
                <Button color="danger" onPress={handleEndAppointment} className="font-semibold">
                  Kết thúc khám
                </Button>
              )}
              {appointment.status === 'FINISHED' && (
                <Button color="default" onPress={() => router.push('/bac-si/kham-online')} className="font-semibold">
                  Quay lại
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Chat panel (4/12 width) */}
        {showChat && (
          <div className="w-[380px] h-full bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 flex items-center gap-3">
              <Avatar name={appointment.patientName} size="sm"/>
              <div>
                <p className="font-semibold">{appointment.patientName}</p>
                <p className="text-xs text-gray-500">Đang kết nối…</p>
              </div>
            </div>
            <Divider/>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <Card 
                    shadow="none" 
                    className={`max-w-[80%] ${
                      msg.sender === 'doctor' 
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

      {/* Patient Info Modal */}
      <Modal isOpen={isPatientInfoOpen} onOpenChange={onPatientInfoOpenChange} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Thông tin bệnh nhân</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Patient Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar
                  src={appointment.patientAvatar}
                  name={appointment.patientName}
                  size="lg"
                  className="ring-2 ring-blue-100"
                />
                <div>
                  <h3 className="text-xl font-semibold">{appointment.patientName}</h3>
                  <p className="text-gray-600">Bệnh nhân</p>
                </div>
              </div>

              <Divider />

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{appointment.patientPhone || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{appointment.patientEmail}</span>
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
                <h4 className="font-semibold">Lý do khám</h4>
                <p className="text-sm text-gray-700">{reasonText}</p>
                
                {/* Attachments */}
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
            <Button color="default" variant="light" onPress={onPatientInfoOpenChange}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
