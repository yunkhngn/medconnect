"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Avatar, Chip, Input, Select, SelectItem, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Video, Calendar, Clock, User, Phone, Mail, MapPin, Search, Filter, Star } from "lucide-react";
import { useRouter } from "next/router";
import Grid from "@/components/layouts/Grid";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { auth } from "@/lib/firebase";
import { parseReason, formatReasonForDisplay } from "@/utils/appointmentUtils";

export default function PatientOnlineExamList() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rxLoading, setRxLoading] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);

  useEffect(() => {
    fetchOnlineAppointments();
  }, []);

  const openAppointmentModal = async (apt) => {
    setSelectedAppointment(apt);
    setPrescription(null);
    setMedicalRecord(null);
    onOpen();
    try {
      setRxLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      
      // Fetch appointment details to get full patient info
      let aptData = null;
      try {
        const aptResp = await fetch(`http://localhost:8080/api/appointments/${apt.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (aptResp.ok) {
          aptData = await aptResp.json();
          console.log('[Patient Modal] Fetched appointment details:', aptData);
          console.log('[Patient Modal] Patient from aptData:', aptData.patient);
          
          // Merge aptData into apt for use below
          apt = { ...apt, ...aptData };
        }
      } catch (aptErr) {
        console.error('[Patient Modal] Error fetching appointment details:', aptErr);
      }
      
      // Update selectedAppointment with full details (from aptData or apt)
      const updatedAppointment = {
        ...apt,
        ...(aptData || {}),
        patientName: aptData?.patient?.name || aptData?.patientName || apt.patientName || apt.patient?.name || auth.currentUser?.displayName,
        patientPhone: aptData?.patient?.phone || aptData?.patientPhone || apt.patientPhone || apt.patient?.phone,
        patientEmail: aptData?.patient?.email || aptData?.patientEmail || apt.patientEmail || apt.patient?.email || auth.currentUser?.email,
        patientAddress: aptData?.patient?.address || aptData?.patientAddress || apt.patientAddress || apt.patient?.address,
        patient: aptData?.patient || apt.patient
      };
      
      console.log('[Patient Modal] Updated appointment:', updatedAppointment);
      setSelectedAppointment(updatedAppointment);
      
      // Get patientUserId from appointment
      const patientUserId = apt.patientUserId || apt.patientId || apt.patient?.id || apt.patient?.userId;
      
      if (patientUserId) {
        // Fetch medical record entries for this patient
        const resp = await fetch(`http://localhost:8080/api/medical-records/patient/${patientUserId}/entries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (resp.ok) {
          const entries = await resp.json();
          let matchingEntry = null;
          
          console.log('[Patient Modal] Fetching medical record for appointment:', {
            appointmentId: apt.id || apt.appointmentId,
            appointmentDate: apt.appointmentDate,
            entriesCount: Array.isArray(entries) ? entries.length : 0
          });
          
          if (Array.isArray(entries) && entries.length > 0) {
            // First, try to match by appointment_id (most accurate)
            matchingEntry = entries.find(entry => {
              const entryApptId = entry.appointment_id || entry.appointmentId;
              const aptId = apt.id || apt.appointmentId;
              const match = entryApptId && String(entryApptId) === String(aptId);
              if (match) console.log('[Patient Modal] Matched by appointment_id:', entryApptId);
              return match;
            });
            
            // If no appointment_id match, try to match by visit_id timestamp (if appointment date is close)
            if (!matchingEntry && apt.appointmentDate) {
              const aptDate = new Date(apt.appointmentDate);
              const aptDateStr = aptDate.toISOString().split('T')[0];
              const aptDateTime = aptDate.getTime();
              
              // Try to match by visit_id timestamp - extract timestamp from visit_id (format: V{timestamp})
              const entriesWithTimestamp = entries
                .filter(entry => {
                  if (!entry.visit_id || !entry.visit_id.startsWith('V')) return false;
                  const visitTimestamp = parseInt(entry.visit_id.substring(1));
                  if (isNaN(visitTimestamp)) return false;
                  
                  // Check if visit timestamp is within 24 hours of appointment date
                  const timeDiff = Math.abs(visitTimestamp - aptDateTime);
                  const hoursDiff = timeDiff / (1000 * 60 * 60);
                  return hoursDiff <= 24; // Within 24 hours
                })
                .map(entry => {
                  const visitTimestamp = parseInt(entry.visit_id.substring(1));
                  const timeDiff = Math.abs(visitTimestamp - aptDateTime);
                  return { ...entry, timeDiff };
                })
                .sort((a, b) => a.timeDiff - b.timeDiff); // Closest first
              
              if (entriesWithTimestamp.length > 0) {
                matchingEntry = entriesWithTimestamp[0];
                const hoursDiff = (matchingEntry.timeDiff / (1000 * 60 * 60)).toFixed(1);
                console.log('[Patient Modal] Matched by visit_id timestamp (diff:', hoursDiff, 'hours)');
              }
            }
            
            // If still no match, try to match by date + time
            if (!matchingEntry && apt.appointmentDate) {
              const aptDate = new Date(apt.appointmentDate);
              const aptDateStr = aptDate.toISOString().split('T')[0];
              const aptHour = aptDate.getHours();
              const aptMinute = aptDate.getMinutes();
              const aptTimeMinutes = aptHour * 60 + aptMinute;
              
              // Try exact date match first
              const exactDateMatches = entries.filter(entry => {
                if (!entry.visit_date) return false;
                const visitDate = new Date(entry.visit_date);
                const visitDateStr = visitDate.toISOString().split('T')[0];
                return visitDateStr === aptDateStr;
              });
              
              if (exactDateMatches.length === 1) {
                // Only one entry on this date - safe to use
                matchingEntry = exactDateMatches[0];
                console.log('[Patient Modal] Matched by exact date (unique):', aptDateStr);
              } else if (exactDateMatches.length > 1) {
                // Multiple entries on same date - find the one closest to appointment time
                // Sort by time difference and pick the closest one
                const entriesWithTimeDiff = exactDateMatches
                  .filter(entry => entry.visit_time) // Only entries with time
                  .map(entry => {
                    const [visitHour, visitMinute] = entry.visit_time.split(':').map(Number);
                    const visitTimeMinutes = visitHour * 60 + visitMinute;
                    const timeDiff = Math.abs(aptTimeMinutes - visitTimeMinutes);
                    return { ...entry, timeDiff };
                  })
                  .sort((a, b) => a.timeDiff - b.timeDiff);
                
                if (entriesWithTimeDiff.length > 0) {
                  // Use the closest one if within 4 hours (to avoid matching wrong appointment)
                  const closest = entriesWithTimeDiff[0];
                  if (closest.timeDiff <= 240) { // 4 hours = 240 minutes
                    matchingEntry = closest;
                    console.log('[Patient Modal] Matched by exact date + closest time (diff:', closest.timeDiff, 'min):', aptDateStr);
                  } else {
                    console.log('[Patient Modal] Closest entry time diff too large:', closest.timeDiff, 'min - skipping');
                  }
                } else {
                  // No entries with time - use the first one (fallback)
                  matchingEntry = exactDateMatches[0];
                  console.log('[Patient Modal] Multiple entries same date, no time info - using first entry');
                }
              }
            }
            
            // No fallback to most recent - only show if we have a confident match
          }
          
          if (matchingEntry) {
            console.log('[Patient Modal] Setting medical record:', matchingEntry);
            console.log('[Patient Modal] Medical record keys:', Object.keys(matchingEntry));
            console.log('[Patient Modal] chief_complaint:', matchingEntry.chief_complaint);
            console.log('[Patient Modal] diagnosis:', matchingEntry.diagnosis);
            console.log('[Patient Modal] vital_signs:', matchingEntry.vital_signs);
            console.log('[Patient Modal] prescriptions:', matchingEntry.prescriptions);
            console.log('[Patient Modal] notes:', matchingEntry.notes);
            setMedicalRecord(matchingEntry);
            // Extract prescription info
            const meds = matchingEntry.prescriptions || [];
            setPrescription({
              medications: Array.isArray(meds) ? meds : [],
              note: matchingEntry.notes || ""
            });
          } else {
            console.log('[Patient Modal] No medical record found');
            setMedicalRecord(null);
            setPrescription(null);
          }
        } else if (resp.status === 404) {
          // No medical records found
          setMedicalRecord(null);
          setPrescription(null);
        } else {
          setMedicalRecord(null);
          setPrescription(null);
        }
      } else {
        // Fallback: try old endpoint
        const resp = await fetch(`http://localhost:8080/api/medical-records/appointment/${apt.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          const meds = data.medications || data.medicines || [];
          setPrescription({
            medications: Array.isArray(meds) ? meds : [],
            note: data.note || data.notes || ""
          });
        } else {
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
  };

  const fetchOnlineAppointments = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/appointments/my?type=ONLINE`, {
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
      console.error("Failed to fetch online appointments:", error);
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
      case "PENDING": return "Chờ bác sĩ xác nhận";
      case "CONFIRMED": return "Đã xác nhận";
      case "ONGOING": return "Đang khám";
      case "FINISHED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const slotToRange = (slot) => {
    const map = {
      SLOT_1: '07:30 - 08:00',
      SLOT_2: '08:15 - 08:45',
      SLOT_3: '09:00 - 09:30',
      SLOT_4: '09:45 - 10:15',
      SLOT_5: '10:30 - 11:00',
      SLOT_6: '11:15 - 11:45',
      SLOT_7: '13:00 - 13:30',
      SLOT_8: '13:45 - 14:15',
      SLOT_9: '14:30 - 15:00',
      SLOT_10: '15:15 - 15:45',
      SLOT_11: '16:00 - 16:30',
      SLOT_12: '16:45 - 17:15',
    };
    return map[slot] || '';
  };

  const handleJoinExam = (appointmentId) => {
    router.push(`/nguoi-dung/kham-online/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const leftChildren = (
    <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Video className="w-5 h-5 text-blue-600" />
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

          {/* Filters */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Bộ lọc
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tìm kiếm</label>
                <Input
                  placeholder="Tên bác sĩ, chuyên khoa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Trạng thái</label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <SelectItem key="all" value="all">Tất cả</SelectItem>
                  <SelectItem key="PENDING" value="PENDING">Chờ xác nhận</SelectItem>
                  <SelectItem key="CONFIRMED" value="CONFIRMED">Đã xác nhận</SelectItem>
                  <SelectItem key="ONGOING" value="ONGOING">Đang khám</SelectItem>
                  <SelectItem key="FINISHED" value="FINISHED">Hoàn thành</SelectItem>
                  <SelectItem key="CANCELLED" value="CANCELLED">Đã hủy</SelectItem>
                </Select>
              </div>
            </div>
          </Card>
    </div>
  );

  const rightChildren = (
    <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Lịch khám online của tôi</h1>
            <Chip color="primary" variant="flat">
              {filteredAppointments.length} cuộc hẹn
            </Chip>
          </div>

          {filteredAppointments.length === 0 ? (
            <Card className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch hẹn online</h3>
              <p className="text-gray-500 mb-4">Bạn chưa có cuộc hẹn khám online nào</p>
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
                const { date } = formatDateTime(appointment.appointmentDate);
                const time = slotToRange(appointment.slot) || formatDateTime(appointment.appointmentDate).time;
                return (
                  <Card
                    key={appointment.id}
                    isPressable
                    onPress={() => openAppointmentModal(appointment)}
                    className="p-5 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={appointment.doctorAvatar}
                          name={appointment.doctorName}
                          size="md"
                          className="ring-2 ring-blue-100"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">BS. {appointment.doctorName}</h3>
                          <p className="text-sm text-gray-500">{appointment.specialty}</p>
                        </div>
                      </div>
                      <Chip
                        color={getStatusColor(appointment.status)}
                        variant="flat"
                        size="sm"
                      >
                        {getStatusText(appointment.status)}
                      </Chip>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Khám online</span>
                      </div>
                    </div>

                    <Divider className="my-4" />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Lý do khám</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-line">
                        {formatReasonForDisplay(appointment.reason)}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {appointment.status === "PENDING" && (
                        <Button
                          color="default"
                          size="sm"
                          className="flex-1"
                          isDisabled
                        >
                          Chờ bác sĩ xác nhận
                        </Button>
                      )}
                      {appointment.status === "CONFIRMED" && (
                        <Button
                          color="success"
                          size="sm"
                          className="flex-1"
                          onPress={(e) => { e?.stopPropagation?.(); handleJoinExam(appointment.id); }}
                        >
                          Tham gia khám
                        </Button>
                      )}
                      {appointment.status === "ONGOING" && (
                        <Button
                          color="warning"
                          size="sm"
                          className="flex-1"
                          onPress={(e) => { e?.stopPropagation?.(); handleJoinExam(appointment.id); }}
                        >
                          Tiếp tục khám
                        </Button>
                      )}
                      {appointment.status === "FINISHED" && (
                        <Button
                          color="default"
                          size="sm"
                          className="flex-1"
                          onPress={(e) => { e?.stopPropagation?.(); handleJoinExam(appointment.id); }}
                        >
                          Xem lại
                        </Button>
                      )}
                      {appointment.status === "CANCELLED" && (
                        <Button
                          color="danger"
                          size="sm"
                          className="flex-1"
                          isDisabled
                        >
                          Đã hủy
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

  );

  return (
    <PatientFrame title="Khám online">
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent className="max-h-[90vh]">
          <ModalHeader className="flex flex-col gap-1">
            {selectedAppointment ? (selectedAppointment.patientName || auth.currentUser?.displayName || "Chi tiết cuộc hẹn") : "Chi tiết cuộc hẹn"}
          </ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {rxLoading ? (
              <div className="text-center py-8">Đang tải thông tin...</div>
            ) : selectedAppointment ? (
              <div className="space-y-4">
                {(() => {
                  const patientName = selectedAppointment.patientName || 
                    selectedAppointment.patient?.name || 
                    auth.currentUser?.displayName || 
                    "Chưa có";
                  const patientPhone = selectedAppointment.patientPhone || 
                    selectedAppointment.patient?.phone || 
                    "Chưa có";
                  const patientEmail = selectedAppointment.patientEmail || 
                    selectedAppointment.patient?.email || 
                    auth.currentUser?.email || 
                    "Chưa có";
                  const patientAddress = selectedAppointment.patientAddress || 
                    selectedAppointment.patient?.address || 
                    "Chưa có";
                  
                  return (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Bệnh nhân: {patientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Ngày khám: {formatDateTime(selectedAppointment.appointmentDate).date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Giờ khám: {formatDateTime(selectedAppointment.appointmentDate).time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>Số điện thoại: {patientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>Email: {patientEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Địa chỉ: {patientAddress}</span>
                      </div>
                    </>
                  );
                })()}
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Lý do khám</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line break-words pl-4">
                  {medicalRecord?.chief_complaint || "Không có thông tin"}
                </p>
                
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Chẩn đoán</h4>
                {medicalRecord?.diagnosis ? (
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
                        {!medicalRecord.diagnosis.primary && 
                         (!medicalRecord.diagnosis.icd_codes || medicalRecord.diagnosis.icd_codes.length === 0) && 
                         (!medicalRecord.diagnosis.secondary || medicalRecord.diagnosis.secondary.length === 0) && (
                          <p className="text-sm text-gray-400 italic">Không có thông tin</p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic pl-4">Không có thông tin</p>
                )}
                
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Dấu hiệu sinh tồn</h4>
                {medicalRecord?.vital_signs && Object.keys(medicalRecord.vital_signs).length > 0 ? (
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
                ) : (
                  <p className="text-sm text-gray-400 italic pl-4">Không có thông tin</p>
                )}
                
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Đơn thuốc</h4>
                {(() => {
                  // Check medicalRecord.prescriptions first (priority)
                  if (medicalRecord?.prescriptions && Array.isArray(medicalRecord.prescriptions) && medicalRecord.prescriptions.length > 0) {
                    return (
                      <div className="space-y-2 pl-4">
                        {medicalRecord.prescriptions.map((med, index) => (
                          <div key={index} className="text-sm text-gray-600 border-l-2 border-blue-200 pl-3 py-1 break-words">
                            <div className="font-semibold break-words mb-1">{med.name || "Tên thuốc không xác định"}</div>
                            {med.dosage && (
                              <div className="break-words pl-4 text-gray-600">Liều lượng: {med.dosage}</div>
                            )}
                            {med.frequency && (
                              <div className="break-words pl-4 text-gray-600">Tần suất: {med.frequency}</div>
                            )}
                            {med.duration && (
                              <div className="break-words pl-4 text-gray-600">Thời gian: {med.duration}</div>
                            )}
                            {!med.dosage && !med.frequency && !med.duration && (
                              <div className="text-gray-400 text-xs pl-4 italic">Không có thông tin chi tiết</div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  // Fallback to prescription.medications
                  if (prescription?.medications && Array.isArray(prescription.medications) && prescription.medications.length > 0) {
                    return (
                      <div className="space-y-2 pl-4">
                        {prescription.medications.map((med, index) => {
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
                              {!dosage && !frequency && !duration && !med.instructions && (
                                <div className="text-gray-400 text-xs pl-4 italic">Không có thông tin chi tiết</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  
                  // No prescriptions found
                  return <p className="text-sm text-gray-500 pl-4">Không có đơn thuốc</p>;
                })()}
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Ghi chú</h4>
                {(medicalRecord?.notes || prescription?.note) ? (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap break-words pl-4">
                    {medicalRecord?.notes || prescription?.note}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 pl-4 italic">Không có ghi chú</p>
                )}
              </div>
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
    </PatientFrame>
  );
}