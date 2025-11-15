"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import Grid from "@/components/layouts/Grid";
import { Calendar, Stethoscope, Search, Clock, Phone, Mail, Video, MapPin, User, Star } from "lucide-react";
import { Button, Card, CardBody, CardHeader, Divider, Input, Chip, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab } from "@heroui/react";
import { auth } from "@/lib/firebase";
import { parseReason, formatReasonForDisplay, formatSlotTime } from "@/utils/appointmentUtils";
import DOMPurify from 'dompurify';
import { getApiUrl } from "@/utils/api";


export default function OfflineExamListPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rxLoading, setRxLoading] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [paymentByAptId, setPaymentByAptId] = useState({});
  const [appointmentFeedback, setAppointmentFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  const counts = {
    pending: appointments.filter(a => a.status === "PENDING").length,
    confirmed: appointments.filter(a => a.status === "CONFIRMED").length,
    finished: appointments.filter(a => a.status === "FINISHED").length,
    total: appointments.length,
  };

  const getStatusChip = (s) => {
    const map = { PENDING: { color: "warning", text: "Chờ xác nhận" }, CONFIRMED: { color: "primary", text: "Đã xác nhận" }, FINISHED: { color: "success", text: "Hoàn thành" }, ONGOING: { color: "secondary", text: "Đang khám" } };
    const obj = map[s] || { color: "default", text: s };
    return <Chip size="sm" variant="flat" color={obj.color}>{obj.text}</Chip>;
  };

  const parseReason = (reason) => {
    try {
      if (typeof reason === 'string' && reason.trim().startsWith('{')) {
        const j = JSON.parse(reason);
        const text = j?.reason || "";
        return { text };
      }
    } catch {}
    return { text: typeof reason === 'string' ? reason : '' };
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const base = new Date(selectedDate);
        const start = base.toISOString().split('T')[0];
        const endDate = new Date(base); endDate.setDate(base.getDate()+14);
        const end = endDate.toISOString().split('T')[0];
        const url = new URL(`${getApiUrl()}/appointments/doctor`);
        url.searchParams.append("startDate", start);
        url.searchParams.append("endDate", end);
        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
        const data = res.ok ? await res.json() : [];
        const offline = (data||[])
          .filter(a => (a.type||"").toUpperCase()==="OFFLINE")
          .filter(a => status === "all" || a.status === status.toUpperCase())
          .filter(a => !q || (a.patient?.name||"").toLowerCase().includes(q.toLowerCase()));
        setAppointments(offline);
      } finally { setLoading(false); }
    };
    load();
  }, [user, selectedDate, status, q]);

  // Load payment status for listed appointments
  useEffect(() => {
    const loadPayments = async () => {
      try {
        const u = auth.currentUser; if (!u) return;
        const token = await u.getIdToken();
        const ids = (appointments||[]).map(a=>a.appointmentId || a.id).filter(Boolean);
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
    setAppointmentFeedback(null);
    setActiveTab("details");
    onOpen();
    try {
      setRxLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      
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
              const aptId = apt.appointmentId || apt.id;
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
      console.error('[Modal] Error fetching medical record:', e);
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
      const aptId = apt.appointmentId || apt.id;
      if (aptId) {
        const feedbackResp = await fetch(`${getApiUrl()}/feedback/appointment/${aptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (feedbackResp.ok) {
          const feedbackData = await feedbackResp.json();
          if (feedbackData.success && feedbackData.data) {
            setAppointmentFeedback(feedbackData.data);
          } else {
            setAppointmentFeedback(null);
          }
        }
      }
    } catch (e) {
      console.error('[Modal] Error fetching feedback:', e);
      setAppointmentFeedback(null);
    }
  };

  // Fetch feedback when modal opens and appointment is selected
  useEffect(() => {
    if (isOpen && selectedAppointment) {
      const fetchFeedback = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;
          const token = await user.getIdToken();
          const aptId = selectedAppointment.appointmentId || selectedAppointment.id;
          if (aptId) {
            const feedbackResp = await fetch(`${getApiUrl()}/feedback/appointment/${aptId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (feedbackResp.ok) {
              const feedbackData = await feedbackResp.json();
              console.log('[Doctor Modal] Feedback response (useEffect):', feedbackData);
              if (feedbackData.success && feedbackData.data) {
                console.log('[Doctor Modal] Setting feedback (useEffect):', feedbackData.data);
                setAppointmentFeedback(feedbackData.data);
              } else {
                setAppointmentFeedback(null);
              }
            } else {
              setAppointmentFeedback(null);
            }
          }
        } catch (e) {
          console.error('[Doctor Modal] Error fetching feedback (useEffect):', e);
          setAppointmentFeedback(null);
        }
      };
      fetchFeedback();
    }
  }, [isOpen, selectedAppointment]);

  const leftChildren = (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Chờ xác nhận</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{counts.pending}</p>
            </div>
              <div className="w-10 h-10 bg-yellow-300 rounded-full" />
          </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Đã xác nhận</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{counts.confirmed}</p>
                </div>
              <div className="w-10 h-10 bg-blue-300 rounded-full" />
                          </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{counts.finished}</p>
                            </div>
              <div className="w-10 h-10 bg-green-300 rounded-full" />
                              </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-teal-100 uppercase tracking-wide">Tổng lịch hẹn</p>
                <p className="text-4xl font-bold mt-1">{counts.total}</p>
                              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full" />
                              </div>
          </CardBody>
        </Card>
                              </div>
      <Card>
        <CardHeader className="flex items-center gap-2"><Calendar className="text-teal-600" size={20}/><h3 className="font-semibold">Bộ lọc</h3></CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          <Input startContent={<Search size={16} className="text-gray-400"/>} placeholder="Tìm tên bệnh nhân..." value={q} onValueChange={setQ} />
          <Input type="date" label="Từ ngày" labelPlacement="outside" value={selectedDate} onValueChange={setSelectedDate} />
          <Select label="Trạng thái" selectedKeys={[status]} onSelectionChange={(k)=>setStatus(Array.from(k)[0])}>
            <SelectItem key="all">Tất cả</SelectItem>
            <SelectItem key="PENDING">Chờ xác nhận</SelectItem>
            <SelectItem key="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem key="ONGOING">Đang khám</SelectItem>
            <SelectItem key="FINISHED">Hoàn thành</SelectItem>
          </Select>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-gray-700">Ghi chú</h3></CardHeader>
        <CardBody className="text-xs text-gray-600">Danh sách hiển thị lịch offline trong 14 ngày kể từ ngày chọn. Bấm “Bắt đầu khám” để mở form ghi bệnh án.</CardBody>
      </Card>
                            </div>
  );

  const rightChildren = (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Quản lý lịch hẹn</h1>
            <p className="text-sm text-gray-500">{appointments.length} lịch hẹn • {counts.pending} cần xử lý</p>
                            </div>
        </CardHeader>
      </Card>
      {loading ? (
        <Card><CardBody className="text-center py-10 text-gray-500">Đang tải...</CardBody></Card>
      ) : appointments.length === 0 ? (
        <Card><CardBody className="text-center py-10"><Calendar className="mx-auto mb-2 text-gray-400" /><p>Không có lịch hẹn offline</p></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt)=> {
            const pr = parseReason(apt.reason);
            const slotText = formatSlotTime(apt.slot);
            const isPending = apt.status === "PENDING";
            const payInfo = paymentByAptId[apt.appointmentId] || paymentByAptId[apt.id];
            return (
            <Card key={apt.appointmentId} className={`hover:shadow-md transition rounded-2xl ${isPending ? 'border-4 border-yellow-400' : 'border-2 border-gray-200'}`}>
              <CardBody className="p-5">
                {/* Header with profile picture, name, and status tags */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img 
                      src={apt.patient?.idPhotoUrl || apt.patient?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient?.name||'BN')}&background=0D9488&color=fff`} 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-400" 
                      alt="avatar"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{apt.patient?.name || 'Bệnh nhân'}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusChip(apt.status)}
                      {apt.type === "ONLINE" ? (
                        <Chip size="sm" variant="flat" color="success" startContent={<Video size={12}/>}>Online</Chip>
                      ) : (
                        <Chip size="sm" variant="flat" color="default" startContent={<MapPin size={12}/>}>Tại phòng khám</Chip>
                      )}
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
                        <p className="font-bold text-gray-900">{new Date(apt.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    {apt.patient?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{apt.patient.phone}</span>
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
                        <p className="font-bold text-gray-900">{slotText}</p>
                      </div>
                    </div>
                    {apt.patient?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{apt.patient.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason section with orange background */}
                {pr.text && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-orange-700 font-medium mb-1">Lý do khám:</p>
                    <p className="text-sm text-gray-900">{pr.text}</p>
            </div>
                )}

                {/* Action buttons */}
                <Divider className="my-4" />
                <div className="flex gap-2">
                  {apt.status === "PENDING" ? (
                    payInfo?.hasPaid ? (
                      <Button 
                        size="sm" 
                        color="primary" 
                        className="flex-1"
                        startContent={<Stethoscope size={16}/>}
                        onClick={(e) => {
                          e.stopPropagation();
                          const appointmentId = apt.appointmentId || apt.id;
                          if (appointmentId) {
                            router.push(`/bac-si/kham-offline/${appointmentId}`);
                          }
                        }}
                      >
                        Xác nhận
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        color="default" 
                        variant="flat"
                        className="flex-1"
                        startContent={<Stethoscope size={16}/>}
                        isDisabled
                        title="Chưa thanh toán — không thể xác nhận"
                      >
                        Chưa thanh toán
                      </Button>
                    )
                  ) : apt.status === "CONFIRMED" || apt.status === "ONGOING" ? (
                    <Button 
                      size="sm" 
                      color="primary" 
                      className="flex-1"
                      startContent={<Stethoscope size={16}/>}
                      onClick={(e) => {
                        e.stopPropagation();
                        const appointmentId = apt.appointmentId || apt.id;
                        if (appointmentId) {
                          router.push(`/bac-si/kham-offline/${appointmentId}`);
                        }
                      }}
                    >
                      Bắt đầu khám
                    </Button>
                  ) : apt.status === "FINISHED" ? (
                    <Button 
                      size="sm" 
                      color="default" 
                      variant="flat"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAppointmentModal(apt);
                      }}
                    >
                      Xem lại
                    </Button>
                  ) : null}
                  <Button 
                    size="sm" 
                    variant="flat"
                    color="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/bac-si/lich-hen`);
                    }}
                  >
                    Xem lịch
                  </Button>
                </div>
              </CardBody>
            </Card>
          );})}
        </div>
              )}
      </div>
  );

  return (
    <DoctorFrame title="Khám offline">
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Modal for prescription or details */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent className="max-h-[90vh]">
          <ModalHeader className="flex flex-col gap-1">
            {selectedAppointment?.patient?.name || selectedAppointment?.patientName || "Chi tiết cuộc hẹn"}
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
                  <span>Bệnh nhân: {selectedAppointment.patient?.name || selectedAppointment.patientName || "Chưa có"}</span>
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
                  <span>Số điện thoại: {selectedAppointment.patient?.phone || "Chưa có"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>Email: {selectedAppointment.patient?.email || "Chưa có"}</span>
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
                    {appointmentFeedback && appointmentFeedback.rating ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-yellow-200">
                          <h4 className="text-sm font-semibold mb-3">Đánh giá từ bệnh nhân</h4>
                          <div className="flex justify-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-6 h-6 ${
                                  star <= (appointmentFeedback.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-center text-sm text-gray-600 mb-2">
                            ({appointmentFeedback.rating}/5)
                          </p>
                          {appointmentFeedback.comment && (
                            <p className="text-sm text-gray-700 italic text-center">"{appointmentFeedback.comment}"</p>
                          )}
                          {appointmentFeedback.createdAt && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Đánh giá vào: {new Date(appointmentFeedback.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Chưa có đánh giá từ bệnh nhân</p>
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
    </DoctorFrame>
  );
}

