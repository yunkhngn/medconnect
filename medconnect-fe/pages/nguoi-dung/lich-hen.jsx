import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Globe, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/router";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

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
      <Card>
        <CardBody className="p-0">
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 min-w-[100px]">
                    Thời gian
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
                {["07:30", "10:00", "12:50", "15:20"].map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3 text-gray-600 bg-gray-50 font-medium">
                      {timeSlot}
                    </td>
                    {weekDays.map((day, i) => {
                      const dayAppointments = appointments.filter((apt) => {
                        const aptTime = getSlotTime(apt.slot);
                        const aptDate = new Date(apt.date).toISOString().split("T")[0];
                        return (
                          aptDate === day.toISOString().split("T")[0] &&
                          aptTime === timeSlot
                        );
                      });

                      return (
                        <td key={i} className="border border-gray-200 p-2 align-top text-xs">
                          {dayAppointments.length > 0 ? (
                            dayAppointments.map((apt) => (
                              <div
                                key={apt.appointmentId}
                                className={`border-2 rounded-lg p-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(apt.status)}`}
                              >
                                <div className="font-semibold">{apt.doctor?.name || "Bác sĩ"}</div>
                                <div className="text-gray-600">{apt.doctor?.specialization || "Chuyên khoa"}</div>
                                <div className="text-xs mt-1">
                                  <span className="font-medium">{getStatusLabel(apt.status)}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {apt.type === "ONLINE" ? (
                                    <>
                                      <Globe size={12} className="text-green-600" />
                                      <span className="text-green-700 font-medium">Online</span>
                                    </>
                                  ) : (
                                    <>
                                      <MapPin size={12} className="text-orange-600" />
                                      <span className="text-orange-700 font-medium">Offline</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-300 text-center">-</div>
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
