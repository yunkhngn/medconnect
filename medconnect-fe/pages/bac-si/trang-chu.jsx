"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  User,
  Stethoscope,
  Award,
  BarChart3
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  Divider,
  Progress,
  Avatar
} from "@heroui/react";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import { Grid } from "@/components/layouts";
import { auth } from "@/lib/firebase";
import { ToastNotification } from "@/components/ui";
import { useToast, useAvatar } from "@/hooks";

export default function DoctorDashboard() {
  const toast = useToast();
  const { getAvatarUrl } = useAvatar();
  const [user, setUser] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
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
        fetchDoctorInfo(firebaseUser);
        fetchDashboardData(firebaseUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDoctorInfo = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      
      // Fetch doctor profile from backend
      const response = await fetch("http://localhost:8080/doctor/dashboard/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[Dashboard] Doctor info:", data);
        setDoctorInfo(data);
        
        // Set avatar with priority: DB avatar > Gmail photo > placeholder
        const finalAvatarUrl = getAvatarUrl(firebaseUser, data.avatar);
        setAvatarUrl(finalAvatarUrl);
      } else {
        console.error("[Dashboard] Failed to fetch doctor info:", response.status);
      }
    } catch (error) {
      console.error("[Dashboard] Error fetching doctor info:", error);
    }
  };

  const fetchDashboardData = async (firebaseUser) => {
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      
      // Fetch appointments for last 7 days and next 30 days
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 30);
      
      const url = new URL("http://localhost:8080/api/appointments/doctor");
      url.searchParams.append("startDate", startDate.toISOString().split('T')[0]);
      url.searchParams.append("endDate", endDate.toISOString().split('T')[0]);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Dashboard] Failed to fetch appointments:", response.status, errorText);
        
        // If 400 error, it might be because doctor record doesn't exist
        if (response.status === 400) {
          console.warn("[Dashboard] Doctor record may not exist. Setting empty appointments.");
          processAppointments([]);
          return;
        }
        
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const appointments = await response.json();
      console.log("[Dashboard] Fetched appointments:", appointments.length);
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
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayAppts = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
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
    const uniquePatients = new Set(monthAppts.map(apt => apt.patient?.firebaseUid).filter(Boolean)).size;

    setStats({
      todayAppointments: todayAppts.length,
      weekAppointments: weekAppts.length,
      monthPatients: uniquePatients,
      completedToday: completedToday
    });

    setTodayAppointments(todayAppts.sort((a, b) => a.slot.localeCompare(b.slot)));

    const upcoming = appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate > today && aptDate <= new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    setUpcomingAppointments(upcoming);

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

  // Sidebar Content
  const leftPanel = (
    <div className="space-y-4">
      {/* Doctor Info Card */}
      <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
        <CardBody className="text-center p-6">
          <Avatar
            src={avatarUrl}
            name={doctorInfo?.name || user?.displayName || "Doctor"}
            className="w-20 h-20 mx-auto mb-3 border-4 border-white shadow-lg"
            isBordered
          />
          <h3 className="text-lg font-bold mb-1">{doctorInfo?.name || "Bác sĩ"}</h3>
          <p className="text-sm text-teal-50 mb-3">{doctorInfo?.email}</p>
          <Chip size="sm" variant="flat" className="bg-white/20 text-white">
            <Stethoscope size={14} className="inline mr-1" />
            {doctorInfo?.specialization || "Chuyên khoa"}
          </Chip>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-2">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-600" />
            Thống kê nhanh
          </h4>
        </CardHeader>
        <CardBody className="space-y-3 pt-0">
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700">Hôm nay</span>
            </div>
            <span className="font-bold text-blue-600">{stats.todayAppointments}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-purple-600" />
              <span className="text-sm text-gray-700">Tuần này</span>
            </div>
            <span className="font-bold text-purple-600">{stats.weekAppointments}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-green-600" />
              <span className="text-sm text-gray-700">Bệnh nhân</span>
            </div>
            <span className="font-bold text-green-600">{stats.monthPatients}</span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Hoàn thành hôm nay</span>
              <span className="text-xs font-semibold text-teal-600">
                {stats.todayAppointments > 0 
                  ? Math.round((stats.completedToday / stats.todayAppointments) * 100)
                  : 0}%
              </span>
            </div>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <h4 className="text-sm font-semibold text-gray-700">Thao tác nhanh</h4>
        </CardHeader>
        <CardBody className="space-y-2 pt-0">
          <Link href="/bac-si/lich-hen" passHref legacyBehavior>
            <Button 
              as="a"
              color="primary" 
              variant="flat" 
              fullWidth 
              size="sm"
              startContent={<Calendar size={16} />}
            >
              Xem lịch hẹn
            </Button>
          </Link>
          <Link href="/bac-si/lich-lam-viec" passHref legacyBehavior>
            <Button 
              as="a"
              color="secondary" 
              variant="flat" 
              fullWidth 
              size="sm"
              startContent={<Clock size={16} />}
            >
              Lịch làm việc
            </Button>
          </Link>
          <Link href="/bac-si/ho-so" passHref legacyBehavior>
            <Button 
              as="a"
              color="default" 
              variant="flat" 
              fullWidth 
              size="sm"
              startContent={<User size={16} />}
            >
              Hồ sơ cá nhân
            </Button>
          </Link>
        </CardBody>
      </Card>

      {/* Experience Badge */}
      {doctorInfo?.experience_years > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardBody className="text-center p-4">
            <Award size={32} className="mx-auto text-amber-600 mb-2" />
            <p className="text-2xl font-bold text-amber-700">{doctorInfo.experience_years}</p>
            <p className="text-sm text-amber-600">năm kinh nghiệm</p>
          </CardBody>
        </Card>
      )}
    </div>
  );

  // Main Content
  const rightPanel = (
    <div className="space-y-6">
      {/* Header */}
                <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Xin chào, {doctorInfo?.name || "Bác sĩ"}! 👋
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
                </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow border border-teal-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Calendar className="text-teal-600" size={20} />
              </div>
              <Chip size="sm" color="primary" variant="flat">Hôm nay</Chip>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            <p className="text-xs text-gray-600">Lịch hẹn</p>
          </CardBody>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border border-blue-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="text-blue-600" size={20} />
              </div>
              <Chip size="sm" color="primary" variant="flat">Tuần</Chip>
                </div>
            <p className="text-2xl font-bold text-gray-900">{stats.weekAppointments}</p>
            <p className="text-xs text-gray-600">Lịch hẹn</p>
          </CardBody>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border border-purple-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={20} />
              </div>
              <Chip size="sm" color="secondary" variant="flat">Tháng</Chip>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.monthPatients}</p>
            <p className="text-xs text-gray-600">Bệnh nhân</p>
          </CardBody>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border border-green-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <Chip size="sm" color="success" variant="flat">Hiệu suất</Chip>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.todayAppointments > 0 
                ? Math.round((stats.completedToday / stats.todayAppointments) * 100)
                : 0}%
            </p>
            <p className="text-xs text-gray-600">Hoàn thành</p>
          </CardBody>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Biểu đồ 7 ngày</h3>
            <p className="text-sm text-gray-500">Lịch hẹn trong tuần</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyStats.map((stat, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: '150px' }}>
                  <span className="text-xs font-semibold text-teal-600 mb-1">{stat.count}</span>
                  <div
                    className="w-full rounded-t-lg transition-all bg-gradient-to-t from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 cursor-pointer"
                    style={{ height: `${(stat.count / maxWeeklyCount) * 100}%`, minHeight: stat.count > 0 ? '8px' : '0' }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-700">{stat.day}</p>
                  <p className="text-xs text-gray-400">{stat.date}</p>
                </div>
              </div>
            ))}
            </div>
        </CardBody>
      </Card>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="shadow-sm">
          <CardHeader>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-teal-600" />
                Lịch hẹn hôm nay
              </h3>
              <p className="text-sm text-gray-500">{todayAppointments.length} lịch hẹn</p>
                </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-0 max-h-96 overflow-y-auto">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Không có lịch hẹn</p>
              </div>
            ) : (
              <div className="divide-y">
                {todayAppointments.map((apt) => (
                  <div key={apt.appointmentId} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-10 rounded bg-teal-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-teal-600" />
                            <span className="text-sm font-semibold">{SLOT_TIMES[apt.slot]}</span>
                          </div>
                          <div className="flex gap-2">
                            <Chip size="sm" color={getStatusColor(apt.status)} variant="solid" className="font-semibold">
                              {getStatusText(apt.status)}
                            </Chip>
                            {apt.type === "ONLINE" && (
                              <Chip size="sm" color="secondary" variant="flat">Online</Chip>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">{apt.patient?.name || "N/A"}</p>
                      </div>
                    </div>
                    </div>
                  ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="shadow-sm">
          <CardHeader>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Lịch hẹn sắp tới
              </h3>
              <p className="text-sm text-gray-500">5 ngày tới</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-0 max-h-96 overflow-y-auto">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Chưa có lịch hẹn</p>
              </div>
            ) : (
              <div className="divide-y">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.appointmentId} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-10 rounded bg-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-blue-600" />
                            <span className="text-sm font-semibold">
                              {new Date(apt.date).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-sm text-gray-600">• {SLOT_TIMES[apt.slot]}</span>
                          </div>
                          <div className="flex gap-2">
                            <Chip size="sm" color={getStatusColor(apt.status)} variant="solid" className="font-semibold">
                              {getStatusText(apt.status)}
                            </Chip>
                            {apt.type === "ONLINE" && (
                              <Chip size="sm" color="secondary" variant="flat">Online</Chip>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">{apt.patient?.name || "N/A"}</p>
              </div>
            </div>
          </div>
                ))}
        </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );

  return (
    <DoctorFrame title="Dashboard">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
      
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
