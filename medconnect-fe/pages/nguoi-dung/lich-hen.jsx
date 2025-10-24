import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Globe, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/router";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import { Chip } from "@heroui/react";
import { CheckCircle } from "lucide-react";


export default function AppointmentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      router.push("/dang-nhap");
      return;
    }
    fetchAppointments();
  }, [user, authLoading]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/appointments/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
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

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
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

  const weekDays = getWeekDays(currentWeekStart);

  const getStatusColor = (status) => {
    const statusMap = {
      "PENDING": "bg-yellow-50 border-yellow-300 text-yellow-900",
      "CONFIRMED": "bg-blue-50 border-blue-300 text-blue-900",
      "FINISHED": "bg-green-50 border-green-300 text-green-900",
      "CANCELLED": "bg-red-50 border-red-300 text-red-900",
      "DENIED": "bg-gray-50 border-gray-300 text-gray-900",
      "ONGOING": "bg-purple-50 border-purple-300 text-purple-900"
    };
    return statusMap[status] || "bg-gray-50 border-gray-300 text-gray-900";
  };

  const getStatusLabel = (status) => {
    const labels = {
      "PENDING": "Chờ xác nhận",
      "CONFIRMED": "Đã xác nhận",
      "FINISHED": "Hoàn thành",
      "CANCELLED": "Đã hủy",
      "DENIED": "Bị từ chối",
      "ONGOING": "Đang khám"
    };
    return labels[status] || status;
  };

  
  const getSlotTime = (slot) => {
    const slotTimes = {
      "SLOT_1": "07:30",
      "SLOT_2": "10:00",
      "SLOT_3": "12:50",
      "SLOT_4": "15:20"
    };
    return slotTimes[slot] || "N/A";
  };



const SLOTS = [
  // Morning slots (7:30 - 12:00)
  { id: "SLOT_1", time: "07:30 - 08:00"},
  { id: "SLOT_2", time: "08:15 - 08:45"},
  { id: "SLOT_3", time: "09:00 - 09:30"},
  { id: "SLOT_4", time: "09:45 - 10:15"},
  { id: "SLOT_5", time: "10:30 - 11:00"},
  { id: "SLOT_6", time: "11:15 - 11:45"},
  // Lunch break: 12:00 - 13:00
  // Afternoon slots (13:00 - 17:15)
  { id: "SLOT_7", time: "13:00 - 13:30"},
  { id: "SLOT_8", time: "13:45 - 14:15"},
  { id: "SLOT_9", time: "14:30 - 15:00"},
  { id: "SLOT_10", time: "15:15 - 15:45"},
  { id: "SLOT_11", time: "16:00 - 16:30"},
  { id: "SLOT_12", time: "16:45 - 17:15"}
];

// Lấy thông tin lịch hẹn của từng ô (theo ngày + ca)
function getSlotData(date, slot) {
  const dayStr = date.toISOString().split("T")[0];
  const slotAppointments = appointments.filter(
    (a) =>
      a.date === dayStr &&
      a.slot === slot.id
  );

  if (slotAppointments.length === 0) return { status: "EMPTY" };
  const appointment = slotAppointments[0];

  if (appointment.status === "CONFIRMED" || appointment.status === "ONGOING" || appointment.status === "FINISHED") {
    return { status: "BUSY", appointment };
  } else if (appointment.status === "PENDING") {
    return { status: "RESERVED", appointment };
  } else {
    return { status: "EMPTY" };
  }
}

  if (authLoading || loading) {
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
            onClick={() => router.push("/dat-lich-kham")}
          >
            Đặt lịch khám mới
          </Button>
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
            <Globe size={14} className="text-green-600" />
            <span>Khám online</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-orange-600" />
            <span>Khám tại phòng khám</span>
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
                <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn khám</h1>
                <p className="text-gray-600 text-sm">Xem lịch hẹn theo tuần</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onClick={previousWeek}
                title="Tuần trước"
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
                title="Tuần sau"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Calendar Table Card */}
<Card className="shadow-lg">
  <CardBody className="p-0">
    <div className="overflow-auto max-h-[75vh]">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-gradient-to-r from-gray-100 to-gray-50 z-10 shadow-sm">
          <tr>
            <th className="border-2 border-gray-300 p-4 text-left font-bold text-gray-800 min-w-[120px] bg-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" />
                Ca khám
              </div>
            </th>
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <th
                  key={index}
                  className={`border-2 border-gray-300 p-3 text-center font-bold min-w-[140px] ${
                    isToday ? "bg-teal-100 border-teal-400" : "bg-gray-50"
                  }`}
                >
                  <div className={`text-xs uppercase tracking-wide ${isToday ? "text-teal-700" : "text-gray-600"}`}>
                    {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                  </div>
                  <div className={`text-xl font-bold mt-1 ${isToday ? "text-teal-700" : "text-gray-800"}`}>
                    {day.getDate()}/{day.getMonth() + 1}
                  </div>
                  {isToday && <div className="text-xs text-teal-600 font-semibold mt-1">Hôm nay</div>}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {SLOTS.map((slot, slotIdx) => (
            <tr key={slot.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="border-2 border-gray-300 p-4 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Ca {slotIdx + 1}</span>
                  <span className="text-sm">{slot.time}</span>
                </div>
              </td>

              {weekDays.map((day, dayIdx) => {
                const slotData = getSlotData(day, slot);
                const status = slotData?.status || "EMPTY";
                const isBusy = status === "BUSY";
                const isReserved = status === "RESERVED";
                const isEmpty = status === "EMPTY";
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <td
                    key={dayIdx}
                    className={`border-2 border-gray-300 p-3 text-center transition-all duration-200 ${
                      isToday ? "bg-teal-50/30" : "bg-white"
                    }`}
                  >
                    {isEmpty && (
                      <div className="py-6 text-gray-400 text-xs italic">—</div>
                    )}
                    {isReserved && (
                      <div className="py-3">
                        <Chip color="warning" size="sm" variant="solid" className="font-semibold">
                          Có thể đặt
                        </Chip>
                      </div>
                    )}
                    {isBusy && slotData.appointment && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="text-green-700" size={20} />
                        </div>
                        <p className="font-bold text-sm text-green-900 mb-1">
                          {slotData.appointment.doctor?.name || "Bác sĩ"}
                        </p>
                        <Chip color="success" size="sm" variant="solid" className="font-semibold">
                          Đã đặt
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
    <PatientFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />
    </PatientFrame>
  );
}
