import { useEffect, useState } from 'react';
import { Clock, Calendar, User, Globe, MapPin, Filter } from 'lucide-react';
import PatientFrame from "@/components/layouts/Patient/Frame";
import { parseReason, formatReasonForDisplay } from "@/utils/appointmentUtils";

export default function AppointmentHistoryPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const mock = [
      {
        id: "1",
        appointment_date: "2025-10-19",
        appointment_time: "09:00",
        duration_minutes: 30,
        status: "scheduled",
        reason: "Khám tổng quát",
        notes: "Nhịn ăn trước khi xét nghiệm máu.",
        doctor: { full_name: "BS. Trần Minh Khoa", specialty: "Nội tổng quát" },
        appointment_type: "offline", // Khám tại phòng khám
      },
      {
        id: "2",
        appointment_date: "2025-10-20",
        appointment_time: "10:30",
        duration_minutes: 20,
        status: "completed",
        reason: "Tái khám",
        notes: "",
        doctor: { full_name: "BS. Nguyễn Thu Hà", specialty: "Da liễu" },
        appointment_type: "online", // Khám online
      },
      // Thêm các lịch hẹn mẫu khác ở đây
    ];

    setTimeout(() => {
      setAppointments(mock);
      setLoading(false);
    }, 300);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const statusMatch = filterStatus === 'all' || apt.status === filterStatus;
    const typeMatch = filterType === 'all' || apt.appointment_type === filterType;
    return statusMatch && typeMatch;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PatientFrame title="Lịch sử lịch hẹn">
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
        <div className="ml-[150px] mr-8 px-4 w-[calc(100%-200px)]">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lịch sử lịch hẹn</h1>
                <p className="text-gray-600 text-sm md:text-base">Xem tất cả lịch hẹn từ trước đến hiện tại</p>
              </div>
            </div>
          </div>

          {/* Bộ lọc */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình thức khám
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Tổng cộng: <span className="font-semibold text-gray-900">{filteredAppointments.length}</span> lịch hẹn
              </span>
              {(filterStatus !== 'all' || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Appointment List */}
          <div className="space-y-8">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex flex-col items-center justify-center text-white">
                      <div className="text-2xl font-bold">
                        {new Date(appointment.appointment_date).getDate()}
                      </div>
                      <div className="text-xs">
                        Tháng {new Date(appointment.appointment_date).getMonth() + 1}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={18} className="text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.doctor?.full_name}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-2">{appointment.doctor?.specialty}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {appointment.appointment_time} - {appointment.duration_minutes} phút
                        </span>
                        <span className="flex items-center gap-1">
                          {appointment.appointment_type === 'online' ? (
                            <>
                              <Globe size={16} className="text-green-600" />
                              <span className="text-green-700 font-medium">Online</span>
                            </>
                          ) : (
                            <>
                              <MapPin size={16} className="text-blue-600" />
                              <span className="text-blue-700 font-medium">Offline</span>
                            </>
                          )}
                        </span>
                      </div>

                      {appointment.reason && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Lý do khám: </span>
                          <span className="text-sm text-gray-600 whitespace-pre-line">{formatReasonForDisplay(appointment.reason)}</span>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Ghi chú: </span>
                          <span className="text-sm text-gray-600">{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PatientFrame>
  );
}
