import { useEffect, useState } from "react";
import { Calendar, Clock, User } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const mock = [
      {
        id: "1",
        appointment_date: selectedDate,
        appointment_time: "09:00:00",
        duration_minutes: 30,
        status: "scheduled",
        reason: "Khám tổng quát",
        notes: "Nhịn ăn trước khi xét nghiệm máu.",
        doctor: { full_name: "BS. Trần Minh Khoa", specialty: "Nội tổng quát" },
      },
      {
        id: "2",
        appointment_date: selectedDate,
        appointment_time: "10:30:00",
        duration_minutes: 20,
        status: "completed",
        reason: "Tái khám",
        notes: "",
        doctor: { full_name: "BS. Nguyễn Thu Hà", specialty: "Da liễu" },
      },
      {
        id: "3",
        appointment_date: addDaysISO(selectedDate, 1),
        appointment_time: "14:00:00",
        duration_minutes: 45,
        status: "scheduled",
        reason: "Khám tim mạch",
        notes: "Mang theo kết quả ECG lần trước.",
        doctor: { full_name: "BS. Lê Hoàng Nam", specialty: "Tim mạch" },
      },
      {
        id: "4",
        appointment_date: addDaysISO(selectedDate, -1),
        appointment_time: "16:30:00",
        duration_minutes: 15,
        status: "cancelled",
        reason: "Khám răng",
        notes: "Bệnh nhân xin hủy.",
        doctor: { full_name: "BS. Phạm Mỹ Dung", specialty: "Răng - Hàm - Mặt" },
      },
    ];
    const t = setTimeout(() => {
      setAppointments(mock);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const getAppointmentsByDate = (date) =>
    appointments.filter((apt) => apt.appointment_date === date);

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "scheduled":
        return "Đã lên lịch";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const timeSlots = generateTimeSlots();
  const dateAppointments = getAppointmentsByDate(selectedDate);

  return (
    <PatientFrame title="Lịch hẹn">
      <div className="p-6 md:p-8 max-w-7xl mx-auto md:pl-28 lg:pl-32 xl:pl-36">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch hẹn khám</h1>
          </div>
          <p className="text-gray-600">Xem và quản lý lịch hẹn của bạn</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-96 bg-gray-200 rounded" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột chọn ngày + danh sách tổng */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn ngày</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
                />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Tất cả lịch hẹn</h3>
                  {appointments.length === 0 ? (
                    <p className="text-gray-500 text-sm">Không có lịch hẹn nào</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() =>
                            setSelectedDate(appointment.appointment_date)
                          }
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            appointment.appointment_date === selectedDate
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(
                              appointment.appointment_date
                            ).toLocaleDateString("vi-VN")}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {appointment.appointment_time.slice(0, 5)} -{" "}
                            {appointment.doctor?.full_name}
                          </p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cột lịch theo khung giờ */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Lịch hẹn ngày{" "}
                    {new Date(selectedDate).toLocaleDateString("vi-VN")}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {dateAppointments.length} lịch hẹn
                  </span>
                </div>

                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const appointment = dateAppointments.find(
                      (apt) => apt.appointment_time.slice(0, 5) === time
                    );

                    return (
                      <div
                        key={time}
                        className="flex items-start gap-4 border-b border-gray-100 pb-2"
                      >
                        <div className="w-20 flex-shrink-0 pt-2">
                          <p className="text-sm font-medium text-gray-600">
                            {time}
                          </p>
                        </div>

                        {appointment ? (
                          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <User size={16} className="text-blue-600" />
                                  <p className="font-semibold text-gray-900">
                                    {appointment.doctor?.full_name}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {appointment.doctor?.specialty}
                                </p>
                                {appointment.reason && (
                                  <p className="text-sm text-gray-700 mb-2">
                                    <span className="font-medium">Lý do:</span>{" "}
                                    {appointment.reason}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {appointment.duration_minutes} phút
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {getStatusText(appointment.status)}
                              </span>
                            </div>
                            {appointment.notes && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Ghi chú:</span>{" "}
                                  {appointment.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 text-gray-400 text-sm pt-2">
                            Trống
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientFrame>
  );
}

/* ---------- helpers ---------- */
function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
}
function addDaysISO(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
