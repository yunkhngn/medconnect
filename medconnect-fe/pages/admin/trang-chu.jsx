import React, { useState, useEffect } from 'react';
import { AdminFrame } from '@/components/layouts/';
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

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    GET_STATS: '/dashboard/stats',
    GET_RECENT_APPOINTMENTS: '/dashboard/appointments/recent',
    GET_REVENUE: '/dashboard/revenue',
  },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  });

  const [recentAppointments, setRecentAppointments] = useState([]);

  // Mock data
  useEffect(() => {
    // TODO: Replace with actual API calls
    setStats({
      totalDoctors: 25,
      totalPatients: 1250,
      totalAppointments: 3420,
      totalRevenue: 85000000,
      pendingAppointments: 42,
      completedAppointments: 3200,
    });

    setRecentAppointments([
      {
        id: 1,
        patientName: 'Nguyễn Thị Mai',
        doctorName: 'BS. Trần Văn A',
        date: '2024-01-20 10:00',
        status: 'confirmed',
      },
      {
        id: 2,
        patientName: 'Lê Văn B',
        doctorName: 'BS. Phạm Thị C',
        date: '2024-01-20 14:00',
        status: 'pending',
      },
      {
        id: 3,
        patientName: 'Trần Thị D',
        doctorName: 'BS. Lê Văn E',
        date: '2024-01-21 09:00',
        status: 'completed',
      },
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  return (
    <AdminFrame title="Dashboard">
      <div className="mt-6 space-y-6">
        {/* Welcome Header */}
        <div className="mb-6">
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
                    {(stats.totalRevenue / 1000000).toFixed(1)}M
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

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Appointments */}
          <Card className="lg:col-span-2 p-2">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Lịch hẹn gần đây</h3>
              <Button size="sm" variant="light" color="primary">
                Xem tất cả
              </Button>
            </CardHeader>
            <CardBody>
              <Table removeWrapper aria-label="Recent appointments">
                <TableHeader>
                  <TableColumn>BỆNH NHÂN</TableColumn>
                  <TableColumn>BÁC SĨ</TableColumn>
                  <TableColumn>NGÀY GIỜ</TableColumn>
                  <TableColumn>TRẠNG THÁI</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.patientName}</TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell className="text-sm">{appointment.date}</TableCell>
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Thao tác nhanh</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button
                fullWidth
                color="primary"
                variant="flat"
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
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Tạo báo cáo
              </Button>
              <Button
                fullWidth
                color="warning"
                variant="flat"
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                Cài đặt hệ thống
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="p-6">
              <h4 className="text-sm text-gray-600 mb-2">Tỷ lệ hoàn thành</h4>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)}%
                </p>
                <span className="text-xs text-green-600 mb-1">↑ 3.2%</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(stats.completedAppointments / stats.totalAppointments) * 100}%`,
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
                  {(stats.totalRevenue / 30 / 1000).toFixed(0)}K
                </p>
                <span className="text-xs text-green-600 mb-1">VNĐ</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminFrame>
  );
};

export default AdminDashboard;