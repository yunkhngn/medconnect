import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@heroui/react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, Info } from "lucide-react";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

const SLOTS = [
  { id: "SLOT_1", time: "07:30 - 09:50" },
  { id: "SLOT_2", time: "10:00 - 12:20" },
  { id: "SLOT_3", time: "12:50 - 15:10" },
  { id: "SLOT_4", time: "15:20 - 17:40" }
];

export default function DoctorSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    fetchSchedule();
  }, [user, authLoading, currentWeekStart]);

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekDays(startDate) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }

  function previousWeek() {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  }

  function nextWeek() {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  }

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const weekDays = getWeekDays(currentWeekStart);
      const startDate = formatDate(weekDays[0]);
      const endDate = formatDate(weekDays[6]);

      const response = await fetch(
        `http://localhost:8080/api/schedule/weekly?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { "Authorization": `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setScheduleData(data);
      } else {
        toast.error("Không thể tải lịch làm việc");
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (date, slot) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: formatDate(date),
          slot: slot.id,
          status: "RESERVED"
        })
      });

      if (response.ok) {
        toast.success("Đã thêm ca làm việc");
        fetchSchedule();
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể thêm ca làm việc");
      }
    } catch (error) {
      console.error("Error adding slot:", error);
      toast.error("Lỗi kết nối server");
    }
  };

  const handleDeleteSlot = async (scheduleId) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/schedule/${scheduleId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Đã xóa ca làm việc");
        fetchSchedule();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể xóa ca làm việc");
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Lỗi kết nối server");
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getSlotData = (date, slot) => {
    const dateStr = formatDate(date);
    return scheduleData.find(
      (s) => s.date === dateStr && s.slot === slot.id
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      EMPTY: "default",
      RESERVED: "warning",
      BUSY: "success"
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      EMPTY: "Trống",
      RESERVED: "Sẵn sàng",
      BUSY: "Có lịch hẹn"
    };
    return labels[status] || status;
  };

  const weekDays = getWeekDays(currentWeekStart);

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
      {/* Instructions Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Info className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Hướng dẫn</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
            <p>Click vào ô <strong>trống</strong> để thêm ca làm việc</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
            <p>Click vào ô <strong>đã chặn</strong> để xóa ca</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
            <p>Ô <strong>có lịch hẹn</strong> không thể xóa</p>
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
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <Chip size="sm" color="default">Trống</Chip>
            <span className="text-sm text-gray-600">Chưa có lịch</span>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" color="warning">Đã chặn</Chip>
            <span className="text-sm text-gray-600">Không nhận lịch hẹn</span>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" color="success">Có lịch hẹn</Chip>
            <span className="text-sm text-gray-600">Đã có bệnh nhân đặt</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch làm việc</h1>
                <p className="text-gray-600 text-sm">Quản lý ca làm việc theo tuần</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onClick={previousWeek}
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
              >
                Tuần hiện tại
              </Button>
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onClick={nextWeek}
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Schedule Table Card */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 min-w-[100px]">
                    Ca làm việc
                  </th>
                  {weekDays.map((day, index) => (
                    <th key={index} className="border border-gray-200 p-3 text-center font-semibold text-gray-700 min-w-[120px]">
                      <div className="text-sm text-teal-600">
                        {day.toLocaleDateString("vi-VN", { weekday: "short" }).toUpperCase()}
                      </div>
                      <div className="text-lg">{day.getDate()}/{day.getMonth() + 1}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {SLOTS.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3 text-gray-600 bg-gray-50 font-medium">
                      {slot.time}
                    </td>
                    {weekDays.map((day, dayIdx) => {
                      const slotData = getSlotData(day, slot);
                      const status = slotData?.status || "EMPTY";
                      const isBusy = status === "BUSY";
                      const isReserved = status === "RESERVED";
                      const isEmpty = status === "EMPTY";

                      return (
                        <td
                          key={dayIdx}
                          className={`border border-gray-200 p-2 text-center cursor-pointer transition-colors ${
                            isEmpty ? "hover:bg-blue-50" : ""
                          } ${isReserved ? "hover:bg-red-50" : ""}`}
                          onClick={() => {
                            if (isEmpty) {
                              handleAddSlot(day, slot);
                            } else if (isReserved) {
                              setSelectedSlot(slotData);
                              onOpen();
                            }
                          }}
                        >
                          {isEmpty && (
                            <div className="flex items-center justify-center gap-1 text-gray-400">
                              <Plus size={16} />
                              <span className="text-xs">Thêm ca</span>
                            </div>
                          )}
                          {isReserved && (
                            <Chip color="warning" size="sm" variant="flat">
                              Đã chặn
                            </Chip>
                          )}
                          {isBusy && slotData.appointment && (
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <p className="font-semibold text-xs">{slotData.appointment.patient?.name || "Bệnh nhân"}</p>
                              <Chip color="success" size="sm" variant="flat" className="mt-1">
                                {slotData.appointment.status}
                              </Chip>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <DoctorFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Xóa ca làm việc</ModalHeader>
          <ModalBody>
            <p>Bạn có chắc muốn xóa ca làm việc này không?</p>
            <p className="text-sm text-gray-500 mt-2">
              Ca này sẽ mở lại cho bệnh nhân đặt lịch.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Hủy
            </Button>
            <Button
              color="danger"
              onPress={() => selectedSlot && handleDeleteSlot(selectedSlot.id)}
            >
              Xóa ca
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DoctorFrame>
  );
}
