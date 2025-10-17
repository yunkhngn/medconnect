import { useEffect, useState } from "react";
import { Calendar, FileText, Heart, Activity, Clock, TrendingUp } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame"; // sửa path nếu khác

export default function HomePage() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock dữ liệu để hiển thị UI (không backend)
    const todayISO = new Date().toISOString().split("T")[0];

    const mockAppointments = [
      {
        id: "apt1",
        appointment_date: todayISO,
        appointment_time: "09:00:00",
        reason: "Khám tổng quát",
        status: "scheduled",
        doctor: { full_name: "BS. Trần Minh Khoa", specialty: "Nội tổng quát" },
      },
      {
        id: "apt2",
        appointment_date: todayISO,
        appointment_time: "10:30:00",
        reason: "Tái khám định kỳ",
        status: "scheduled",
        doctor: { full_name: "BS. Nguyễn Thu Hà", specialty: "Da liễu" },
      },
      {
        id: "apt3",
        appointment_date: addDaysISO(todayISO, 1),
        appointment_time: "14:00:00",
        reason: "Tư vấn tim mạch",
        status: "scheduled",
        doctor: { full_name: "BS. Lê Hoàng Nam", specialty: "Tim mạch" },
      },
    ];

    const mockRecords = [
      {
        id: "rec1",
        visit_date: addDaysISO(todayISO, -2),
        diagnosis: "Viêm dạ dày",
        treatment: "Thuốc kháng acid, điều chỉnh ăn uống",
        doctor: { full_name: "BS. Phạm Mỹ Dung" },
      },
      {
        id: "rec2",
        visit_date: addDaysISO(todayISO, -7),
        diagnosis: "Viêm họng cấp",
        treatment: "Kháng sinh theo toa, súc họng",
        doctor: { full_name: "BS. Vũ Anh Tuấn" },
      },
      {
        id: "rec3",
        visit_date: addDaysISO(todayISO, -10),
        diagnosis: "Đau cơ do vận động",
        treatment: "Giãn cơ, vật lý trị liệu nhẹ",
        doctor: { full_name: "BS. Trần Quỳnh Mai" },
      },
    ];

    const t = setTimeout(() => {
      setUpcomingAppointments(mockAppointments);
      setRecentRecords(mockRecords);
      setLoading(false);
    }, 300);

    return () => clearTimeout(t);
  }, []);

  const stats = [
    { label: "Lịch hẹn sắp tới", value: upcomingAppointments.length, icon: Calendar, color: "bg-blue-500" },
    { label: "Hồ sơ bệnh án", value: recentRecords.length, icon: FileText, color: "bg-teal-500" },
    { label: "Sức khỏe tổng quan", value: "Tốt", icon: Heart, color: "bg-rose-500" },
    { label: "Chỉ số hoạt động", value: "85%", icon: Activity, color: "bg-orange-500" },
  ];

  if (loading) {
    return (
      <PatientFrame title="Trang chủ">
        <div className="p-6 md:p-8 max-w-7xl mx-auto md:pl-28 lg:pl-32 xl:pl-36">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </PatientFrame>
    );
  }

  return (
    <PatientFrame title="Trang chủ">
      {/* pl để tránh đè sidebar; chỉnh lại con số nếu sidebar khác rộng */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto md:pl-28 lg:pl-32 xl:pl-36">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xin chào, Bệnh nhân</h1>
          <p className="text-gray-600">Chào mừng bạn đến với trang quản lý sức khỏe của mình</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Upcoming appointments + Recent records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Lịch hẹn sắp tới</h2>
              <Calendar className="text-blue-500" size={24} />
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không có lịch hẹn sắp tới</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{appointment.doctor?.full_name}</p>
                        <p className="text-sm text-gray-600">{appointment.doctor?.specialty}</p>
                        <p className="text-sm text-gray-500 mt-2">{appointment.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {toViDate(appointment.appointment_date)}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 justify-end mt-1">
                          <Clock size={14} />
                          {appointment.appointment_time.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent records */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Hồ sơ bệnh án gần đây</h2>
              <FileText className="text-teal-500" size={24} />
            </div>

            {recentRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có hồ sơ bệnh án</p>
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-900">{record.doctor?.full_name}</p>
                      <p className="text-sm text-gray-600">{toViDate(record.visit_date)}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Chẩn đoán:</span> {record.diagnosis || "Không có"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Điều trị:</span> {record.treatment || "Không có"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Promo blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <TrendingUp size={32} className="mb-4" />
            <h3 className="text-lg font-semibold mb-2">Theo dõi sức khỏe</h3>
            <p className="text-blue-100 text-sm mb-4">Cập nhật thông tin sức khỏe định kỳ</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
              Xem chi tiết
            </button>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-sm p-6 text-white">
            <Heart size={32} className="mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chăm sóc sức khỏe</h3>
            <p className="text-teal-100 text-sm mb-4">Lời khuyên và hướng dẫn chăm sóc</p>
            <button className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
              Tìm hiểu thêm
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
            <Activity size={32} className="mb-4" />
            <h3 className="text-lg font-semibold mb-2">Hoạt động thể chất</h3>
            <p className="text-orange-100 text-sm mb-4">Theo dõi hoạt động hàng ngày</p>
            <button className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors">
              Bắt đầu
            </button>
          </div>
        </div>
      </div>
    </PatientFrame>
  );
}

/* ---------- helpers ---------- */
function addDaysISO(iso, days) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
function toViDate(iso) {
  return new Date(iso).toLocaleDateString("vi-VN");
}
