"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardHeader, CardBody, Avatar, Chip, Input, Select, SelectItem, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea } from "@heroui/react";
import { Video, Calendar, Clock, User, Phone, Mail, MapPin, Search, Filter, Activity, CheckCircle, Globe } from "lucide-react";
import { useRouter } from "next/router";
import Grid from "@/components/layouts/Grid";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import { auth } from "@/lib/firebase";
import { parseReason, formatReasonForDisplay } from "@/utils/appointmentUtils";

export default function DoctorOnlineExamList() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rxLoading, setRxLoading] = useState(false);
  const [prescription, setPrescription] = useState(null); // {medications:[{name,dose,frequency,duration,note}], note}
  const [medicalRecord, setMedicalRecord] = useState(null); // Full medical record entry

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
          
          console.log('[Modal] Fetching medical record for appointment:', {
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
              if (match) console.log('[Modal] Matched by appointment_id:', entryApptId);
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
                console.log('[Modal] Matched by visit_id timestamp (diff:', hoursDiff, 'hours)');
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
                console.log('[Modal] Matched by exact date (unique):', aptDateStr);
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
                    console.log('[Modal] Matched by exact date + closest time (diff:', closest.timeDiff, 'min):', aptDateStr);
                  } else {
                    console.log('[Modal] Closest entry time diff too large:', closest.timeDiff, 'min - skipping');
                  }
                } else {
                  // No entries with time - use the first one (fallback)
                  matchingEntry = exactDateMatches[0];
                  console.log('[Modal] Multiple entries same date, no time info - using first entry');
                }
              }
            }
            
            // No fallback to most recent - only show if we have a confident match
          }
          
          if (matchingEntry) {
            console.log('[Modal] Setting medical record:', matchingEntry);
            setMedicalRecord(matchingEntry);
            // Extract prescription info
            const meds = matchingEntry.prescriptions || [];
            setPrescription({
              medications: Array.isArray(meds) ? meds : [],
              note: matchingEntry.notes || ""
            });
          } else {
            console.log('[Modal] No medical record found');
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
      console.error('[Modal] Error fetching medical record:', e);
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
      // Lấy appointments từ 1 năm trước đến 1 năm sau để bao gồm cả quá khứ
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(today.getFullYear() + 1);
      
      const startDate = oneYearAgo.toISOString().split('T')[0];
      const endDate = oneYearLater.toISOString().split('T')[0];
      
      const response = await fetch(
        `http://localhost:8080/api/appointments/doctor?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Filter chỉ lấy appointments ONLINE
        const onlineAppointments = (data || []).filter(apt => 
          apt.type === 'ONLINE' || apt.type === 'Online'
        );
        setAppointments(onlineAppointments);
        console.log('[Doctor Online] Fetched appointments:', onlineAppointments.length, 'online out of', data?.length || 0, 'total');
      } else {
        console.error('[Doctor Online] Failed to fetch:', response.status, response.statusText);
        setAppointments([]);
      }
    } catch (error) {
      console.error("[Doctor Online] Failed to fetch online appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase());
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
      case "PENDING": return "Chờ xác nhận";
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

  // Helper to get display text from reason (parse and extract text)
  const getReasonText = (raw) => {
    const parsed = parseReason(raw);
    const text = parsed?.reasonText;
    return (text && typeof text === 'string' && text.trim()) ? text : "Không rõ";
  };

  const handleStartExam = (appointmentId) => {
    router.push(`/bac-si/kham-online/${appointmentId}`);
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
      {/* Quick Stats - Multiple Cards */}
      <div className="grid grid-cols-1 gap-3">
        {/* Pending */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Chờ xác nhận</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  {appointments.filter(apt => apt.status === "PENDING").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center">
                <Clock className="text-yellow-700" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Confirmed */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Đã xác nhận</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {appointments.filter(apt => apt.status === "CONFIRMED").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center">
                <CheckCircle className="text-blue-700" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Finished */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {appointments.filter(apt => apt.status === "FINISHED").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-300 rounded-full flex items-center justify-center">
                <Activity className="text-green-700" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Total Appointments */}
      <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-teal-100 uppercase tracking-wide">Tổng lịch hẹn</p>
              <p className="text-4xl font-bold mt-1">{appointments.length}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="text-white" size={28} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Filters Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Search className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Tìm kiếm & Lọc</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          <Input
            placeholder="Tìm theo tên bệnh nhân..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-gray-400" />}
            classNames={{
              input: "text-sm",
              inputWrapper: "border-2 border-gray-200 hover:border-teal-400"
            }}
          />
          <Select
            label="Trạng thái"
            selectedKeys={statusFilter !== "all" ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setStatusFilter(selected || "all");
            }}
            classNames={{
              trigger: "border-2 border-gray-200 hover:border-teal-400"
            }}
          >
            <SelectItem key="all">Tất cả</SelectItem>
            <SelectItem key="PENDING">Chờ xác nhận</SelectItem>
            <SelectItem key="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem key="ONGOING">Đang khám</SelectItem>
            <SelectItem key="FINISHED">Hoàn thành</SelectItem>
            <SelectItem key="CANCELLED">Đã hủy</SelectItem>
          </Select>
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
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Đang khám</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const rightChildren = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch khám online</h1>
        <Chip color="primary" variant="flat">
          {filteredAppointments.length} cuộc hẹn
        </Chip>
      </div>

      {filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch hẹn online</h3>
          <p className="text-gray-500">Các cuộc hẹn khám online sẽ hiển thị ở đây</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAppointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.appointmentDate);
            const isPending = appointment.status === "PENDING";
            return (
              <Card
                key={appointment.id}
                className={`hover:shadow-md transition rounded-2xl ${isPending ? 'border-4 border-yellow-400' : 'border-2 border-gray-200'}`}
              >
                <CardBody className="p-5">
                  {/* Header with profile picture, name, and status tags */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img 
                        src={appointment.patientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patientName||'BN')}&background=0D9488&color=fff`} 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-400" 
                        alt="avatar"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{appointment.patientName || 'Bệnh nhân'}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getStatusColor(appointment.status)}
                        >
                          {getStatusText(appointment.status)}
                        </Chip>
                        <Chip size="sm" variant="flat" color="success" startContent={<Globe size={12}/>}>Khám online</Chip>
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
                      {appointment.patientPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700">{appointment.patientPhone}</span>
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
                      {appointment.patientEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{appointment.patientEmail}</span>
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
                      <Button
                        color="primary"
                        size="sm"
                        className="flex-1"
                        onPress={(e) => { 
                          e?.stopPropagation?.(); 
                          handleStartExam(appointment.id); 
                        }}
                      >
                        Xác nhận & Bắt đầu
                      </Button>
                    )}
                    {appointment.status === "CONFIRMED" && (
                      <Button
                        color="primary"
                        size="sm"
                        className="flex-1"
                        onPress={(e) => { 
                          e?.stopPropagation?.(); 
                          handleStartExam(appointment.id); 
                        }}
                      >
                        Bắt đầu khám
                      </Button>
                    )}
                    {appointment.status === "ONGOING" && (
                      <Button
                        color="warning"
                        size="sm"
                        className="flex-1"
                        onPress={(e) => { 
                          e?.stopPropagation?.(); 
                          handleStartExam(appointment.id); 
                        }}
                      >
                        Tiếp tục khám
                      </Button>
                    )}
                    {appointment.status === "FINISHED" && (
                      <Button
                        color="default"
                        size="sm"
                        variant="flat"
                        className="flex-1"
                        onPress={(e) => { 
                          e?.stopPropagation?.(); 
                          openAppointmentModal(appointment); 
                        }}
                      >
                        Xem lại
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
    <DoctorFrame title="Khám online">
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Modal for prescription or details */}
      {/* Render at root of component return via Portal inside DoctorFrame */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent className="max-h-[90vh]">
          <ModalHeader className="flex flex-col gap-1">
            {selectedAppointment?.patientName || "Chi tiết cuộc hẹn"}
          </ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {rxLoading ? (
              <div className="text-center py-8">
                <p>Đang tải thông tin...</p>
              </div>
            ) : selectedAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Bệnh nhân: {selectedAppointment.patientName}</span>
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
                  <span>Số điện thoại: {selectedAppointment.patientPhone || "Chưa có"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>Email: {selectedAppointment.patientEmail || "Chưa có"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Địa chỉ: {selectedAppointment.patientAddress || "Chưa có"}</span>
                </div>
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Lý do khám</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line break-words">
                  {medicalRecord?.chief_complaint || formatReasonForDisplay(selectedAppointment.reason) || "Không có thông tin"}
                </p>
                
                {medicalRecord && (
                  <>
                    {medicalRecord.diagnosis && (
                      <>
                        <Divider className="my-4" />
                        <h4 className="text-sm font-medium text-gray-700">Chẩn đoán</h4>
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
                    
                    {medicalRecord.vital_signs && Object.keys(medicalRecord.vital_signs).length > 0 && (
                      <>
                        <Divider className="my-4" />
                        <h4 className="text-sm font-medium text-gray-700">Dấu hiệu sinh tồn</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 break-words">
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
                  <div className="space-y-2">
                    {medicalRecord.prescriptions.map((med, index) => (
                      <div key={index} className="text-sm text-gray-600 border-l-2 border-blue-200 pl-3 py-1 break-words">
                        <div className="font-semibold break-words">{med.name}</div>
                        {med.dosage && <div className="break-words">Liều lượng: {med.dosage}</div>}
                        {med.frequency && <div className="break-words">Tần suất: {med.frequency}</div>}
                        {med.duration && <div className="break-words">Thời gian: {med.duration}</div>}
                      </div>
                    ))}
                  </div>
                ) : prescription?.medications && prescription.medications.length > 0 ? (
                  <div className="space-y-2">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                        <span>{med.name}</span>
                        <span>{med.dose} {med.unit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có đơn thuốc</p>
                )}
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Ghi chú</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                  {medicalRecord?.notes || prescription?.note || "Không có ghi chú"}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Chọn một cuộc hẹn để xem chi tiết.</p>
              </div>
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