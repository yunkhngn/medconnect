import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Globe, MapPin } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  useEffect(() => {
    const mock = [
      {
        id: "1",
        appointment_date: currentWeekStart.toISOString().split("T")[0],
        appointment_time: "09:00:00",
        duration_minutes: 30,
        status: "scheduled",
        reason: "Khám tổng quát",
        notes: "Nhịn ăn trước khi xét nghiệm máu.",
        doctor: { full_name: "BS. Trần Minh Khoa", specialty: "Nội tổng quát" },
        appointment_type: "offline", // Khám tại phòng khám
      },
      {
        id: "2",
        appointment_date: currentWeekStart.toISOString().split("T")[0],
        appointment_time: "10:30:00",
        duration_minutes: 20,
        status: "completed",
        reason: "Tái khám",
        notes: "",
        doctor: { full_name: "BS. Nguyễn Thu Hà", specialty: "Da liễu" },
        appointment_type: "online", // Khám online
      },
      // Thêm các lịch hẹn mẫu khác ở đây
    ];


    const t = setTimeout(() => {
      setAppointments(mock);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [currentWeekStart]);

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
    switch (status) {
      case "scheduled":
        return "bg-blue-50 border-blue-300 text-blue-900";
      case "completed":
        return "bg-green-50 border-green-300 text-green-900";
      case "cancelled":
        return "bg-red-50 border-red-300 text-red-900";
      default:
        return "bg-gray-50 border-gray-300 text-gray-900";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

return (
  <PatientFrame title="Lịch hẹn">
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="ml-[150px] mr-8 px-4 w-[calc(100%-200px)]"> {/* trừ sidebar */}
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lịch hẹn khám</h1>
              <p className="text-gray-600 text-sm md:text-base">Xem lịch hẹn theo tuần</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={previousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tuần trước"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Tuần hiện tại
            </button>
            <button
              onClick={nextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tuần sau"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Bảng lịch */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto max-h-[70vh]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 min-w-[100px]">
                  Thời gian
                </th>
                {weekDays.map((day, index) => (
                  <th key={index} className="border border-gray-200 p-3 text-center font-semibold text-gray-700 min-w-[120px]">
                    <div className="text-sm text-blue-600">
                      {day.toLocaleDateString("vi-VN", { weekday: "short" }).toUpperCase()}
                    </div>
                    <div className="text-lg">{day.getDate()}/{day.getMonth() + 1}</div>
                  </th>
                ))}
              </tr>
            </thead>


            <tbody>
              {[
                "07:30", "08:00", "08:30", "09:00", "09:30", "10:00",
                "10:30", "11:00", "13:00", "13:30", "14:00", "15:00",
                "15:30", "16:00", "17:00","17:30","18:00",
              ].map((timeSlot) => (
                <tr key={timeSlot} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-600 bg-gray-50 font-medium">
                    {timeSlot}
                  </td>
                  {weekDays.map((day, i) => {
                    const dayAppointments = appointments.filter((apt) => {
                      const aptTime = apt.appointment_time.slice(0, 5);
                      return (
                        apt.appointment_date === day.toISOString().split("T")[0] &&
                        aptTime === timeSlot
                      );
                    });

                    return (
                      <td key={i} className="border border-gray-200 p-2 align-top text-xs">
                        {dayAppointments.length > 0 ? (
                          dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={`border-2 rounded-lg p-2 mb-2 ${getStatusColor(apt.status)}`}
                            >
                              <div className="font-semibold">{apt.doctor?.full_name}</div>
                              <div className="text-gray-600">{apt.doctor?.specialty}</div>
                              <div className="text-gray-700">
                                <span className="font-medium">Lý do:</span> {apt.reason}
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <span>({apt.duration_minutes} phút)</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {apt.appointment_type === "online" ? (
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

        {/* Chú thích */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 text-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Chú thích:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
              <span>Đã lên lịch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded"></div>
              <span>Đã hoàn thành</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
              <span>Đã hủy</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-green-600" />
              <span>Khám online</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-orange-600" />
              <span>Khám tại phòng khám</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PatientFrame>
);

}
