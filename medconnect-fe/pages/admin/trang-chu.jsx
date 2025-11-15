import React, { useState, useEffect } from 'react';
import { AdminFrame, Grid } from '@/components/layouts/';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
  Divider,
} from '@heroui/react';
import {
  User,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  FileText,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

import { API_BASE_URL } from "@/utils/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      
      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
        }
      }
      
      // Fetch recent appointments
      const appointmentsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/recent-appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        if (appointmentsData.success && appointmentsData.data) {
          setRecentAppointments(appointmentsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'primary';
      case 'FINISHED':
        return 'success';
      case 'ONGOING':
        return 'secondary';
      case 'CANCELLED':
      case 'DENIED':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'FINISHED':
        return 'Hoàn thành';
      case 'ONGOING':
        return 'Đang khám';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'DENIED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount?.toString() || '0';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <AdminFrame title="Dashboard">
      <Grid
        leftChildren={
          <div className="space-y-4">
            {/* Stats Summary */}
            <Card>
              <CardHeader className="pb-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Activity size={16} className="text-blue-600" />
                  Thống kê
                </h4>
              </CardHeader>
              <CardBody className="space-y-3 pt-0">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-700">Tổng bác sĩ</span>
                  </div>
                  <span className="font-bold text-blue-600">{stats.totalDoctors}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-green-600" />
                    <span className="text-sm text-gray-700">Tổng bệnh nhân</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.totalPatients || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-purple-600" />
                    <span className="text-sm text-gray-700">Tổng lịch hẹn</span>
                  </div>
                  <span className="font-bold text-purple-600">{stats.totalAppointments}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Tỷ lệ hoàn thành</span>
                    <span className="text-xs font-semibold text-green-600">
                      {stats.totalAppointments > 0 
                        ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalAppointments > 0 
                      ? (stats.completedAppointments / stats.totalAppointments) * 100 
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
                <Button
                  color="primary"
                  variant="flat"
                  fullWidth
                  size="sm"
                  onPress={() => window.location.href = '/admin/bac-si'}
                  startContent={<Plus size={16} />}
                >
                  Thêm bác sĩ
                </Button>
                <Button
                  color="secondary"
                  variant="flat"
                  fullWidth
                  size="sm"
                  onPress={() => window.location.href = '/admin/lich-hen'}
                  startContent={<Calendar size={16} />}
                >
                  Quản lý lịch hẹn
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  fullWidth
                  size="sm"
                  onPress={() => {
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  startContent={<FileText size={16} />}
                >
                  Tạo báo cáo
                </Button>
              </CardBody>
            </Card>
            </div>
        }
        rightChildren={
          <div className="space-y-6">
            {/* Welcome Header Banner */}
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardBody className="p-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {getGreeting()}, Admin! 👋
              </h1>
                    <p className="text-blue-100 text-lg">
                Đây là tổng quan về hệ thống MedConnect
              </p>
            </div>
                  <div className="flex gap-3">
                    <Button
                      color="default"
                      variant="flat"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                      onPress={() => window.location.href = '/admin/bac-si'}
                      startContent={<Plus size={18} />}
                    >
                      Thêm bác sĩ
                    </Button>
                    <Button
                      color="default"
                      variant="flat"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                      onPress={() => window.location.href = '/admin/lich-hen'}
                      startContent={<Calendar size={18} />}
                    >
                      Quản lý lịch hẹn
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

        {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Doctors */}
                <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-5">
              <div className="flex items-center justify-between">
                      <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Tổng bác sĩ</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalDoctors}
                  </p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <TrendingUp size={12} />
                          +5% so với tháng trước
                        </p>
                </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                        <User size={28} className="text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Patients */}
                <Card className="border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-5">
              <div className="flex items-center justify-between">
                      <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Tổng bệnh nhân</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalPatients}
                  </p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <TrendingUp size={12} />
                          +12% so với tháng trước
                        </p>
                </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                        <Users size={28} className="text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Appointments */}
                <Card className="border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-5">
              <div className="flex items-center justify-between">
                      <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Tổng lịch hẹn</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalAppointments}
                  </p>
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                          <Clock size={12} />
                    {stats.pendingAppointments} chờ xác nhận
                  </p>
                </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                        <Calendar size={28} className="text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Revenue */}
                <Card className="border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-5">
              <div className="flex items-center justify-between">
                      <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-orange-600">
                          {formatCurrency(stats.totalRevenue)} VNĐ
                  </p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <TrendingUp size={12} />
                          +8% so với tháng trước
                        </p>
                </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                        <DollarSign size={28} className="text-orange-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Appointments Table */}
              <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar size={22} className="text-purple-600" />
                      Lịch hẹn gần đây
                    </h3>
                    <Button 
                      size="sm" 
                      variant="light" 
                      color="primary"
                      endContent={<ArrowRight size={16} />}
                      onPress={() => window.location.href = '/admin/lich-hen'}
                    >
              Xem tất cả
            </Button>
                  </div>
          </CardHeader>
                <CardBody className="p-0">
                  <Table 
                    removeWrapper 
                    aria-label="Recent appointments" 
                    isLoading={isLoading}
                    classNames={{
                      wrapper: "min-h-[200px]",
                    }}
                  >
              <TableHeader>
                <TableColumn>BỆNH NHÂN</TableColumn>
                <TableColumn>BÁC SĨ</TableColumn>
                <TableColumn>NGÀY GIỜ</TableColumn>
                  <TableColumn>TRẠNG THÁI</TableColumn>
                </TableHeader>
                <TableBody emptyContent="Không có dữ liệu">
                  {recentAppointments.map((appointment) => (
                        <TableRow key={appointment.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <span className="font-medium">{appointment.patientName || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-700">{appointment.doctorName || 'N/A'}</span>
                          </TableCell>
                      <TableCell className="text-sm">
                        <div>
                              <p className="font-medium">{appointment.date && new Date(appointment.date).toLocaleDateString('vi-VN')}</p>
                          <p className="text-xs text-gray-500">{appointment.slot}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                            <Chip 
                              size="sm" 
                              color={getStatusColor(appointment.status)}
                              variant="flat"
                            >
                          {getStatusLabel(appointment.status)}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

        {/* Activity Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-green-100 shadow-sm">
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        Tỷ lệ hoàn thành
                      </h4>
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp size={12} />
                        +3.2%
                      </span>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <p className="text-3xl font-bold text-gray-900">
                  {stats.totalAppointments > 0 
                    ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
                    <Progress
                      value={stats.totalAppointments > 0 
                      ? (stats.completedAppointments / stats.totalAppointments) * 100
                        : 0}
                      color="success"
                      className="w-full"
                      classNames={{
                        indicator: "bg-gradient-to-r from-green-500 to-emerald-500",
                  }}
                    />
            </CardBody>
          </Card>

                <Card className="border border-blue-100 shadow-sm">
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Activity size={16} className="text-blue-600" />
                        Bác sĩ hoạt động
                      </h4>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <p className="text-3xl font-bold text-gray-900">
                  {stats.activeDoctors || 0}
                </p>
                      <span className="text-sm text-gray-500 mb-1">/ {stats.totalDoctors}</span>
              </div>
                    <Progress
                      value={stats.totalDoctors > 0 ? ((stats.activeDoctors || 0) / stats.totalDoctors) * 100 : 0}
                      color="primary"
                      className="w-full"
                      classNames={{
                        indicator: "bg-gradient-to-r from-blue-500 to-indigo-500",
                      }}
                    />
            </CardBody>
          </Card>

                <Card className="border border-orange-100 shadow-sm">
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <DollarSign size={16} className="text-orange-600" />
                        Doanh thu TB/ngày
                      </h4>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <p className="text-3xl font-bold text-gray-900">
                  {stats.totalRevenue > 0 && stats.totalAppointments > 0
                          ? formatCurrency(stats.totalRevenue / stats.totalAppointments)
                    : '0'
                        }
                </p>
                <span className="text-xs text-gray-500 mb-1">VNĐ</span>
              </div>
                    <Progress
                      value={stats.totalRevenue > 0 ? 78 : 0}
                      color="warning"
                      className="w-full"
                      classNames={{
                        indicator: "bg-gradient-to-r from-orange-500 to-amber-500",
                      }}
                    />
            </CardBody>
          </Card>
        </div>
          </div>
        }
      />
    </AdminFrame>
  );
};

export default AdminDashboard;