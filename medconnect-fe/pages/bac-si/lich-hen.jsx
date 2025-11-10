import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Chip, Divider, Input, Select, SelectItem,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Avatar,
  Tabs, Tab, Accordion, AccordionItem
} from "@heroui/react";
import { 
  Calendar, Search, CheckCircle, XCircle, Clock, User, Video, MapPin, 
  Phone, Mail, FileText, ClipboardList, Stethoscope, Plus, Eye,
  Heart, Activity, Pill, AlertCircle
} from "lucide-react";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import { useRouter } from "next/router";
import { parseReason, formatReasonForDisplay } from "@/utils/appointmentUtils";

const SLOT_TIMES = {
  SLOT_1: "07:30 - 08:00",
  SLOT_2: "08:15 - 08:45",
  SLOT_3: "09:00 - 09:30",
  SLOT_4: "09:45 - 10:15",
  SLOT_5: "10:30 - 11:00",
  SLOT_6: "11:15 - 11:45",
  SLOT_7: "13:00 - 13:30",
  SLOT_8: "13:45 - 14:15",
  SLOT_9: "14:30 - 15:00",
  SLOT_10: "15:15 - 15:45",
  SLOT_11: "16:00 - 16:30",
  SLOT_12: "16:45 - 17:15"
};

export default function DoctorAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEmrOpen, onOpen: onEmrOpen, onClose: onEmrClose } = useDisclosure();
  const { isOpen: isImgOpen, onOpen: onImgOpen, onClose: onImgClose } = useDisclosure();
  const [previewImgUrl, setPreviewImgUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [patientEmr, setPatientEmr] = useState(null);
  const [emrLoading, setEmrLoading] = useState(false);
  const [patientEmrInModal, setPatientEmrInModal] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    fetchAppointments();
  }, [user, authLoading]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, statusFilter]);

  // Auto-fetch EMR when appointment is selected
  useEffect(() => {
    if (selectedAppointment && selectedAppointment.patient?.firebaseUid && isOpen && user) {
      console.log('[EMR Modal] Fetching EMR for patient:', selectedAppointment.patient.firebaseUid);
      fetchPatientEmrInModal(selectedAppointment.patient.firebaseUid);
    } else {
      setPatientEmrInModal(null);
    }
  }, [selectedAppointment, isOpen, user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      // Fetch appointments for last 30 days and next 60 days
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 60);
      
      const url = new URL("http://localhost:8080/api/appointments/doctor");
      url.searchParams.append("startDate", startDate.toISOString().split('T')[0]);
      url.searchParams.append("endDate", endDate.toISOString().split('T')[0]);
      
      console.log("[Appointments] Fetching appointments from", startDate.toISOString().split('T')[0], "to", endDate.toISOString().split('T')[0]);
      
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[Appointments] Fetched", data.length, "appointments");
        setAppointments(data);
      } else {
        const errorText = await response.text();
        console.error("[Appointments] Failed to fetch:", response.status, errorText);
        
        // If 400 error, might be because doctor record doesn't exist
        if (response.status === 400) {
          console.warn("[Appointments] Doctor record may not exist. Setting empty appointments.");
          setAppointments([]);
          toast.warning("Chưa có lịch hẹn nào");
        } else {
          toast.error("Không thể tải danh sách lịch hẹn");
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredAppointments(filtered);
  };

  const handleConfirm = async (appointmentId) => {
    setProcessing(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/confirm`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Đã xác nhận lịch hẹn");
        fetchAppointments();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể xác nhận lịch hẹn");
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async (appointmentId) => {
    setProcessing(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/deny`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Đã từ chối lịch hẹn");
        fetchAppointments();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể từ chối lịch hẹn");
      }
    } catch (error) {
      console.error("Error denying appointment:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setProcessing(false);
    }
  };

  const fetchPatientEmr = async (patientFirebaseUid) => {
    setEmrLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/emr/firebase/${patientFirebaseUid}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPatientEmr(data);
        onEmrOpen();
      } else {
        toast.error("Không thể tải hồ sơ bệnh án");
      }
    } catch (error) {
      console.error("Error fetching patient EMR:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setEmrLoading(false);
    }
  };

  const fetchPatientEmrInModal = async (patientFirebaseUid) => {
    try {
      console.log('[EMR Modal] Fetching EMR from API...');
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/emr/firebase/${patientFirebaseUid}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[EMR Modal] EMR data received:', data);
        setPatientEmrInModal(data);
      } else {
        console.log("[EMR Modal] Could not fetch patient EMR:", response.status);
      }
    } catch (error) {
      console.error("[EMR Modal] Error fetching patient EMR:", error);
    }
  };

  const handleStartConsultation = (appointmentId, type) => {
    if (type === "ONLINE") {
      // Redirect to video call room
      router.push(`/video-call/${appointmentId}`);
    } else {
      // Redirect to create medical record page
      router.push(`/bac-si/ghi-kham-benh/${appointmentId}`);
    }
  };

  const formatDiagnosis = (diagnosis) => {
    if (!diagnosis) return 'N/A';
    if (typeof diagnosis === 'string') return diagnosis;
    
    const parts = [];
    if (diagnosis.primary) parts.push(`Chính: ${diagnosis.primary}`);
    
    // Handle secondary as array or string
    if (diagnosis.secondary) {
      if (Array.isArray(diagnosis.secondary)) {
        if (diagnosis.secondary.length > 0) {
          parts.push(`Phụ: ${diagnosis.secondary.join(', ')}`);
        }
      } else {
        parts.push(`Phụ: ${diagnosis.secondary}`);
      }
    }
    
    // Handle icd_codes as array or string
    if (diagnosis.icd_codes) {
      if (Array.isArray(diagnosis.icd_codes)) {
        if (diagnosis.icd_codes.length > 0) {
          parts.push(`Mã ICD: ${diagnosis.icd_codes.join(', ')}`);
        }
      } else {
        parts.push(`Mã ICD: ${diagnosis.icd_codes}`);
      }
    }
    
    return parts.join(' | ') || 'N/A';
  };

  const formatMedicalRecordDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      // Try different date formats
      let date;
      if (typeof dateValue === 'string') {
        // Handle ISO format or other string formats
        date = new Date(dateValue);
      } else if (typeof dateValue === 'number') {
        // Handle timestamp
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return 'N/A';
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }

      return date.toLocaleDateString("vi-VN", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "warning",
      CONFIRMED: "primary",
      DENIED: "danger",
      CANCELLED: "default",
      ONGOING: "secondary",
      FINISHED: "success"
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      DENIED: "Đã từ chối",
      CANCELLED: "Đã hủy",
      ONGOING: "Đang khám",
      FINISHED: "Hoàn thành"
    };
    return labels[status] || status;
  };

  // Extract attached symptom image filenames embedded in reason text
  const parseAttachmentsFromReason = (reason) => {
    // Handle object or string
    let reasonStr = '';
    if (typeof reason === 'object' && reason !== null) {
      reasonStr = String(reason.reason ?? reason.text ?? '');
    } else if (typeof reason === 'string') {
      reasonStr = reason;
    } else {
      return [];
    }
    
    if (!reasonStr) return [];
    const idx = reasonStr.indexOf('Đính kèm');
    if (idx === -1) return [];
    // take substring after 'Đính kèm'
    const tail = reasonStr.slice(idx);
    // remove bracket wrappers if any
    const cleaned = tail.replace(/[\[\]]/g, '');
    // split by common delimiters and keep items that look like filenames
    const parts = cleaned.split(/[:,]\s*/).flatMap(s => s.split(/\s+/));
    const files = parts.filter(p => /\.(jpg|jpeg|png|gif|webp)$/i.test(p));
    return files.slice(0, 6); // cap to avoid overflow
  };

  // Extract real attachment URLs if backend starts storing them in detail JSON or explicit fields
  const extractAttachmentUrls = (apt) => {
    const urls = [];
    if (!apt) return urls;
    // Common direct fields
    if (Array.isArray(apt.attachmentUrls)) urls.push(...apt.attachmentUrls);
    if (Array.isArray(apt.attachments)) urls.push(...apt.attachments);
    // Try reason JSON (new canonical place) - handle both object and string
    if (apt.reason) {
      if (typeof apt.reason === 'object' && apt.reason !== null) {
        if (Array.isArray(apt.reason.attachments)) urls.push(...apt.reason.attachments);
      } else if (typeof apt.reason === 'string' && apt.reason.trim().startsWith('{')) {
        try {
          const r = JSON.parse(apt.reason);
          if (Array.isArray(r?.attachments)) urls.push(...r.attachments);
        } catch {}
      }
    }
    // Try parse JSON detail
    if (apt.detail && typeof apt.detail === 'string') {
      try {
        const json = JSON.parse(apt.detail);
        const candidates = [
          json?.attachments,
          json?.images,
          json?.symptom_images,
          json?.symptoms?.images,
        ].filter(Boolean);
        for (const c of candidates) {
          if (Array.isArray(c)) urls.push(...c);
        }
      } catch {}
    }
    // Keep only http(s) image links
    return urls.filter((u) => typeof u === 'string' && /^https?:\/\//.test(u) && /(\.jpg|\.jpeg|\.png|\.webp|\.gif)(\?|$)/i.test(u)).slice(0, 6);
  };

  const getDisplayReason = (apt) => {
    if (!apt) return 'Không rõ';
    return formatReasonForDisplay(apt.reason);
  };

  const getAttachmentNamesFromDetail = (apt) => {
    if (!apt) return [];
    // Try reason JSON first - handle both object and string
    if (apt.reason) {
      if (typeof apt.reason === 'object' && apt.reason !== null) {
        if (Array.isArray(apt.reason.attachments)) return apt.reason.attachments.slice(0, 6);
      } else if (typeof apt.reason === 'string' && apt.reason.trim().startsWith('{')) {
        try {
          const j = JSON.parse(apt.reason);
          if (Array.isArray(j?.attachments)) return j.attachments.slice(0, 6);
        } catch {}
      }
    }
    if (!apt.detail || typeof apt.detail !== 'string') return [];
    try {
      const json = JSON.parse(apt.detail);
      const arr = json?.attachments;
      if (Array.isArray(arr)) {
        return arr
          .map((i) => (typeof i === 'string' ? i : i?.name))
          .filter(Boolean)
          .slice(0, 6);
      }
    } catch {}
    return [];
  };

  const getPendingCount = () => {
    return appointments.filter(apt => apt.status === "PENDING").length;
  };

  if (authLoading || loading) {
  return (
      <DoctorFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DoctorFrame>
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
            selectedKeys={[statusFilter]}
            onChange={(e) => setStatusFilter(e.target.value)}
            classNames={{
              trigger: "border-2 border-gray-200 hover:border-teal-400"
            }}
          >
            <SelectItem key="all">Tất cả</SelectItem>
            <SelectItem key="PENDING">Chờ xác nhận</SelectItem>
            <SelectItem key="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem key="ONGOING">Đang khám</SelectItem>
            <SelectItem key="FINISHED">Hoàn thành</SelectItem>
            <SelectItem key="DENIED">Đã từ chối</SelectItem>
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
    <div className="space-y-6">
      {/* Header Card - Enhanced */}
      <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Calendar className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Quản lý lịch hẹn</h1>
                <p className="text-teal-100 text-sm mt-1">
                  {filteredAppointments.length} lịch hẹn • 
                  {appointments.filter(apt => apt.status === "PENDING").length > 0 && (
                    <span className="ml-1 text-yellow-300 font-semibold">
                      {appointments.filter(apt => apt.status === "PENDING").length} cần xử lý
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Appointments List - Enhanced */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardBody className="py-20">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-gray-400" size={48} />
                </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có lịch hẹn</h3>
              <p className="text-gray-500">Chưa có lịch hẹn nào phù hợp với bộ lọc của bạn</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((apt) => (
            <Card
              key={apt.appointmentId}
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                apt.status === "PENDING" 
                  ? "border-yellow-300 bg-yellow-50/30" 
                  : apt.status === "CONFIRMED"
                  ? "border-blue-200"
                  : "border-gray-200"
              }`}
              isPressable
              onPress={() => {
                setSelectedAppointment(apt);
                onOpen();
              }}
            >
              <CardBody className="p-5">
                <div className="flex gap-4">
                  {/* Patient Photo - Enhanced */}
                  <div className="flex-shrink-0">
                    {apt.patient?.idPhotoUrl ? (
                      <div className="w-20 h-[106px] rounded-xl overflow-hidden border-3 border-teal-400 shadow-md">
                        <img 
                          src={apt.patient.idPhotoUrl} 
                          alt="Patient" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Avatar
                        src={apt.patient?.avatar}
                        name={apt.patient?.name?.[0]}
                        className="w-20 h-20 text-xl"
                      />
                    )}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    {/* Name and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {apt.patient?.name || "Bệnh nhân"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip 
                            size="sm" 
                            color={getStatusColor(apt.status)} 
                            variant="solid"
                            className="font-semibold"
                          >
                            {getStatusLabel(apt.status)}
                          </Chip>
                          {apt.type === "ONLINE" ? (
                            <Chip size="sm" color="success" variant="flat" startContent={<Video size={12} />}>
                              Online
                            </Chip>
                          ) : (
                            <Chip size="sm" color="default" variant="flat" startContent={<MapPin size={12} />}>
                              Tại phòng khám
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date Time and Details */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Calendar size={16} className="text-teal-600" />
                  </div>
                        <div>
                          <p className="text-xs text-gray-500">Ngày khám</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(apt.date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Giờ khám</p>
                          <p className="font-semibold text-gray-900">{SLOT_TIMES[apt.slot]}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      {apt.patient?.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={12} />
                          <span>{apt.patient.phone}</span>
                        </div>
                      )}
                      {apt.patient?.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={12} />
                          <span className="truncate">{apt.patient.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Reason + Attachments (parsed) */}
                    {(apt.reason) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
                        <p className="text-xs text-orange-700 font-medium mb-1">Lý do khám:</p>
                        <p className="text-sm text-gray-700 mb-2 whitespace-pre-line">{getDisplayReason(apt)}</p>
                        {/* Real thumbnails if available via URLs */}
                        {extractAttachmentUrls(apt).length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {extractAttachmentUrls(apt).map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPreviewImgUrl(url); onImgOpen(); }}
                                className="w-16 h-16 rounded overflow-hidden border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              >
                                <img src={url} alt={`attachment-${i+1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          (getAttachmentNamesFromDetail(apt).length > 0 ? getAttachmentNamesFromDetail(apt) : parseAttachmentsFromReason(apt.reason)).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(getAttachmentNamesFromDetail(apt).length > 0 ? getAttachmentNamesFromDetail(apt) : parseAttachmentsFromReason(apt.reason)).map((name, i) => (
                                <Chip key={i} size="sm" variant="flat" color="warning">
                                  {name}
                                </Chip>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      {apt.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<CheckCircle size={16} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirm(apt.appointmentId);
                            }}
                            isLoading={processing}
                          >
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<XCircle size={16} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeny(apt.appointmentId);
                            }}
                            isLoading={processing}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Eye size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                          onOpen();
                        }}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

                  return (
    <DoctorFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Appointment Detail Modal - Enhanced */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalContent>
          {selectedAppointment && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Chi tiết lịch hẹn</h2>
                <Chip size="sm" color={getStatusColor(selectedAppointment.status)} variant="flat">
                  {getStatusLabel(selectedAppointment.status)}
                </Chip>
              </ModalHeader>
              <ModalBody>
                <Tabs aria-label="Appointment details">
                  {/* Tab 1: Thông tin bệnh nhân */}
                  <Tab key="patient" title={<div className="flex items-center gap-2"><User size={16} />Bệnh nhân</div>}>
                    <div className="space-y-6 py-4">
                      {/* Patient Profile with Photo */}
                      <div className="flex gap-6">
                        {/* ID Photo (3x4 if available) or Avatar */}
                        <div className="flex-shrink-0">
                          {selectedAppointment.patient?.idPhotoUrl ? (
                            <button
                              type="button"
                              onClick={() => { setPreviewImgUrl(selectedAppointment.patient.idPhotoUrl); onImgOpen(); }}
                              className="w-32 h-[170px] rounded-lg overflow-hidden border-2 border-teal-500 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              <img 
                                src={selectedAppointment.patient.idPhotoUrl} 
                                alt="Patient ID Photo" 
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ) : (
                            <Avatar
                              src={selectedAppointment.patient?.avatar}
                              name={selectedAppointment.patient?.name?.[0]}
                              className="w-32 h-32"
                            />
                          )}
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              {selectedAppointment.patient?.name || "Bệnh nhân"}
                            </h3>
                            <p className="text-gray-600">ID bệnh nhân: {selectedAppointment.patient?.id || "N/A"}</p>
                        </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                              <Mail className="text-teal-600 mt-1" size={18} />
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium">{selectedAppointment.patient?.email || "N/A"}</p>
                          </div>
                        </div>
                            <div className="flex items-start gap-2">
                              <Phone className="text-teal-600 mt-1" size={18} />
                              <div>
                                <p className="text-xs text-gray-500">Số điện thoại</p>
                                <p className="font-medium">{selectedAppointment.patient?.phone || "N/A"}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="text-teal-600 mt-1" size={18} />
                              <div>
                                <p className="text-xs text-gray-500">Ngày sinh</p>
                                <p className="font-medium">
                                  {selectedAppointment.patient?.dateOfBirth 
                                    ? new Date(selectedAppointment.patient.dateOfBirth).toLocaleDateString("vi-VN")
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="text-teal-600 mt-1" size={18} />
                              <div>
                                <p className="text-xs text-gray-500">Địa chỉ</p>
                                <p className="font-medium">{typeof selectedAppointment.patient?.address === 'object' ? (selectedAppointment.patient?.address?.full || [selectedAppointment.patient?.address?.address_detail, selectedAppointment.patient?.address?.ward_name, selectedAppointment.patient?.address?.district_name, selectedAppointment.patient?.address?.province_name].filter(Boolean).join(', ')) : (selectedAppointment.patient?.address || 'N/A')}</p>
                              </div>
                            </div>
                          </div>

                          <Button
                            color="primary"
                            variant="flat"
                            startContent={<FileText size={18} />}
                            onPress={() => fetchPatientEmr(selectedAppointment.patient?.firebaseUid)}
                            isLoading={emrLoading}
                            className="mt-2"
                          >
                            Xem hồ sơ bệnh án đầy đủ
                          </Button>
                        </div>
                      </div>

                      {/* Additional Patient Info from EMR */}
                      {console.log('[DEBUG] patientEmrInModal:', patientEmrInModal)}
                      {patientEmrInModal?.patient_profile ? (
                        <>
                          <Divider className="my-4" />
                          
                          {/* ID & Insurance */}
                          <div className="grid grid-cols-2 gap-4">
                            {patientEmrInModal.patient_profile.citizenship && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">CMND/CCCD</p>
                                <p className="font-medium">{patientEmrInModal.patient_profile.citizenship}</p>
                              </div>
                            )}
                            {patientEmrInModal.patient_profile.insurance_number && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Số BHYT</p>
                                <p className="font-medium">{patientEmrInModal.patient_profile.insurance_number}</p>
                              </div>
                            )}
                          </div>

                          {/* Emergency Contact */}
                          {patientEmrInModal.patient_profile.emergency_contact && (
                            <>
                              <Divider className="my-4" />
                        <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Phone className="text-orange-600" size={18} />
                                  Liên hệ khẩn cấp
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                  {patientEmrInModal.patient_profile.emergency_contact.name && (
                                    <div className="bg-orange-50 p-3 rounded-lg">
                                      <p className="text-xs text-gray-600 mb-1">Người liên hệ</p>
                                      <p className="font-medium text-orange-900">{patientEmrInModal.patient_profile.emergency_contact.name}</p>
                        </div>
                                  )}
                                  {patientEmrInModal.patient_profile.emergency_contact.phone && (
                                    <div className="bg-orange-50 p-3 rounded-lg">
                                      <p className="text-xs text-gray-600 mb-1">SĐT khẩn cấp</p>
                                      <p className="font-medium text-orange-900">{patientEmrInModal.patient_profile.emergency_contact.phone}</p>
                                    </div>
                                  )}
                                  {patientEmrInModal.patient_profile.emergency_contact.relation && (
                                    <div className="bg-orange-50 p-3 rounded-lg">
                                      <p className="text-xs text-gray-600 mb-1">Mối quan hệ</p>
                                      <p className="font-medium text-orange-900">{patientEmrInModal.patient_profile.emergency_contact.relation}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Occupation */}
                         
                          {/* Medical Warnings */}
                          {(patientEmrInModal.medical_history?.allergies || 
                            patientEmrInModal.medical_history?.previous_conditions) && (
                            <>
                              <Divider className="my-4" />
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <AlertCircle className="text-red-600" size={18} />
                                  Cảnh báo y tế
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {patientEmrInModal.medical_history?.allergies && (
                                    <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                                      <p className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                                        <AlertCircle className="text-red-600" size={16} />
                                        🔴 Dị ứng
                                      </p>
                                      <p className="font-medium text-red-700">{patientEmrInModal.medical_history.allergies}</p>
                                    </div>
                                  )}
                                  {patientEmrInModal.medical_history?.previous_conditions && (
                                    <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-lg">
                                      <p className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                                        <Heart className="text-orange-600" size={16} />
                                        🟠 Bệnh sử
                                      </p>
                                      <p className="font-medium text-orange-700">{patientEmrInModal.medical_history.previous_conditions}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Medications, Surgeries, Vaccinations, Family history, Lifestyle */}
                          {(patientEmrInModal.medical_history?.current_medications ||
                            patientEmrInModal.medical_history?.surgeries ||
                            patientEmrInModal.medical_history?.vaccinations ||
                            patientEmrInModal.medical_history?.family_history ||
                            patientEmrInModal.medical_history?.lifestyle) && (
                            <>
                              <Divider className="my-4" />
                              <div className="grid grid-cols-2 gap-4">
                                {patientEmrInModal.medical_history?.current_medications && (
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Thuốc đang dùng</p>
                                    <p className="font-medium text-blue-800 break-words">{patientEmrInModal.medical_history.current_medications}</p>
                                  </div>
                                )}
                                {patientEmrInModal.medical_history?.surgeries && (
                                  <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Tiền sử phẫu thuật</p>
                                    <p className="font-medium text-purple-800 break-words">{patientEmrInModal.medical_history.surgeries}</p>
                                  </div>
                                )}
                                {patientEmrInModal.medical_history?.vaccinations && (
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Tiêm chủng</p>
                                    <p className="font-medium text-green-800 break-words">{patientEmrInModal.medical_history.vaccinations}</p>
                                  </div>
                                )}
                                {patientEmrInModal.medical_history?.family_history && (
                                  <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Tiền sử gia đình</p>
                                    <p className="font-medium text-yellow-800 break-words">{patientEmrInModal.medical_history.family_history}</p>
                                  </div>
                                )}
                                {patientEmrInModal.medical_history?.lifestyle && (
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Lối sống</p>
                                    <p className="font-medium text-gray-800 break-words">{patientEmrInModal.medical_history.lifestyle}</p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">
                            Bệnh nhân chưa có hồ sơ bệnh án hoặc đang tải thông tin...
                          </p>
                        </div>
                      )}
                    </div>
                  </Tab>

                  {/* Tab 2: Thông tin lịch hẹn */}
                  <Tab key="appointment" title={<div className="flex items-center gap-2"><Calendar size={16} />Lịch hẹn</div>}>
                    <div className="space-y-4 py-4">
                      <Card>
                        <CardBody className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-teal-50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="text-teal-600" size={20} />
                                <p className="text-sm font-medium text-teal-900">Ngày khám</p>
                              </div>
                              <p className="text-xl font-bold text-teal-900">
                                {new Date(selectedAppointment.date).toLocaleDateString("vi-VN", {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="text-blue-600" size={20} />
                                <p className="text-sm font-medium text-blue-900">Khung giờ</p>
                              </div>
                              <p className="text-xl font-bold text-blue-900">
                                {SLOT_TIMES[selectedAppointment.slot]}
                              </p>
                            </div>
                          </div>

                          <Divider />

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Hình thức khám</p>
                              <Chip 
                                size="lg" 
                                color={selectedAppointment.type === "ONLINE" ? "success" : "warning"} 
                                variant="flat"
                                startContent={selectedAppointment.type === "ONLINE" ? <Video size={16} /> : <MapPin size={16} />}
                              >
                                {selectedAppointment.type === "ONLINE" ? "Khám Online (Video Call)" : "Khám tại phòng khám"}
                        </Chip>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                              <Chip size="lg" color={getStatusColor(selectedAppointment.status)} variant="flat">
                                {getStatusLabel(selectedAppointment.status)}
                              </Chip>
                            </div>
                          </div>

                          {selectedAppointment.reason && (
                            <>
                              <Divider />
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="text-orange-600" size={18} />
                                  <p className="text-sm font-medium text-gray-700">Lý do khám</p>
                        </div>
                                <div className="text-gray-900 bg-orange-50 p-3 rounded-lg">
                                  <p className="mb-2 whitespace-pre-line">{getDisplayReason(selectedAppointment)}</p>
                                  {/* Thumbnails if backend returns URLs */}
                                  {extractAttachmentUrls(selectedAppointment).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {extractAttachmentUrls(selectedAppointment).map((url, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => { setPreviewImgUrl(url); onImgOpen(); }}
                                          className="w-20 h-20 rounded overflow-hidden border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                          <img src={url} alt={`attachment-${i+1}`} className="w-full h-full object-cover" />
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    (getAttachmentNamesFromDetail(selectedAppointment).length > 0 ? getAttachmentNamesFromDetail(selectedAppointment) : parseAttachmentsFromReason(getDisplayReason(selectedAppointment))).length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                        {(getAttachmentNamesFromDetail(selectedAppointment).length > 0 ? getAttachmentNamesFromDetail(selectedAppointment) : parseAttachmentsFromReason(getDisplayReason(selectedAppointment))).map((name, i) => (
                                          <Chip key={i} size="sm" variant="flat" color="warning">
                                            {name}
                        </Chip>
                                        ))}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          <Divider />

                          <div className="text-xs text-gray-500">
                            <p>Mã lịch hẹn: #{selectedAppointment.appointmentId}</p>
                            <p>Đặt lúc: {new Date(selectedAppointment.createdAt).toLocaleString("vi-VN")}</p>
                        </div>
          </CardBody>
        </Card>
                    </div>
                  </Tab>

                  {/* Tab 3: Hành động */}
                  <Tab key="actions" title={<div className="flex items-center gap-2"><Stethoscope size={16} />Hành động</div>}>
                    <div className="space-y-4 py-4">
                      <Card>
                        <CardBody className="space-y-4">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <ClipboardList size={20} className="text-teal-600" />
                            Quản lý lịch hẹn
                          </h4>

                          {/* Actions for CONFIRMED appointments */}
                          {selectedAppointment.status === "CONFIRMED" && (
                            <div className="space-y-3">
                              {selectedAppointment.type === "ONLINE" ? (
                                <Button
                                  color="success"
                                  size="lg"
                                  className="w-full"
                                  startContent={<Video size={20} />}
                                  onPress={() => handleStartConsultation(selectedAppointment.appointmentId, "ONLINE")}
                                >
                                  Tạo phòng khám Online (Video Call)
                                </Button>
                              ) : (
                                <Button
                                  color="primary"
                                  size="lg"
                                  className="w-full"
                                  startContent={<Stethoscope size={20} />}
                                  onPress={() => handleStartConsultation(selectedAppointment.appointmentId, "OFFLINE")}
                                >
                                  Bắt đầu khám bệnh
                                </Button>
                              )}

                              <Button
                                color="primary"
                                variant="flat"
                                size="lg"
                                className="w-full"
                                startContent={<Plus size={20} />}
                                onPress={() => router.push(`/bac-si/ghi-kham-benh/${selectedAppointment.appointmentId}`)}
                              >
                                Ghi kết quả khám bệnh
                              </Button>
                </div>
                          )}

                          {/* Actions for PENDING appointments */}
                          {selectedAppointment.status === "PENDING" && (
                            <div className="space-y-3">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-yellow-800 flex items-center gap-2">
                                  <AlertCircle size={16} />
                                  Lịch hẹn đang chờ xác nhận. Vui lòng xác nhận hoặc từ chối.
                                </p>
              </div>
                              <Button
                                color="success"
                                size="lg"
                                className="w-full"
                                onPress={() => handleConfirm(selectedAppointment.appointmentId)}
                                isLoading={processing}
                                startContent={<CheckCircle size={20} />}
                              >
                                ✅ Xác nhận lịch hẹn
                              </Button>
                              <Button
                                color="danger"
                                variant="flat"
                                size="lg"
                                className="w-full"
                                onPress={() => handleDeny(selectedAppointment.appointmentId)}
                                isLoading={processing}
                                startContent={<XCircle size={20} />}
                              >
                                ❌ Từ chối lịch hẹn
                              </Button>
                            </div>
                          )}

                          {/* Status messages for other states */}
                          {selectedAppointment.status === "FINISHED" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-800 flex items-center gap-2">
                                <CheckCircle size={16} />
                                Lịch hẹn đã hoàn thành.
                              </p>
                            </div>
                          )}

                          {selectedAppointment.status === "DENIED" && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <p className="text-sm text-gray-800 flex items-center gap-2">
                                <XCircle size={16} />
                                Lịch hẹn đã bị từ chối.
                              </p>
                            </div>
                          )}

                          {selectedAppointment.status === "CANCELLED" && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <p className="text-sm text-red-800 flex items-center gap-2">
                                <XCircle size={16} />
                                Lịch hẹn đã bị hủy bởi bệnh nhân.
                              </p>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </div>
                  </Tab>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* EMR Viewer Modal */}
      <Modal isOpen={isEmrOpen} onClose={onEmrClose} size="5xl" scrollBehavior="inside">
        <ModalContent>
          {patientEmr && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Hồ sơ bệnh án</h2>
                <p className="text-sm text-gray-600 font-normal">
                  {patientEmr.patient_profile?.full_name || "Bệnh nhân"}
                </p>
              </ModalHeader>
            <ModalBody>
                <div className="space-y-6">
                  {/* Patient Profile Card with Photo */}
                  <Card>
                    <CardHeader className="flex gap-3">
                      <FileText className="text-teal-600" size={24} />
                      <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <div className="flex gap-6 mb-6">
                        {/* Patient Photo */}
                        <div className="flex-shrink-0">
                          {patientEmr.patient_profile?.id_photo_url ? (
                            <button
                              type="button"
                              onClick={() => { setPreviewImgUrl(patientEmr.patient_profile.id_photo_url); onImgOpen(); }}
                              className="w-32 h-[170px] rounded-lg overflow-hidden border-2 border-teal-500 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              <img 
                                src={patientEmr.patient_profile.id_photo_url} 
                                alt="ID Photo" 
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ) : (
                            <Avatar
                              name={patientEmr.patient_profile?.full_name?.charAt(0)?.toUpperCase()}
                              className="w-32 h-32"
                            />
                          )}
                        </div>

                        {/* Patient Basic Info */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                            <p className="text-sm text-gray-600">Họ và tên</p>
                            <p className="font-medium text-lg">{patientEmr.patient_profile?.full_name || "N/A"}</p>
                      </div>
                      <div>
                            <p className="text-sm text-gray-600">Ngày sinh</p>
                            <p className="font-medium">
                              {patientEmr.patient_profile?.date_of_birth 
                                ? new Date(patientEmr.patient_profile.date_of_birth).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </p>
                      </div>
                      <div>
                            <p className="text-sm text-gray-600">Giới tính</p>
                            <p className="font-medium">{patientEmr.patient_profile?.gender || "N/A"}</p>
                      </div>
                          <div>
                            <p className="text-sm text-gray-600">Nhóm máu</p>
                            <p className="font-medium">{patientEmr.patient_profile?.blood_type || "N/A"}</p>
                    </div>
                          <div>
                            <p className="text-sm text-gray-600">Số điện thoại</p>
                            <p className="font-medium">{patientEmr.patient_profile?.phone || "N/A"}</p>
                  </div>
                  <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-sm">{patientEmr.patient_profile?.email || "N/A"}</p>
                          </div>
                    </div>
                  </div>

                      {/* Full Address */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                        <p className="font-medium">{typeof patientEmr.patient_profile?.address === 'object' ? (patientEmr.patient_profile?.address?.full || [patientEmr.patient_profile?.address?.address_detail, patientEmr.patient_profile?.address?.ward_name, patientEmr.patient_profile?.address?.district_name, patientEmr.patient_profile?.address?.province_name].filter(Boolean).join(', ')) : (patientEmr.patient_profile?.address || 'N/A')}</p>
                      </div>

                      <Divider className="my-4" />

                      {/* Additional Personal/Identification Info */}
                    <div className="grid grid-cols-2 gap-4">
                        {patientEmr.patient_profile?.identification_number && (
                  <div>
                            <p className="text-sm text-gray-600">CMND/CCCD</p>
                            <p className="font-medium">{patientEmr.patient_profile.identification_number}</p>
                      </div>
                        )}
                        {patientEmr.patient_profile?.insurance_number && (
                      <div>
                            <p className="text-sm text-gray-600">Số BHYT</p>
                            <p className="font-medium">{patientEmr.patient_profile.insurance_number}</p>
                      </div>
                        )}
                        {(patientEmr.patient_profile?.insurance_expiry || patientEmr.patient_profile?.insurance_expired_at || patientEmr.patient_profile?.bhyt_expired_at) && (
                          <div>
                            <p className="text-sm text-gray-600">BHYT hết hạn</p>
                            <p className="font-medium">{
                              new Date(
                                patientEmr.patient_profile.insurance_expiry ||
                                patientEmr.patient_profile.insurance_expired_at ||
                                patientEmr.patient_profile.bhyt_expired_at
                              ).toLocaleDateString("vi-VN")
                            }</p>
                          </div>
                        )}
                        {patientEmr.patient_profile?.emergency_contact_name && (
                      <div>
                            <p className="text-sm text-gray-600">Người liên hệ khẩn cấp</p>
                            <p className="font-medium">{patientEmr.patient_profile.emergency_contact_name}</p>
                      </div>
                        )}
                        {patientEmr.patient_profile?.emergency_contact_phone && (
                      <div>
                            <p className="text-sm text-gray-600">SĐT khẩn cấp</p>
                            <p className="font-medium">{patientEmr.patient_profile.emergency_contact_phone}</p>
                      </div>
                        )}
                        {patientEmr.patient_profile?.emergency_contact_relationship && (
                          <div>
                            <p className="text-sm text-gray-600">Mối quan hệ</p>
                            <p className="font-medium">{patientEmr.patient_profile.emergency_contact_relationship}</p>
                    </div>
                        )}
                        {patientEmr.patient_profile?.occupation && (
                          <div>
                            <p className="text-sm text-gray-600">Nghề nghiệp</p>
                            <p className="font-medium">{patientEmr.patient_profile.occupation}</p>
                          </div>
                        )}
                  </div>

                      {/* Medical Warnings from medical_history (preferred) */}
                      {(patientEmr.medical_history?.allergies || patientEmr.medical_history?.previous_conditions || patientEmr.patient_profile?.allergies || patientEmr.patient_profile?.chronic_conditions) && (
                        <>
                          <Divider className="my-4" />
                          <div className="grid grid-cols-2 gap-4">
                            {(patientEmr.medical_history?.allergies || patientEmr.patient_profile?.allergies) && (
                              <div className="bg-red-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                                  <AlertCircle className="text-red-600" size={16} />
                                  Dị ứng
                                </p>
                                <p className="font-medium text-red-700">{patientEmr.medical_history?.allergies || patientEmr.patient_profile?.allergies}</p>
                    </div>
                  )}
                            {(patientEmr.medical_history?.previous_conditions || patientEmr.patient_profile?.chronic_conditions) && (
                              <div className="bg-orange-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                                  <Heart className="text-orange-600" size={16} />
                                  Bệnh mãn tính
                                </p>
                                <p className="font-medium text-orange-700">{patientEmr.medical_history?.previous_conditions || patientEmr.patient_profile?.chronic_conditions}</p>
                </div>
              )}
                          </div>
                        </>
                      )}
                    </CardBody>
                  </Card>

                  {/* Medical Records */}
                  {patientEmr.medical_records && patientEmr.medical_records.length > 0 && (
                    <Card>
                      <CardHeader className="flex gap-3">
                        <ClipboardList className="text-teal-600" size={24} />
                        <h3 className="text-lg font-semibold">Lịch sử khám bệnh ({patientEmr.medical_records.length} lần)</h3>
                      </CardHeader>
                      <Divider />
                      <CardBody>
                        <Accordion>
                          {patientEmr.medical_records.map((record, index) => (
                            <AccordionItem
                              key={index}
                              title={
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-semibold">
                                    Lần khám #{patientEmr.medical_records.length - index}
                                  </span>
                                  <Chip size="sm" variant="flat" color="primary">
                                    {formatMedicalRecordDate(record.visit_date || record.date)}
                                  </Chip>
                                </div>
                              }
                            >
                              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                                    <p className="text-xs text-gray-600">Ngày khám</p>
                                    <p className="font-medium">{formatMedicalRecordDate(record.visit_date || record.date)}</p>
                      </div>
                      <div>
                                    <p className="text-xs text-gray-600">Giờ khám</p>
                                    <p className="font-medium">{record.visit_time || record.time || "N/A"}</p>
                      </div>
                      <div>
                                    <p className="text-xs text-gray-600">Bác sĩ</p>
                                    <p className="font-medium">{record.doctor_name || "N/A"}</p>
                      </div>
                      <div>
                                    <p className="text-xs text-gray-600">Loại khám</p>
                                    <p className="font-medium">
                                      {(record.visit_type || record.type) === 'online' || (record.visit_type || record.type) === 'ONLINE' 
                                        ? 'Online' 
                                        : 'Tại phòng khám'}
                                    </p>
                      </div>
                    </div>

                                {/* Vital Signs if available */}
                                {record.vital_signs && (
                                  <>
                                    <Divider className="my-2" />
                                    <div>
                                      <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                        <Activity size={14} />
                                        Sinh hiệu
                                      </p>
                                      <div className="grid grid-cols-3 gap-2 text-sm">
                                        {record.vital_signs.temperature && (
                                          <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-500">Nhiệt độ</p>
                                            <p className="font-medium">{record.vital_signs.temperature}°C</p>
                  </div>
                                        )}
                                        {record.vital_signs.blood_pressure && (
                                          <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-500">Huyết áp</p>
                                            <p className="font-medium">{record.vital_signs.blood_pressure} mmHg</p>
                                          </div>
                                        )}
                                        {record.vital_signs.heart_rate && (
                                          <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-500">Nhịp tim</p>
                                            <p className="font-medium">{record.vital_signs.heart_rate} bpm</p>
                                          </div>
                                        )}
                                        {record.vital_signs.spo2 && (
                                          <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-500">SpO2</p>
                                            <p className="font-medium">{record.vital_signs.spo2}%</p>
                                          </div>
                                        )}
                                        {record.vital_signs.weight && (
                                          <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-500">Cân nặng</p>
                                            <p className="font-medium">{record.vital_signs.weight} kg</p>
                                          </div>
                                        )}
                                        {record.vital_signs.height && (
                                          <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-500">Chiều cao</p>
                                            <p className="font-medium">{record.vital_signs.height} cm</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                </>
              )}

                                {/* Reason for visit */}
                                {(record.chief_complaint || record.reason) && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Lý do khám</p>
                                    <p className="text-sm bg-orange-50 p-2 rounded whitespace-pre-line">
                                      {record.chief_complaint || formatReasonForDisplay(record.reason)}
                                    </p>
                    </div>
                  )}

                                {record.diagnosis && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                      <Stethoscope size={14} />
                                      Chẩn đoán
                                    </p>
                                    <p className="font-medium bg-red-50 p-2 rounded">
                                      {formatDiagnosis(record.diagnosis)}
                                    </p>
                </div>
              )}

                                {record.prescriptions && record.prescriptions.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                      <Pill size={14} />
                                      Đơn thuốc
                                    </p>
                                    <div className="space-y-2">
                                      {record.prescriptions.map((rx, idx) => {
                                        const medicineName = rx.medication || rx.medicine_name || rx.name || 'Thuốc không xác định';
                                        return (
                                          <div key={idx} className="bg-green-50 p-2 rounded text-sm">
                                            <p className="font-medium">{medicineName}</p>
                                            <p className="text-xs text-gray-600">
                                              {rx.dosage || 'N/A'} - {rx.frequency || 'N/A'} - {rx.duration || 'N/A'}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {record.notes && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Ghi chú</p>
                                    <p className="text-sm bg-blue-50 p-2 rounded">{record.notes}</p>
                                  </div>
                                )}
                              </div>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardBody>
                    </Card>
                  )}

                  {(!patientEmr.medical_records || patientEmr.medical_records.length === 0) && (
                    <Card>
                      <CardBody className="text-center py-8">
                        <ClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">Chưa có lịch sử khám bệnh</p>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </ModalBody>
            <ModalFooter>
                <Button variant="light" onPress={onEmrClose}>
                  Đóng
              </Button>
            </ModalFooter>
                </>
              )}
          </ModalContent>
        </Modal>

      {/* Image Preview Modal */}
      <Modal isOpen={isImgOpen} onClose={() => { setPreviewImgUrl(null); onImgClose(); }} size="xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Ảnh đính kèm</h3>
          </ModalHeader>
          <ModalBody>
            {previewImgUrl && (
              <div className="w-full">
                <img src={previewImgUrl} alt="attachment" className="w-full h-auto rounded-lg" />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {previewImgUrl && (
              <Button as="a" href={previewImgUrl} target="_blank" rel="noreferrer" variant="flat" color="primary">
                Mở ảnh gốc
              </Button>
            )}
            <Button variant="light" onPress={() => { setPreviewImgUrl(null); onImgClose(); }}>Đóng</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </DoctorFrame>
  );
}
