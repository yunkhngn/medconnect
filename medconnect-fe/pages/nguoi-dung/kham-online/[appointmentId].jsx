"use client";

import { useRef, useEffect, useState } from "react";
import { Button, Card, CardHeader, CardBody, Avatar, Input, Divider, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea, RadioGroup, Radio } from "@heroui/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, MessageSquare, User, Calendar, Clock, Phone, Mail, MapPin, Camera, Send, Star, CheckCircle, AlertCircle, Flag } from "lucide-react";
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
  const [countdown, setCountdown] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

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

  // Poll appointment status when ONGOING to detect when doctor finishes
  useEffect(() => {
    if (!appointmentId || !appointment || appointment.status !== 'ONGOING') return;
    
    // Use a ref to track the current status to avoid stale closures
    let currentStatus = appointment.status;
    
    const pollInterval = setInterval(async () => {
      // Fetch without setting loading state to avoid reload
      try {
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
          // Only update if status actually changed to avoid unnecessary re-renders
          if (data.status !== currentStatus) {
            currentStatus = data.status;
            setAppointment(prev => {
              // Only update if status changed
              if (prev?.status !== data.status) {
                return data;
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch appointment details:", error);
      }
    }, 5000); // Check every 5 seconds (reduced frequency to avoid reload)
    return () => clearInterval(pollInterval);
  }, [appointmentId, appointment?.status]);

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

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
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

  // Fetch existing feedback when appointment is finished
  useEffect(() => {
    if ((appointment?.status === 'FINISHED' || appointment?.status === 'COMPLETED') && appointmentId) {
      fetchExistingFeedback();
    }
  }, [appointment?.status, appointmentId]);

  const fetchExistingFeedback = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/feedback/appointment/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setExistingFeedback(data.data);
          setFeedbackSubmitted(true);
        } else {
          setShowFeedbackForm(true);
        }
      } else {
        setShowFeedbackForm(true);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      setShowFeedbackForm(true);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
      alert('Vui lòng chọn đánh giá từ 1 đến 5 sao');
      return;
    }
    
    setSubmittingFeedback(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:8080/api/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: appointmentId,
          rating: feedbackRating,
          comment: feedbackComment || ''
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Fetch feedback from server to get complete data
        try {
          const feedbackResp = await fetch(`http://localhost:8080/api/feedback/appointment/${appointmentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (feedbackResp.ok) {
            const feedbackData = await feedbackResp.json();
            if (feedbackData.success && feedbackData.data) {
              setExistingFeedback(feedbackData.data);
            } else {
              // Fallback to local data
              setExistingFeedback({
                rating: feedbackRating,
                comment: feedbackComment,
                createdAt: new Date().toISOString()
              });
            }
          }
        } catch (fetchError) {
          console.error('Failed to fetch feedback after submit:', fetchError);
          // Fallback to local data
          setExistingFeedback({
            rating: feedbackRating,
            comment: feedbackComment,
            createdAt: new Date().toISOString()
          });
        }
        setFeedbackSubmitted(true);
        setShowFeedbackForm(false);
        // Reset form
        setFeedbackRating(5);
        setFeedbackComment("");
        // Reset countdown after feedback submitted
        setCountdown(10);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push('/nguoi-dung/kham-online');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert(data.message || 'Không thể gửi đánh giá');
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert('Lỗi khi gửi đánh giá');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Handle completed appointment countdown (only if feedback submitted)
  useEffect(() => {
    if ((appointment?.status === 'FINISHED' || appointment?.status === 'COMPLETED') && feedbackSubmitted && !showFeedbackForm) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/nguoi-dung/kham-online');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [appointment?.status, feedbackSubmitted, showFeedbackForm, router]);

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

        // Only set initial chat message if chatMessages is empty
        setChatMessages(prev => {
          if (prev.length === 0) {
            return [
              {
                id: 1,
                sender: 'patient',
                message: 'Xin chào bác sĩ, tôi đã sẵn sàng cho cuộc khám.',
                timestamp: new Date()
              }
            ];
          }
          return prev;
        });
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

  if (appointment.status === 'FINISHED' || appointment.status === 'COMPLETED') {
    if (showFeedbackForm && !feedbackSubmitted) {
      return (
        <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="flex flex-col gap-2 pb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-center">Đánh giá phiên khám</h2>
              <p className="text-gray-600 text-center">Chúng tôi rất mong nhận được phản hồi từ bạn</p>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Đánh giá của bạn</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-2 transition-all ${
                        star <= feedbackRating
                          ? 'text-yellow-400 scale-110'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {feedbackRating === 5 && 'Rất hài lòng'}
                  {feedbackRating === 4 && 'Hài lòng'}
                  {feedbackRating === 3 && 'Bình thường'}
                  {feedbackRating === 2 && 'Không hài lòng'}
                  {feedbackRating === 1 && 'Rất không hài lòng'}
                </p>
              </div>
              
              <div>
                <Textarea
                  label="Nhận xét (tùy chọn)"
                  placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                  value={feedbackComment}
                  onValueChange={setFeedbackComment}
                  minRows={4}
                  variant="bordered"
                  classNames={{
                    inputWrapper: "focus-within:border-primary focus-within:ring-0"
                  }}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="bordered"
                  className="flex-1"
                  onPress={() => {
                    setShowFeedbackForm(false);
                    setCountdown(10);
                  }}
                  isDisabled={submittingFeedback}
                >
                  Bỏ qua
                </Button>
                <Button
                  color="primary"
                  className="flex-1"
                  onPress={submitFeedback}
                  isLoading={submittingFeedback}
                >
                  Gửi đánh giá
                </Button>
              </div>
              
              <Divider />
              
              <Button
                color="danger"
                variant="flat"
                startContent={<Flag className="w-4 h-4" />}
                onPress={() => setShowReportModal(true)}
                isDisabled={submittingFeedback}
              >
                Báo xấu bác sĩ
              </Button>
            </CardBody>
          </Card>
          
          {/* Report Modal */}
          <Modal isOpen={showReportModal} onOpenChange={setShowReportModal}>
            <ModalContent>
              <ModalHeader>Báo xấu bác sĩ</ModalHeader>
              <ModalBody>
                <Textarea
                  label="Lý do báo xấu"
                  placeholder="Vui lòng mô tả chi tiết lý do bạn báo xấu bác sĩ này..."
                  value={reportReason}
                  onValueChange={setReportReason}
                  minRows={4}
                  variant="bordered"
                  isRequired
                  classNames={{
                    inputWrapper: "focus-within:border-primary focus-within:ring-0"
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Báo xấu sẽ được gửi đến admin để xem xét. Vui lòng cung cấp thông tin chính xác và chi tiết.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setShowReportModal(false)}>
                  Hủy
                </Button>
                <Button
                  color="danger"
                  onPress={async () => {
                    if (!reportReason.trim()) {
                      alert('Vui lòng điền lý do báo xấu');
                      return;
                    }
                    setSubmittingReport(true);
                    try {
                      const user = auth.currentUser;
                      if (!user) return;
                      const token = await user.getIdToken();
                      const response = await fetch('http://localhost:8080/api/reports', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          appointmentId: appointmentId,
                          reason: reportReason
                        })
                      });
                      const data = await response.json();
                      if (data.success) {
                        alert('Báo xấu đã được gửi thành công. Admin sẽ xem xét.');
                        setShowReportModal(false);
                        setReportReason("");
                      } else {
                        alert(data.message || 'Không thể gửi báo xấu');
                      }
                    } catch (error) {
                      console.error('Failed to submit report:', error);
                      alert('Lỗi khi gửi báo xấu');
                    } finally {
                      setSubmittingReport(false);
                    }
                  }}
                  isLoading={submittingReport}
                >
                  Gửi báo xấu
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      );
    }
    
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Phiên khám đã hoàn thành</h2>
            <p className="text-gray-600">Cảm ơn bạn đã sử dụng dịch vụ khám online của chúng tôi</p>
            {existingFeedback && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= existingFeedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {existingFeedback.comment && (
                  <p className="text-sm text-gray-600 italic">"{existingFeedback.comment}"</p>
                )}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Button 
              color="primary" 
              size="lg" 
              className="w-full font-semibold"
              onPress={() => router.push('/nguoi-dung/kham-online')}
            >
              Quay về danh sách
            </Button>
            <p className="text-sm text-gray-500">
              Tự động quay về sau {countdown} giây...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Video Area - Full width */}
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
              <Button size="md" variant="bordered" color="primary" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900" startContent={<Maximize2 size={18} />} onPress={toggleFullscreen}>Toàn màn hình</Button>
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
              <Button color="danger" variant="bordered" onPress={()=>router.push('/nguoi-dung/kham-online')} className="bg-red-500/80 backdrop-blur-md border border-red-300/30 shadow-lg font-semibold ml-6 text-white">Rời phòng</Button>
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
              <Input 
                placeholder="Nhập tin nhắn…" 
                className="flex-1" 
                variant="flat" 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                classNames={{
                  inputWrapper: "focus-within:ring-0"
                }}
              />
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
