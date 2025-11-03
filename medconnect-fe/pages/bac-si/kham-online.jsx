"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Avatar, Chip, Input, Select, SelectItem, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea } from "@heroui/react";
import { Video, Calendar, Clock, User, Phone, Mail, MapPin, Search, Filter } from "lucide-react";
import { useRouter } from "next/router";
import Grid from "@/components/layouts/Grid";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import { auth } from "@/lib/firebase";

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

  useEffect(() => {
    fetchOnlineAppointments();
  }, []);

  const openAppointmentModal = async (apt) => {
    setSelectedAppointment(apt);
    setPrescription(null);
    onOpen();
    try {
      setRxLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const resp = await fetch(`http://localhost:8080/api/medical-records/appointment/${apt.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        // Normalize structure
        const meds = data.medications || data.medicines || [];
        setPrescription({
          medications: Array.isArray(meds) ? meds : [],
          note: data.note || data.notes || ""
        });
      } else {
        setPrescription(null);
      }
    } catch {
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
              <p className="text-sm text-gray-600">Đang chờ</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === "PENDING").length}
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
              placeholder="Tên bệnh nhân, email..."
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
                      src={appointment.patientAvatar}
                      name={appointment.patientName}
                      size="md"
                      className="ring-2 ring-blue-100"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                      <p className="text-xs text-gray-500">Bệnh nhân</p>
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
                    <Phone className="w-4 h-4" />
                    <span>{appointment.patientPhone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{appointment.patientEmail}</span>
                  </div>
                </div>

                <Divider className="my-3" />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Lý do khám</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {appointment.reason || "Không có thông tin"}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  {appointment.status === "PENDING" && (
                    <Button
                      color="primary"
                      size="sm"
                      className="flex-1"
                      onPress={(e) => { e.stopPropagation(); handleStartExam(appointment.id); }}
                    >
                      Xác nhận & Bắt đầu
                    </Button>
                  )}
                  {appointment.status === "CONFIRMED" && (
                    <Button
                      color="success"
                      size="sm"
                      className="flex-1"
                      onPress={(e) => { e.stopPropagation(); handleStartExam(appointment.id); }}
                    >
                      Bắt đầu khám
                    </Button>
                  )}
                  {appointment.status === "ONGOING" && (
                    <Button
                      color="warning"
                      size="sm"
                      className="flex-1"
                      onPress={(e) => { e.stopPropagation(); handleStartExam(appointment.id); }}
                    >
                      Tiếp tục khám
                    </Button>
                  )}
                  {appointment.status === "FINISHED" && (
                    <Button
                      color="default"
                      size="sm"
                      className="flex-1"
                      onPress={(e) => { e.stopPropagation(); handleStartExam(appointment.id); }}
                    >
                      Xem lại
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
    <DoctorFrame title="Khám online">
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Modal for prescription or details */}
      {/* Render at root of component return via Portal inside DoctorFrame */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {selectedAppointment?.patientName || "Chi tiết cuộc hẹn"}
          </ModalHeader>
          <ModalBody>
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
                <p className="text-sm text-gray-600 line-clamp-3">
                  {selectedAppointment.reason || "Không có thông tin"}
                </p>
                <Divider className="my-4" />
                <h4 className="text-sm font-medium text-gray-700">Đơn thuốc</h4>
                {prescription?.medications && prescription.medications.length > 0 ? (
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
                <p className="text-sm text-gray-600 line-clamp-3">
                  {prescription?.note || "Không có ghi chú"}
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