"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity,
  Video,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  Divider,
  Progress
} from "@heroui/react";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import { auth } from "@/lib/firebase";
import { ToastNotification } from "@/components/ui";
import { useToast } from "@/hooks";

export default function DoctorDashboard() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    monthPatients: 0,
    completedToday: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);

  // Listen to Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchDashboardData(firebaseUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async (firebaseUser) => {
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      
      // Fetch appointments for last 7 days and next 30 days
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // 7 days ago
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 30); // 30 days ahead
      
      const url = new URL("http://localhost:8080/api/appointments/doctor");
      url.searchParams.append("startDate", startDate.toISOString().split('T')[0]);
      url.searchParams.append("endDate", endDate.toISOString().split('T')[0]);
      
      console.log("[Dashboard] Fetching appointments from:", url.toString());
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[Dashboard] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Dashboard] Error response:", errorText);
        throw new Error(`Failed to fetch appointments: ${response.status} - ${errorText}`);
      }

      const appointments = await response.json();
      console.log("[Dashboard] Fetched appointments:", appointments.length);
      
      // Process data
      processAppointments(appointments);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const processAppointments = (appointments) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter appointments
    const todayAppts = appointments.filter(apt => {
      const aptDate = new Date(apt.date); // Backend returns 'date', not 'appointmentDate'
      return aptDate.toDateString() === today.toDateString();
    });

    const weekAppts = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= thisWeekStart && aptDate <= now;
    });

    const monthAppts = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= thisMonthStart && aptDate <= now;
    });

    const completedToday = todayAppts.filter(apt => apt.status === "COMPLETED").length;

    // Get unique patients this month (patient is an object with firebaseUid)
    const uniquePatients = new Set(monthAppts.map(apt => apt.patient?.firebaseUid).filter(Boolean)).size;

    // Update stats
    setStats({
      todayAppointments: todayAppts.length,
      weekAppointments: weekAppts.length,
      monthPatients: uniquePatients,
      completedToday: completedToday
    });

    // Today's appointments (sorted by slot)
    setTodayAppointments(todayAppts.sort((a, b) => a.slot.localeCompare(b.slot)));

    // Upcoming appointments (next 5 days, excluding today)
    const upcoming = appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate > today && aptDate <= new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    setUpcomingAppointments(upcoming);

    // Weekly stats for chart (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayAppts = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === date.toDateString();
      });
      last7Days.push({
        day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        date: date.getDate(),
        count: dayAppts.length,
        completed: dayAppts.filter(apt => apt.status === "COMPLETED").length
      });
    }
    setWeeklyStats(last7Days);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED": return "primary";
      case "COMPLETED": return "success";
      case "CANCELLED": return "danger";
      case "PENDING": return "warning";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED": return "Đã xác nhận";
      case "COMPLETED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      case "PENDING": return "Chờ xác nhận";
      default: return status;
    }
  };

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

  if (loading) {
    return (
      <DoctorFrame title="Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </DoctorFrame>
    );
  }

  if (!user) {
    return (
      <DoctorFrame title="Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardBody className="text-center py-10">
              <AlertCircle size={48} className="mx-auto text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chưa đăng nhập</h3>
              <p className="text-gray-600">Vui lòng đăng nhập để xem dashboard</p>
            </CardBody>
          </Card>
        </div>
      </DoctorFrame>
    );
  }

  const maxWeeklyCount = Math.max(...weeklyStats.map(s => s.count), 1);

  return (
    <DoctorFrame title="Dashboard">
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
          <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Chào mừng bạn quay trở lại! Đây là tổng quan về hoạt động của bạn.
          </p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Appointments */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Calendar className="text-teal-600" size={24} />
                </div>
                <Chip size="sm" color="primary" variant="flat">
                  Hôm nay
                </Chip>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.todayAppointments}
              </h3>
              <p className="text-sm text-gray-600">Lịch hẹn hôm nay</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Đã hoàn thành: <span className="font-semibold text-teal-600">{stats.completedToday}</span>
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Week's Appointments */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="text-blue-600" size={24} />
                </div>
                <Chip size="sm" color="primary" variant="flat">
                  Tuần này
                </Chip>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.weekAppointments}
              </h3>
              <p className="text-sm text-gray-600">Lịch hẹn tuần này</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Progress 
                  value={(stats.completedToday / Math.max(stats.todayAppointments, 1)) * 100} 
                  color="primary" 
                  size="sm"
                  className="mb-1"
                />
                <p className="text-xs text-gray-500">
                  {stats.completedToday}/{stats.todayAppointments} hoàn thành
                </p>
            </div>
            </CardBody>
          </Card>

          {/* Month's Patients */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="text-purple-600" size={24} />
                </div>
                <Chip size="sm" color="secondary" variant="flat">
                  Tháng này
                </Chip>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.monthPatients}
              </h3>
              <p className="text-sm text-gray-600">Bệnh nhân trong tháng</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-teal-600 flex items-center gap-1">
                  <TrendingUp size={12} />
                  Tổng số bệnh nhân khám
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Completion Rate */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <Chip size="sm" color="success" variant="flat">
                  Hiệu suất
                </Chip>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.todayAppointments > 0 
                  ? Math.round((stats.completedToday / stats.todayAppointments) * 100)
                  : 0}%
              </h3>
              <p className="text-sm text-gray-600">Tỷ lệ hoàn thành hôm nay</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Progress 
                  value={stats.todayAppointments > 0 
                    ? (stats.completedToday / stats.todayAppointments) * 100 
                    : 0} 
                  color="success" 
                  size="sm"
                />
              </div>
            </CardBody>
          </Card>
            </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Chart */}
            <Card className="shadow-md">
              <CardHeader className="flex justify-between items-center pb-0">
            <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thống kê lịch hẹn 7 ngày gần đây
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tổng quan hoạt động tuần qua
                  </p>
                </div>
              </CardHeader>
              <Divider className="my-4" />
              <CardBody>
                <div className="flex items-end justify-between h-64 gap-3">
                  {weeklyStats.map((stat, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                        <div className="text-xs font-semibold text-teal-600 mb-1">
                          {stat.count}
                        </div>
                        <div
                          className="w-full rounded-t-lg transition-all bg-gradient-to-t from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 cursor-pointer"
                          style={{ height: `${(stat.count / maxWeeklyCount) * 100}%`, minHeight: stat.count > 0 ? '8px' : '0' }}
                          title={`${stat.count} lịch hẹn, ${stat.completed} hoàn thành`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">{stat.day}</p>
                        <p className="text-xs text-gray-400">{stat.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Today's Schedule */}
            <Card className="shadow-md">
              <CardHeader className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={20} className="text-teal-600" />
                    Lịch hẹn hôm nay
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {todayAppointments.length} lịch hẹn
                  </p>
                </div>
                <Chip color="primary" variant="flat">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Chip>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Không có lịch hẹn nào hôm nay</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {todayAppointments.map((apt, index) => (
                      <div 
                        key={apt.appointmentId} 
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-teal-600" />
                                <span className="font-semibold text-gray-900">
                                  {SLOT_TIMES[apt.slot]}
                                </span>
                              </div>
                              <Chip size="sm" color={getStatusColor(apt.status)} variant="flat">
                                {getStatusText(apt.status)}
                              </Chip>
                              {apt.type === "ONLINE" && (
                                <Chip size="sm" color="secondary" variant="flat" startContent={<Video size={12} />}>
                                  Online
                                </Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 mb-1">
                              <User size={14} />
                              <span className="font-medium">{apt.patient?.name || "N/A"}</span>
                            </div>
                            {apt.reason && (
                              <p className="text-sm text-gray-600 flex items-start gap-1 mt-2">
                                <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                <span>{apt.reason}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {apt.type === "ONLINE" && apt.status === "CONFIRMED" && (
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<Video size={16} />}
                              >
                                Tham gia
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<FileText size={16} />}
                            >
                              Chi tiết
                            </Button>
                </div>
              </div>
            </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Upcoming Appointments - 1 column */}
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    Lịch hẹn sắp tới
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    5 ngày tới
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Chưa có lịch hẹn</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {upcomingAppointments.map((apt) => (
                      <div key={apt.appointmentId} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} className="text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(apt.date).toLocaleDateString('vi-VN', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {SLOT_TIMES[apt.slot]}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {apt.patient?.name || "N/A"}
                        </p>
                        <div className="flex gap-2">
                          <Chip size="sm" color={getStatusColor(apt.status)} variant="flat">
                            {getStatusText(apt.status)}
                          </Chip>
                          {apt.type === "ONLINE" && (
                            <Chip size="sm" color="secondary" variant="flat">
                              Online
                            </Chip>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Thao tác nhanh
                </h3>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-3">
                <Button 
                  color="primary" 
                  variant="flat" 
                  fullWidth 
                  startContent={<Calendar size={18} />}
                  onPress={() => window.location.href = '/bac-si/lich-hen'}
                >
                  Xem tất cả lịch hẹn
                </Button>
                <Button 
                  color="secondary" 
                  variant="flat" 
                  fullWidth 
                  startContent={<Clock size={18} />}
                  onPress={() => window.location.href = '/bac-si/lich-lam-viec'}
                >
                  Quản lý lịch làm việc
                </Button>
                <Button 
                  color="default" 
                  variant="flat" 
                  fullWidth 
                  startContent={<User size={18} />}
                  onPress={() => window.location.href = '/bac-si/ho-so'}
                >
                  Cập nhật hồ sơ
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <ToastNotification
        message={toast.toast.message}
        type={toast.toast.type}
        isVisible={toast.toast.isVisible}
        onClose={toast.hideToast}
        duration={toast.toast.duration}
      />
    </DoctorFrame>
  );
}
