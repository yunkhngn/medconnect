"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Avatar, Chip, Input, Select, SelectItem, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea, Tabs, Tab } from "@heroui/react";
import { Calendar, Clock, User, Phone, Mail, MapPin, Search, Filter, Plus, Star, Flag } from "lucide-react";
import { useRouter } from "next/router";
import Grid from "@/components/layouts/Grid";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { auth } from "@/lib/firebase";
import { parseReason, formatReasonForDisplay, formatSlotTime } from "@/utils/appointmentUtils";
import DOMPurify from 'dompurify';
import { getApiUrl } from "@/utils/api";


export default function PatientOfflineExamList() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rxLoading, setRxLoading] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [paymentByAptId, setPaymentByAptId] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    fetchOfflineAppointments();
  }, []);

  // Fetch feedback when modal opens and appointment is selected
  useEffect(() => {
    if (isOpen && selectedAppointment) {
      const fetchFeedback = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;
          const token = await user.getIdToken();
          const aptId = selectedAppointment.id || selectedAppointment.appointmentId;
          if (aptId) {
            const feedbackResp = await fetch(`${getApiUrl()}/feedback/appointment/${aptId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (feedbackResp.ok) {
              const feedbackData = await feedbackResp.json();
              console.log('[Patient Modal] Feedback response (useEffect):', feedbackData);
              if (feedbackData.success && feedbackData.data) {
                console.log('[Patient Modal] Setting feedback (useEffect):', feedbackData.data);
                setFeedback(feedbackData.data);
              } else {
                setFeedback(null);
              }
            } else {
              setFeedback(null);
            }
          }
        } catch (e) {
          console.error('[Patient Modal] Error fetching feedback (useEffect):', e);
          setFeedback(null);
        }
      };
      fetchFeedback();
    }
  }, [isOpen, selectedAppointment]);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const user = auth.currentUser; if (!user) return;
        const token = await user.getIdToken();
        const ids = (appointments||[]).map(a=>a.id || a.appointmentId).filter(Boolean);
        const results = await Promise.all(ids.map(async (id)=>{
          try {
            const resp = await fetch(`${getApiUrl()}/payment/appointment/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!resp.ok) return [id, { hasPaid:false }];
            const data = await resp.json();
            return [id, { hasPaid: !!(data.hasPaid || data.status==='PAID'), status: data.status || 'UNPAID' }];
          } catch { return [id, { hasPaid:false }]; }
        }));
        setPaymentByAptId(Object.fromEntries(results));
      } catch {}
    };
    if (appointments.length) loadPayments();
  }, [appointments]);

  const openAppointmentModal = async (apt) => {
    setSelectedAppointment(apt);
    setPrescription(null);
    setMedicalRecord(null);
    setFeedback(null);
    setFeedbackRating(5);
    setFeedbackComment("");
    setActiveTab("details");
    onOpen();
    try {
      setRxLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      
      // Fetch appointment details to get full info
      let aptData = null;
      try {
        const aptResp = await fetch(`${getApiUrl()}/appointments/${apt.id || apt.appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (aptResp.ok) {
          aptData = await aptResp.json();
          apt = { ...apt, ...aptData };
        }
      } catch (aptErr) {
        console.error('[Patient Modal] Error fetching appointment details:', aptErr);
      }
      
      const updatedAppointment = {
        ...apt,
        ...(aptData || {}),
        patientName: aptData?.patient?.name || aptData?.patientName || apt.patientName || apt.patient?.name || auth.currentUser?.displayName,
        patientPhone: aptData?.patient?.phone || aptData?.patientPhone || apt.patientPhone || apt.patient?.phone,
        patientEmail: aptData?.patient?.email || aptData?.patientEmail || apt.patientEmail || apt.patient?.email || auth.currentUser?.email,
        patientAddress: aptData?.patient?.address || aptData?.patientAddress || apt.patientAddress || apt.patient?.address,
        patient: aptData?.patient || apt.patient
      };
      
      setSelectedAppointment(updatedAppointment);
      
      // Get patientUserId from appointment
      const patientUserId = apt.patientUserId || apt.patientId || apt.patient?.id || apt.patient?.userId;
      
      if (patientUserId) {
        // Fetch medical record entries for this patient
        const resp = await fetch(`${getApiUrl()}/medical-records/patient/${patientUserId}/entries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (resp.ok) {
          const entries = await resp.json();
          let matchingEntry = null;
          
          if (Array.isArray(entries) && entries.length > 0) {
            // First, try to match by appointment_id (most accurate)
            matchingEntry = entries.find(entry => {
              const entryApptId = entry.appointment_id || entry.appointmentId;
              const aptId = apt.id || apt.appointmentId;
              return entryApptId && String(entryApptId) === String(aptId);
            });
            
            // If no appointment_id match, try to match by date + time
            if (!matchingEntry && apt.date) {
              const aptDate = new Date(apt.date);
              const aptDateStr = aptDate.toISOString().split('T')[0];
              
              // Try exact date match first
              const exactDateMatches = entries.filter(entry => {
                if (!entry.visit_date) return false;
                const visitDate = new Date(entry.visit_date);
                const visitDateStr = visitDate.toISOString().split('T')[0];
                return visitDateStr === aptDateStr;
              });
              
              if (exactDateMatches.length === 1) {
                matchingEntry = exactDateMatches[0];
              } else if (exactDateMatches.length > 1) {
                // Multiple entries on same date - find the one closest to appointment time
                const slotTime = formatSlotTime(apt.slot);
                if (slotTime) {
                  const [startTime] = slotTime.split(' - ');
                  const [aptHour, aptMinute] = startTime.split(':').map(Number);
                  const aptTimeMinutes = aptHour * 60 + aptMinute;
                  
                  const entriesWithTimeDiff = exactDateMatches
                    .filter(entry => entry.visit_time)
                    .map(entry => {
                      const [visitHour, visitMinute] = entry.visit_time.split(':').map(Number);
                      const visitTimeMinutes = visitHour * 60 + visitMinute;
                      const timeDiff = Math.abs(aptTimeMinutes - visitTimeMinutes);
                      return { ...entry, timeDiff };
                    })
                    .sort((a, b) => a.timeDiff - b.timeDiff);
                  
                  if (entriesWithTimeDiff.length > 0 && entriesWithTimeDiff[0].timeDiff <= 240) {
                    matchingEntry = entriesWithTimeDiff[0];
                  } else {
                    matchingEntry = exactDateMatches[0];
                  }
                } else {
                  matchingEntry = exactDateMatches[0];
                }
              }
            }
          }
          
          if (matchingEntry) {
            setMedicalRecord(matchingEntry);
            const meds = matchingEntry.prescriptions || [];
            setPrescription({
              medications: Array.isArray(meds) ? meds : [],
              note: matchingEntry.notes || ""
            });
          } else {
            setMedicalRecord(null);
            setPrescription(null);
          }
        } else if (resp.status === 404) {
          setMedicalRecord(null);
          setPrescription(null);
        } else {
          setMedicalRecord(null);
          setPrescription(null);
        }
      }
    } catch (e) {
      console.error('[Patient Modal] Error fetching medical record:', e);
      setMedicalRecord(null);
      setPrescription(null);
    } finally {
      setRxLoading(false);
    }
    
    // Fetch feedback
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const aptId = apt.id || apt.appointmentId;
      if (aptId) {
        const feedbackResp = await fetch(`${getApiUrl()}/feedback/appointment/${aptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (feedbackResp.ok) {
          const feedbackData = await feedbackResp.json();
          console.log('[Patient Modal] Feedback response:', feedbackData);
          if (feedbackData.success && feedbackData.data) {
            console.log('[Patient Modal] Setting feedback:', feedbackData.data);
            setFeedback(feedbackData.data);
          } else {
            console.log('[Patient Modal] No feedback data found');
            setFeedback(null);
          }
        } else {
          console.log('[Patient Modal] Feedback response not ok:', feedbackResp.status);
          setFeedback(null);
        }
      }
    } catch (e) {
      console.error('[Patient Modal] Error fetching feedback:', e);
      setFeedback(null);
    }
  };

  const submitFeedback = async () => {
    if (!selectedAppointment) return;
    setSubmittingFeedback(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const aptId = selectedAppointment.id || selectedAppointment.appointmentId;
      const response = await fetch(`${getApiUrl()}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: aptId,
          rating: feedbackRating,
          comment: feedbackComment || ''
        })
      });
      const data = await response.json();
      if (data.success) {
        // Fetch feedback from server to get complete data
        try {
          const feedbackResp = await fetch(`${getApiUrl()}/feedback/appointment/${aptId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (feedbackResp.ok) {
            const feedbackData = await feedbackResp.json();
            if (feedbackData.success && feedbackData.data) {
              setFeedback(feedbackData.data);
            }
          }
        } catch (fetchError) {
          console.error('Failed to fetch feedback after submit:', fetchError);
          // Fallback to local data
          setFeedback({
            rating: feedbackRating,
            comment: feedbackComment,
            createdAt: new Date().toISOString()
          });
        }
        // Reset form
        setFeedbackRating(5);
        setFeedbackComment("");
        alert('Đánh giá đã được gửi thành công!');
      } else {
        alert(data.message || 'Không thể gửi đánh giá');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Lỗi khi gửi đánh giá');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const fetchOfflineAppointments = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`${getApiUrl()}/appointments/my?type=OFFLINE`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Normalize to expected shape for UI
        const normalized = (data || []).map((apt) => {
          const doctor = apt.doctor || {};
          return {
            ...apt,
            doctorName: apt.doctorName || doctor.doctorName || doctor.name || '',
            doctorAvatar: apt.doctorAvatar || doctor.doctorAvatar || doctor.avatar || '',
            specialty: apt.specialty || doctor.specialty || doctor.specialization || '',
          };
        });
        setAppointments(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch offline appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const doctorName = (apt.doctorName || apt.doctor?.doctorName || apt.doctor?.name || '').toLowerCase();
    const specialty = (apt.specialty || apt.doctor?.specialty || apt.doctor?.specialization || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch = doctorName.includes(query) || specialty.includes(query);
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handlePay = (appointmentId) => {
    router.push(`/thanh-toan/${appointmentId}`);
  };

  const handleCancel = async (appointmentId) => {
    try {
      const user = auth.currentUser; if (!user) return;
      const token = await user.getIdToken();
      const resp = await fetch(`${getApiUrl()}/appointments/${appointmentId}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        setAppointments(prev => prev.map(a => ((a.id||a.appointmentId)===appointmentId ? { ...a, status: 'CANCELLED' } : a)));
      }
    } catch(e){ console.error('Cancel failed', e); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "warning";
      case "CONFIRMED": return "primary";
      case "ONGOING": return "success";
      case "FINISHED": return "default";
      case "CANCELLED": return "danger";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING": {
        // This function is called without appointmentId, so we can't check payment here
        // The actual status text is handled in the component where payment info is available
        return "Chờ xác nhận";
      }
      case "CONFIRMED": return "Đã xác nhận";
      case "ONGOING": return "Đang khám";
      case "FINISHED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  if (loading) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PatientFrame>
    );
  }

  const leftChildren = (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng cuộc hẹn</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sắp tới</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === "CONFIRMED").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Plus className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Thao tác nhanh</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <Button
            fullWidth
            color="primary"
            startContent={<Plus size={18} />}
            onPress={() => router.push("/nguoi-dung/dat-lich-kham")}
          >
            Đặt lịch khám mới
          </Button>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="flex gap-3">
          <Filter className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Bộ lọc</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Tìm kiếm</label>
            <Input
              placeholder="Tên bác sĩ, chuyên khoa..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              variant="bordered"
              classNames={{
                inputWrapper: "focus-within:border-primary focus-within:ring-0"
              }}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Trạng thái</label>
            <Select
              selectedKeys={statusFilter !== "all" ? [statusFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setStatusFilter(selected || "all");
              }}
            >
              <SelectItem key="all">Tất cả</SelectItem>
              <SelectItem key="PENDING">Chờ xác nhận</SelectItem>
              <SelectItem key="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem key="ONGOING">Đang khám</SelectItem>
              <SelectItem key="FINISHED">Hoàn thành</SelectItem>
              <SelectItem key="CANCELLED">Đã hủy</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Legend Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Calendar className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Chú thích</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-300 rounded"></div>
            <span>Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
            <span>Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded"></div>
            <span>Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
            <span>Đã hủy</span>
          </div>
          <Divider />
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-orange-600" />
            <span>Tại phòng khám</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const rightChildren = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch khám tại phòng khám</h1>
        <Chip color="primary" variant="flat">
          {filteredAppointments.length} cuộc hẹn
        </Chip>
      </div>

      {filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch hẹn tại phòng khám</h3>
          <p className="text-gray-500 mb-4">Bạn chưa có cuộc hẹn khám tại phòng khám nào</p>
          <Button
            color="primary"
            onPress={() => router.push('/nguoi-dung/dat-lich-kham')}
          >
            Đặt lịch khám
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAppointments.map((appointment) => {
            const date = new Date(appointment.date).toLocaleDateString('vi-VN');
            const time = formatSlotTime(appointment.slot);
            const isPending = appointment.status === "PENDING";
            const payInfo = paymentByAptId[appointment.id] || paymentByAptId[appointment.appointmentId];
            return (
              <Card
                key={appointment.id || appointment.appointmentId}
                className={`hover:shadow-md transition rounded-2xl ${isPending ? 'border-4 border-yellow-400' : 'border-2 border-gray-200'}`}
              >
                <CardBody className="p-5">
                  {/* Header with profile picture, name, and status tags */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img 
                        src={appointment.doctorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.doctorName||'BS')}&background=0D9488&color=fff`} 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-400" 
                        alt="avatar"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{appointment.doctorName}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getStatusColor(appointment.status)}
                        >
                          {getStatusText(appointment.status)}
                        </Chip>
                        <Chip size="sm" variant="flat" color="default" startContent={<MapPin size={12}/>}>Tại phòng khám</Chip>
                        {typeof payInfo !== 'undefined' && (
                          <Chip size="sm" variant="flat" color={payInfo?.hasPaid ? 'success' : 'warning'}>
                            {payInfo?.hasPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details grid - 2 columns */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Left column */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Ngày khám</p>
                          <p className="font-bold text-gray-900">{date}</p>
                        </div>
                      </div>
                      {appointment.doctorPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700">{appointment.doctorPhone}</span>
                        </div>
                      )}
                    </div>
                    {/* Right column */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Giờ khám</p>
                          <p className="font-bold text-gray-900">{time}</p>
                        </div>
                      </div>
                      {appointment.doctorEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{appointment.doctorEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reason section */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Lý do khám</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-line">
                      {formatReasonForDisplay(appointment.reason)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <Divider className="my-4" />
                  <div className="flex gap-2">
                    {appointment.status === "PENDING" && (
                      payInfo?.hasPaid ? (
                        <Button
                          color="default"
                          size="sm"
                          variant="flat"
                          className="flex-1"
                          isDisabled
                        >
                          Chờ bác sĩ xác nhận
                        </Button>
                      ) : (
                        <>
                          <Button
                            color="primary"
                            size="sm"
                            className="flex-1"
                            onClick={(ev)=>{ev?.stopPropagation?.(); handlePay(appointment.id || appointment.appointmentId);}}
                          >
                            Thanh toán
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            variant="flat"
                            onClick={(ev)=>{ev?.stopPropagation?.(); handleCancel(appointment.id || appointment.appointmentId);}}
                          >
                            Hủy lịch
                          </Button>
                        </>
                      )
                    )}
                    {appointment.status === "CONFIRMED" && (
                      <Button
                        color="default"
                        size="sm"
                        variant="flat"
                        className="flex-1"
                      >
                        Đã xác nhận
                      </Button>
                    )}
                    {appointment.status === "FINISHED" && (
                      <>
                      <Button
                        color="default"
                        size="sm"
                        variant="flat"
                        className="flex-1"
                        onPress={() => openAppointmentModal(appointment)}
                      >
                        Xem lại
                      </Button>
                        <Button
                          color="warning"
                          size="sm"
                          variant="flat"
                          startContent={<Star className="w-4 h-4" />}
                          onPress={() => {
                            openAppointmentModal(appointment);
                            setActiveTab("feedback");
                          }}
                        >
                          Đánh giá
                        </Button>
                      </>
                    )}
                    {appointment.status === "CANCELLED" && (
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        className="flex-1"
                        isDisabled
                      >
                        Đã hủy
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <PatientFrame>
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Modal for prescription or details */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent className="max-h-[90vh]">
          <ModalHeader className="flex flex-col gap-1">
            {selectedAppointment?.patientName || selectedAppointment?.patient?.name || "Chi tiết cuộc hẹn"}
          </ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {rxLoading ? (
              <div className="text-center py-8">
                <p>Đang tải thông tin...</p>
              </div>
            ) : selectedAppointment ? (
              <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key)}>
                <Tab key="details" title="Chi tiết">
                  <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Bệnh nhân: {selectedAppointment.patientName || selectedAppointment.patient?.name || "Chưa có"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Ngày khám: {new Date(selectedAppointment.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Giờ khám: {formatSlotTime(selectedAppointment.slot)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>Số điện thoại: {selectedAppointment.patientPhone || selectedAppointment.patient?.phone || "Chưa có"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>Email: {selectedAppointment.patientEmail || selectedAppointment.patient?.email || "Chưa có"}</span>
                </div>
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Lý do khám</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line break-words pl-4">
                  {medicalRecord?.chief_complaint || formatReasonForDisplay(selectedAppointment.reason) || "Không có thông tin"}
                </p>
                
                {medicalRecord && (
                  <>
                    {medicalRecord.diagnosis && (
                      <>
                        <Divider className="my-4" />
                        <h4 className="text-sm font-medium text-gray-700">Chẩn đoán</h4>
                        <div className="pl-4">
                          {typeof medicalRecord.diagnosis === 'string' ? (
                            <p className="text-sm text-gray-600 break-words whitespace-pre-line">{medicalRecord.diagnosis}</p>
                          ) : (
                            <>
                              {medicalRecord.diagnosis.primary && (
                                <p className="text-sm text-gray-600 mb-2 break-words">
                                  <span className="font-semibold">Chẩn đoán chính:</span> {medicalRecord.diagnosis.primary}
                                </p>
                              )}
                              {medicalRecord.diagnosis.icd_codes && Array.isArray(medicalRecord.diagnosis.icd_codes) && medicalRecord.diagnosis.icd_codes.length > 0 && (
                                <p className="text-sm text-gray-600 mb-2 break-words">
                                  <span className="font-semibold">Mã ICD-10:</span> {medicalRecord.diagnosis.icd_codes.join(", ")}
                                </p>
                              )}
                              {medicalRecord.diagnosis.secondary && Array.isArray(medicalRecord.diagnosis.secondary) && medicalRecord.diagnosis.secondary.length > 0 && (
                                <p className="text-sm text-gray-600 break-words">
                                  <span className="font-semibold">Chẩn đoán phụ:</span> {medicalRecord.diagnosis.secondary.join(", ")}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                    
                    {medicalRecord.vital_signs && Object.keys(medicalRecord.vital_signs).length > 0 && (
                      <>
                        <Divider className="my-4" />
                        <h4 className="text-sm font-medium text-gray-700">Dấu hiệu sinh tồn</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 break-words pl-4">
                          {medicalRecord.vital_signs.temperature && (
                            <div className="break-words">Nhiệt độ: {medicalRecord.vital_signs.temperature} °C</div>
                          )}
                          {medicalRecord.vital_signs.blood_pressure && (
                            <div className="break-words">Huyết áp: {medicalRecord.vital_signs.blood_pressure} mmHg</div>
                          )}
                          {medicalRecord.vital_signs.heart_rate && (
                            <div className="break-words">Nhịp tim: {medicalRecord.vital_signs.heart_rate} bpm</div>
                          )}
                          {medicalRecord.vital_signs.oxygen_saturation && (
                            <div className="break-words">SpO2: {medicalRecord.vital_signs.oxygen_saturation} %</div>
                          )}
                          {medicalRecord.vital_signs.weight && (
                            <div className="break-words">Cân nặng: {medicalRecord.vital_signs.weight} kg</div>
                          )}
                          {medicalRecord.vital_signs.height && (
                            <div className="break-words">Chiều cao: {medicalRecord.vital_signs.height} cm</div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Đơn thuốc</h4>
                {medicalRecord?.prescriptions && Array.isArray(medicalRecord.prescriptions) && medicalRecord.prescriptions.length > 0 ? (
                  <div className="space-y-2 pl-4">
                    {medicalRecord.prescriptions.map((med, index) => {
                      const medName = med.name || med.medication || med.medicine_name || "Tên thuốc không xác định";
                      const dosage = med.dosage || med.dose || "";
                      const unit = med.unit || "";
                      const frequency = med.frequency || "";
                      const duration = med.duration || "";
                      
                      return (
                        <div key={index} className="text-sm text-gray-600 border-l-2 border-blue-200 pl-3 py-1 break-words">
                          <div className="font-semibold break-words mb-1">{medName}</div>
                          {dosage && (
                            <div className="break-words pl-4 text-gray-600">Liều lượng: {dosage} {unit}</div>
                          )}
                          {frequency && (
                            <div className="break-words pl-4 text-gray-600">Tần suất: {frequency}</div>
                          )}
                          {duration && (
                            <div className="break-words pl-4 text-gray-600">Thời gian: {duration}</div>
                          )}
                          {med.instructions && (
                            <div className="break-words pl-4 text-xs text-gray-500 mt-1 whitespace-pre-line">{med.instructions}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : prescription?.medications && prescription.medications.length > 0 ? (
                  <div className="space-y-2 pl-4">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="text-sm text-gray-600 border-l-2 border-blue-200 pl-3 py-1 break-words">
                        <div className="font-semibold break-words">{med.name}</div>
                        {med.dosage && <div className="break-words">Liều lượng: {med.dosage}</div>}
                        {med.frequency && <div className="break-words">Tần suất: {med.frequency}</div>}
                        {med.duration && <div className="break-words">Thời gian: {med.duration}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 pl-4 italic">Chưa có đơn thuốc</p>
                )}
                
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ghi chú</h4>
                {(medicalRecord?.notes || prescription?.note) ? (
                  <div className="text-sm text-gray-600 whitespace-pre-line break-words pl-4 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed">
                    {(medicalRecord?.notes || prescription?.note || "").split('\n').map((line, idx) => {
                      // Format bold text **text**
                      let formattedLine = line;
                      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
                      
                      // Format numbered sections (1., 2., etc.)
                      if (/^\d+\.\s/.test(line.trim())) {
                        return (
                          <div key={idx} className="mb-2 first:mt-0">
                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedLine, { ALLOWED_TAGS: ['strong'], ALLOWED_ATTR: ['class'] }) }} />
                          </div>
                        );
                      }
                      
                      // Regular paragraph
                      return (
                        <div key={idx} className="mb-1.5 last:mb-0">
                          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedLine || '&nbsp;', { ALLOWED_TAGS: ['strong'], ALLOWED_ATTR: ['class'] }) }} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 pl-4 italic">Không có ghi chú</p>
                )}
                  </div>
                </Tab>
                <Tab key="feedback" title="Đánh giá">
                  <div className="space-y-6 pt-4">
                    {(() => {
                      console.log('[Feedback Tab] Current feedback state:', feedback);
                      return null;
                    })()}
                    {feedback && feedback.rating ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-semibold mb-3">Đánh giá của bạn</h4>
                          <div className="flex justify-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-6 h-6 ${
                                  star <= (feedback.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {feedback.comment && (
                            <p className="text-sm text-gray-700 italic text-center">"{feedback.comment}"</p>
                          )}
                          {feedback.createdAt && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Đánh giá vào: {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
              </div>
                    ) : (
                      <div className="space-y-4">
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
                        
                        <Button
                          color="primary"
                          className="w-full"
                          onPress={submitFeedback}
                          isLoading={submittingFeedback}
                        >
                          Gửi đánh giá
                        </Button>
                        
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
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            ) : (
              <div className="text-center py-8">Chọn một cuộc hẹn để xem chi tiết.</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={onClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
                if (!selectedAppointment) {
                  alert('Không tìm thấy thông tin cuộc hẹn');
                  return;
                }
                setSubmittingReport(true);
                try {
                  const user = auth.currentUser;
                  if (!user) return;
                  const token = await user.getIdToken();
                  const aptId = selectedAppointment.id || selectedAppointment.appointmentId;
                  const response = await fetch(`${getApiUrl()}/reports`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      appointmentId: aptId,
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
    </PatientFrame>
  );
}
