import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Chip, Divider, Input, Select, SelectItem,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Avatar
} from "@heroui/react";
import { Calendar, Search, CheckCircle, XCircle, Clock, User, Video, MapPin } from "lucide-react";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

const SLOT_TIMES = {
  SLOT_1: "07:30 - 09:50",
  SLOT_2: "10:00 - 12:20",
  SLOT_3: "12:50 - 15:10",
  SLOT_4: "15:20 - 17:40"
};

export default function DoctorAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [processing, setProcessing] = useState(false);

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

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/appointments/doctor", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        toast.error("Không thể tải danh sách lịch hẹn");
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
      {/* Stats Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Calendar className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Thống kê</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">Chờ xác nhận</p>
            <p className="text-3xl font-bold text-yellow-900">{getPendingCount()}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">Tổng lịch hẹn</p>
            <p className="text-3xl font-bold text-blue-900">{appointments.length}</p>
          </div>
        </CardBody>
      </Card>

      {/* Filters Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Search className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Bộ lọc</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          <Input
            placeholder="Tìm theo tên bệnh nhân..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-gray-400" />}
          />
          <Select
            label="Trạng thái"
            selectedKeys={[statusFilter]}
            onChange={(e) => setStatusFilter(e.target.value)}
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
    </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
              <p className="text-gray-600 text-sm">
                {filteredAppointments.length} lịch hẹn
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardBody className="p-0">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Không có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.appointmentId}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedAppointment(apt);
                    onOpen();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <Avatar
                        src={apt.patient?.avatarUrl}
                        name={apt.patient?.name?.[0]}
                        size="lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{apt.patient?.name || "Bệnh nhân"}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{new Date(apt.date).toLocaleDateString("vi-VN")}</span>
                          <Clock size={14} className="ml-2" />
                          <span>{SLOT_TIMES[apt.slot]}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {apt.type === "ONLINE" ? (
                            <Chip size="sm" color="success" variant="flat" startContent={<Video size={12} />}>
                              Online
                            </Chip>
                          ) : (
                            <Chip size="sm" color="warning" variant="flat" startContent={<MapPin size={12} />}>
                              Offline
                            </Chip>
                          )}
                          <Chip size="sm" color={getStatusColor(apt.status)} variant="flat">
                            {getStatusLabel(apt.status)}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  return (
    <DoctorFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Appointment Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {selectedAppointment && (
            <>
              <ModalHeader>Chi tiết lịch hẹn</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selectedAppointment.patient?.avatarUrl}
                      name={selectedAppointment.patient?.name?.[0]}
                      size="lg"
                    />
                    <div>
                      <p className="font-semibold text-lg">{selectedAppointment.patient?.name}</p>
                      <p className="text-sm text-gray-600">{selectedAppointment.patient?.email}</p>
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ngày khám</p>
                      <p className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Giờ khám</p>
                      <p className="font-medium">{SLOT_TIMES[selectedAppointment.slot]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hình thức</p>
                      <Chip size="sm" color={selectedAppointment.type === "ONLINE" ? "success" : "warning"} variant="flat">
                        {selectedAppointment.type === "ONLINE" ? "Online" : "Offline"}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <Chip size="sm" color={getStatusColor(selectedAppointment.status)} variant="flat">
                        {getStatusLabel(selectedAppointment.status)}
                      </Chip>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Đóng
                </Button>
                {selectedAppointment.status === "PENDING" && (
                  <>
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={() => handleDeny(selectedAppointment.appointmentId)}
                      isLoading={processing}
                      startContent={<XCircle size={18} />}
                    >
                      Từ chối
                    </Button>
                    <Button
                      color="success"
                      onPress={() => handleConfirm(selectedAppointment.appointmentId)}
                      isLoading={processing}
                      startContent={<CheckCircle size={18} />}
                    >
                      Xác nhận
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DoctorFrame>
  );
}
