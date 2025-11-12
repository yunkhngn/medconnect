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
} from '@heroui/react';

const API_BASE_URL = 'http://localhost:8080/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDoctors: 0,
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

  return (
    <AdminFrame title="Dashboard">
      <Grid
        leftChildren={
          <>
            {/* Stats Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Thống kê</h3>
              
              <div className="space-y-3">
                <Card className="bg-blue-50 border-blue-200">
                  <CardBody className="p-3">
                    <p className="text-xs text-gray-600 mb-1">Tổng bác sĩ</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalDoctors}</p>
                    <p className="text-xs text-green-600 mt-1">+5%</p>
                  </CardBody>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardBody className="p-3">
                    <p className="text-xs text-gray-600 mb-1">Đang hoạt động</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalPatients || 0}</p>
                  </CardBody>
                </Card>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
              
              <div className="space-y-3">
                <Button
                  fullWidth
                  color="primary"
                  variant="flat"
                  onPress={() => window.location.href = '/admin/bac-si'}
                  startContent={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Thêm bác sĩ mới
                </Button>
                <Button
                  fullWidth
                  color="success"
                  variant="flat"
                  onPress={() => {
                    // Export dashboard to PDF
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  startContent={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  Tạo báo cáo
                </Button>
              </div>
            </div>
          </>
        }
        rightChildren={
          <div className="space-y-6">
            {/* Welcome Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chào mừng trở lại, Admin! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Đây là tổng quan về hệ thống MedConnect
              </p>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Doctors */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng bác sĩ</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalDoctors}
                  </p>
                  <p className="text-xs text-green-600 mt-2">+5% so với tháng trước</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Patients */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng bệnh nhân</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalPatients}
                  </p>
                  <p className="text-xs text-green-600 mt-2">+12% so với tháng trước</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Appointments */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng lịch hẹn</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalAppointments}
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    {stats.pendingAppointments} chờ xác nhận
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Revenue */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.totalRevenue >= 1000000 
                      ? `${(stats.totalRevenue / 1000000).toFixed(1)}M`
                      : stats.totalRevenue >= 1000
                      ? `${(stats.totalRevenue / 1000).toFixed(0)}K`
                      : `${stats.totalRevenue || 0}`
                    }
                  </p>
                  <p className="text-xs text-green-600 mt-2">+8% so với tháng trước</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Appointments Table */}
        <Card className="p-2">
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Lịch hẹn gần đây</h3>
            <Button size="sm" variant="light" color="primary">
              Xem tất cả
            </Button>
          </CardHeader>
          <CardBody>
            <Table removeWrapper aria-label="Recent appointments" isLoading={isLoading}>
              <TableHeader>
                <TableColumn>BỆNH NHÂN</TableColumn>
                <TableColumn>BÁC SĨ</TableColumn>
                <TableColumn>NGÀY GIỜ</TableColumn>
                  <TableColumn>TRẠNG THÁI</TableColumn>
                </TableHeader>
                <TableBody emptyContent="Không có dữ liệu">
                  {recentAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.patientName}</TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{appointment.date && new Date(appointment.date).toLocaleDateString('vi-VN')}</p>
                          <p className="text-xs text-gray-500">{appointment.slot}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" color={getStatusColor(appointment.status)}>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="p-6">
              <h4 className="text-sm text-gray-600 mb-2">Tỷ lệ hoàn thành</h4>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAppointments > 0 
                    ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)
                    : '0.0'
                  }%
                </p>
                <span className="text-xs text-green-600 mb-1">↑ 3.2%</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${stats.totalAppointments > 0 
                      ? (stats.completedAppointments / stats.totalAppointments) * 100
                      : 0}%`,
                  }}
                ></div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h4 className="text-sm text-gray-600 mb-2">Bác sĩ hoạt động</h4>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((stats.totalDoctors * 0.92))}
                </p>
                <span className="text-xs text-gray-500 mb-1">/ {stats.totalDoctors}</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h4 className="text-sm text-gray-600 mb-2">Doanh thu trung bình/ngày</h4>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRevenue > 0 && stats.totalAppointments > 0
                    ? (stats.totalRevenue / stats.totalAppointments / 1000).toFixed(0)
                    : '0'
                  }K
                </p>
                <span className="text-xs text-gray-500 mb-1">VNĐ</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ 
                  width: `${stats.totalRevenue > 0 ? '78%' : '0%'}` 
                }}></div>
              </div>
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