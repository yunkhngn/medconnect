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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  Spinner,
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
import { useGemini } from '@/hooks/useGemini';
import { formatSlotTime } from '@/utils/appointmentUtils';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { sendMessage: sendGeminiMessage, loading: aiLoading } = useGemini();
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

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

  const generateAIAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    setAiAnalysis('');
    
    try {
      const analysisPrompt = `Phân tích dữ liệu dashboard của hệ thống MedConnect với các thông tin sau:
- Tổng số bác sĩ: ${stats.totalDoctors}
- Bác sĩ hoạt động: ${stats.activeDoctors}
- Tổng số bệnh nhân: ${stats.totalPatients}
- Tổng số lịch hẹn: ${stats.totalAppointments}
- Lịch hẹn chờ xác nhận: ${stats.pendingAppointments}
- Lịch hẹn đã hoàn thành: ${stats.completedAppointments}
- Tổng doanh thu: ${formatCurrency(stats.totalRevenue)}
- Tỷ lệ hoàn thành: ${stats.totalAppointments > 0 ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1) : 0}%

Hãy đưa ra phân tích ngắn gọn về:
1. Tình hình hoạt động của hệ thống
2. Điểm mạnh và điểm cần cải thiện
3. Đề xuất các biện pháp để tăng hiệu quả hoạt động

Lưu ý: Phân tích này chỉ mang tính chất tham khảo và có thể chưa chính xác hoàn toàn.`;

      const response = await sendGeminiMessage(analysisPrompt);
      setAiAnalysis(response);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      setAiAnalysis('Không thể tạo phân tích AI. Vui lòng thử lại sau.');
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const generatePDF = () => {
    if (!hasAcceptedDisclaimer) {
      alert('Vui lòng xác nhận đã đọc và hiểu disclaimer trước khi tải báo cáo.');
      return;
    }

    const completionRate = stats.totalAppointments > 0 
      ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1) 
      : 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Báo Cáo Dashboard - MedConnect</title>
          <style>
            @media print {
              @page { margin: 1cm; }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #3b82f6;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #3b82f6;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .stat-card {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
            }
            .ai-analysis {
              background: #fef3c7;
              border: 2px solid #fbbf24;
              border-radius: 8px;
              padding: 15px;
              margin-top: 20px;
            }
            .ai-analysis h3 {
              color: #92400e;
              margin-top: 0;
            }
            .ai-analysis p {
              color: #78350f;
              white-space: pre-wrap;
            }
            .disclaimer {
              background: #fee2e2;
              border: 2px solid #ef4444;
              border-radius: 8px;
              padding: 15px;
              margin-top: 20px;
            }
            .disclaimer h3 {
              color: #991b1b;
              margin-top: 0;
            }
            .disclaimer p {
              color: #7f1d1d;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background: #f3f4f6;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Báo Cáo Dashboard MedConnect</h1>
            <p>Ngày tạo: ${new Date().toLocaleDateString('vi-VN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div class="section">
            <h2>Thống Kê Tổng Quan</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Tổng số bác sĩ</div>
                <div class="stat-value">${stats.totalDoctors}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Bác sĩ hoạt động</div>
                <div class="stat-value">${stats.activeDoctors}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Tổng số bệnh nhân</div>
                <div class="stat-value">${stats.totalPatients}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Tổng số lịch hẹn</div>
                <div class="stat-value">${stats.totalAppointments}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Lịch hẹn chờ xác nhận</div>
                <div class="stat-value">${stats.pendingAppointments}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Lịch hẹn đã hoàn thành</div>
                <div class="stat-value">${stats.completedAppointments}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Tổng doanh thu</div>
                <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Tỷ lệ hoàn thành</div>
                <div class="stat-value">${completionRate}%</div>
              </div>
            </div>
          </div>

          ${aiAnalysis ? `
          <div class="ai-analysis">
            <h3>📊 Phân Tích AI</h3>
            <p>${aiAnalysis}</p>
          </div>
          ` : ''}

          <div class="disclaimer">
            <h3>⚠️ Lưu Ý Quan Trọng</h3>
            <p>
              <strong>Thông tin từ AI có thể chưa chính xác và chỉ mang tính chất tham khảo.</strong><br>
              Vui lòng xác minh và kiểm tra lại các thông tin trong báo cáo này trước khi đưa ra quyết định quan trọng.
              Phân tích AI được tạo tự động và có thể chứa sai sót.
            </p>
          </div>

          <div class="footer">
            <p>Báo cáo được tạo tự động từ hệ thống MedConnect</p>
            <p>© ${new Date().getFullYear()} MedConnect. Tất cả quyền được bảo lưu.</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.document.title = `bao-cao-medconnect-${new Date().toISOString().split('T')[0]}.pdf`;
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
    setHasAcceptedDisclaimer(false);
    setAiAnalysis('');
  };

  return (
    <>
    <AdminFrame title="Dashboard">
      <Grid
        leftChildren={
          <div className="space-y-3 sm:space-y-4">
            {/* Stats Summary */}
            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Activity size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                  <span>Thống kê</span>
                </h4>
              </CardHeader>
              <CardBody className="space-y-2 sm:space-y-3 pt-0 p-3 sm:p-4">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={14} className="sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 truncate">Tổng bác sĩ</span>
                  </div>
                  <span className="font-bold text-blue-600 text-sm sm:text-base ml-2 flex-shrink-0">{stats.totalDoctors}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users size={14} className="sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 truncate">Tổng bệnh nhân</span>
                  </div>
                  <span className="font-bold text-green-600 text-sm sm:text-base ml-2 flex-shrink-0">{stats.totalPatients || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={14} className="sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 truncate">Tổng lịch hẹn</span>
                  </div>
                  <span className="font-bold text-purple-600 text-sm sm:text-base ml-2 flex-shrink-0">{stats.totalAppointments}</span>
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
              <CardHeader className="pb-2 p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Thao tác nhanh</h4>
              </CardHeader>
              <CardBody className="space-y-2 pt-0 p-3 sm:p-4">
                <Button
                  color="primary"
                  variant="flat"
                  fullWidth
                  size="sm"
                  className="text-xs sm:text-sm"
                  onPress={() => window.location.href = '/admin/bac-si'}
                  startContent={<Plus size={14} className="sm:w-4 sm:h-4" />}
                >
                  <span className="hidden sm:inline">Thêm bác sĩ</span>
                  <span className="sm:hidden">Thêm BS</span>
                </Button>
                <Button
                  color="secondary"
                  variant="flat"
                  fullWidth
                  size="sm"
                  className="text-xs sm:text-sm"
                  onPress={() => window.location.href = '/admin/lich-hen'}
                  startContent={<Calendar size={14} className="sm:w-4 sm:h-4" />}
                >
                  <span className="hidden sm:inline">Quản lý lịch hẹn</span>
                  <span className="sm:hidden">Lịch hẹn</span>
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  fullWidth
                  size="sm"
                  className="text-xs sm:text-sm"
                  onPress={handleOpenReportModal}
                  startContent={<FileText size={14} className="sm:w-4 sm:h-4" />}
                >
                  <span className="hidden sm:inline">Tạo báo cáo</span>
                  <span className="sm:hidden">Báo cáo</span>
                </Button>
              </CardBody>
            </Card>
            </div>
        }
        rightChildren={
          <div className="space-y-6">
            {/* Welcome Header Banner */}
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardBody className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                      {getGreeting()}, Admin! 👋
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base md:text-lg">
                      Đây là tổng quan về hệ thống MedConnect
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                      color="default"
                      variant="flat"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm text-sm sm:text-base"
                      size="sm"
                      onPress={() => window.location.href = '/admin/bac-si'}
                      startContent={<Plus size={16} />}
                    >
                      <span className="hidden sm:inline">Thêm bác sĩ</span>
                      <span className="sm:hidden">Thêm BS</span>
                    </Button>
                    <Button
                      color="default"
                      variant="flat"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm text-sm sm:text-base"
                      size="sm"
                      onPress={() => window.location.href = '/admin/lich-hen'}
                      startContent={<Calendar size={16} />}
                    >
                      <span className="hidden sm:inline">Quản lý lịch hẹn</span>
                      <span className="sm:hidden">Lịch hẹn</span>
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

        {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Doctors */}
                <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Tổng bác sĩ</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {stats.totalDoctors}
                  </p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <TrendingUp size={12} />
                          <span className="hidden sm:inline">+5% so với tháng trước</span>
                          <span className="sm:hidden">+5%</span>
                        </p>
                </div>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                        <User size={24} className="sm:w-7 sm:h-7 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Patients */}
                <Card className="border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Tổng bệnh nhân</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {stats.totalPatients}
                  </p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <TrendingUp size={12} />
                          <span className="hidden sm:inline">+12% so với tháng trước</span>
                          <span className="sm:hidden">+12%</span>
                        </p>
                </div>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                        <Users size={24} className="sm:w-7 sm:h-7 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Appointments */}
                <Card className="border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Tổng lịch hẹn</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {stats.totalAppointments}
                  </p>
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                          <Clock size={12} />
                          <span className="hidden sm:inline">{stats.pendingAppointments} chờ xác nhận</span>
                          <span className="sm:hidden">{stats.pendingAppointments}</span>
                        </p>
                </div>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                        <Calendar size={24} className="sm:w-7 sm:h-7 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Revenue */}
                <Card className="border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Tổng doanh thu</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 break-words">
                          {formatCurrency(stats.totalRevenue)} <span className="text-sm sm:text-base">VNĐ</span>
                  </p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <TrendingUp size={12} />
                          <span className="hidden sm:inline">+8% so với tháng trước</span>
                          <span className="sm:hidden">+8%</span>
                        </p>
                </div>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                        <DollarSign size={24} className="sm:w-7 sm:h-7 text-orange-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Appointments Table */}
              <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar size={20} className="sm:w-6 sm:h-6 text-purple-600" />
                      <span className="whitespace-nowrap">Lịch hẹn gần đây</span>
                    </h3>
                    <Button 
                      size="sm" 
                      variant="light" 
                      color="primary"
                      endContent={<ArrowRight size={14} className="sm:w-4 sm:h-4" />}
                      onPress={() => window.location.href = '/admin/lich-hen'}
                      className="text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Xem tất cả</span>
                      <span className="sm:hidden">Tất cả</span>
                    </Button>
                  </div>
          </CardHeader>
                <CardBody className="p-0 overflow-x-auto">
                  <div className="min-w-full">
                    <Table 
                      removeWrapper 
                      aria-label="Recent appointments" 
                      isLoading={isLoading}
                      classNames={{
                        wrapper: "min-h-[200px]",
                        th: "text-xs sm:text-sm",
                        td: "text-xs sm:text-sm",
                      }}
                    >
                      <TableHeader>
                        <TableColumn className="min-w-[120px]">BỆNH NHÂN</TableColumn>
                        <TableColumn className="min-w-[120px] hidden sm:table-cell">BÁC SĨ</TableColumn>
                        <TableColumn className="min-w-[100px]">NGÀY GIỜ</TableColumn>
                        <TableColumn className="min-w-[100px]">TRẠNG THÁI</TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="Không có dữ liệu">
                        {recentAppointments.map((appointment) => (
                          <TableRow key={appointment.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                <span className="font-medium truncate">{appointment.patientName || 'N/A'}</span>
                              </div>
                              <div className="sm:hidden text-xs text-gray-500 mt-1">
                                BS: {appointment.doctorName || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span className="text-gray-700">{appointment.doctorName || 'N/A'}</span>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <div>
                                <p className="font-medium">{appointment.date && new Date(appointment.date).toLocaleDateString('vi-VN')}</p>
                                <p className="text-xs text-gray-500">{formatSlotTime(appointment.slot)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                size="sm" 
                                color={getStatusColor(appointment.status)}
                                variant="flat"
                                className="text-xs"
                              >
                                {getStatusLabel(appointment.status)}
                              </Chip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
            </CardBody>
          </Card>

        {/* Activity Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Card className="border border-green-100 shadow-sm">
                  <CardBody className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                        <CheckCircle size={14} className="sm:w-4 sm:h-4 text-green-600" />
                        <span className="truncate">Tỷ lệ hoàn thành</span>
                      </h4>
                      <span className="text-xs text-green-600 flex items-center gap-1 flex-shrink-0">
                        <TrendingUp size={12} />
                        <span className="hidden sm:inline">+3.2%</span>
                        <span className="sm:hidden">+3%</span>
                      </span>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
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
                      size="sm"
                      classNames={{
                        indicator: "bg-gradient-to-r from-green-500 to-emerald-500",
                  }}
                    />
            </CardBody>
          </Card>

                <Card className="border border-blue-100 shadow-sm">
                  <CardBody className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Activity size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                        <span className="truncate">Bác sĩ hoạt động</span>
                      </h4>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.activeDoctors || 0}
                </p>
                      <span className="text-xs sm:text-sm text-gray-500 mb-1">/ {stats.totalDoctors}</span>
              </div>
                    <Progress
                      value={stats.totalDoctors > 0 ? ((stats.activeDoctors || 0) / stats.totalDoctors) * 100 : 0}
                      color="primary"
                      className="w-full"
                      size="sm"
                      classNames={{
                        indicator: "bg-gradient-to-r from-blue-500 to-indigo-500",
                      }}
                    />
            </CardBody>
          </Card>

                <Card className="border border-orange-100 shadow-sm sm:col-span-2 lg:col-span-1">
                  <CardBody className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                        <DollarSign size={14} className="sm:w-4 sm:h-4 text-orange-600" />
                        <span className="truncate">Doanh thu TB/ngày</span>
                      </h4>
                    </div>
                    <div className="flex items-end gap-2 mb-3 flex-wrap">
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
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

      {/* Report Generation Modal */}
      <Modal 
        isOpen={isReportModalOpen} 
        onOpenChange={setIsReportModalOpen}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl",
          header: "text-base sm:text-lg",
          body: "p-4 sm:p-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Tạo Báo Cáo PDF</h2>
                <p className="text-sm text-gray-500 font-normal">
                  Tạo báo cáo dashboard với phân tích AI
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {/* Disclaimer */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-2">⚠️ Lưu Ý Quan Trọng</h3>
                        <p className="text-sm text-red-800 mb-3">
                          Thông tin từ AI có thể chưa chính xác và chỉ mang tính chất tham khảo. 
                          Vui lòng xác minh và kiểm tra lại các thông tin trong báo cáo trước khi đưa ra quyết định quan trọng.
                        </p>
                        <Checkbox
                          isSelected={hasAcceptedDisclaimer}
                          onValueChange={setHasAcceptedDisclaimer}
                          size="sm"
                          classNames={{
                            label: "text-sm text-red-900",
                          }}
                        >
                          Tôi đã đọc và hiểu rằng thông tin AI có thể chưa chính xác
                        </Checkbox>
                      </div>
                    </div>
                  </div>

                  {/* Generate AI Analysis Button */}
                  <div>
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={generateAIAnalysis}
                      isLoading={isGeneratingAnalysis}
                      isDisabled={isGeneratingAnalysis}
                      className="w-full"
                      startContent={!isGeneratingAnalysis && <Activity size={16} />}
                    >
                      {isGeneratingAnalysis ? 'Đang phân tích...' : 'Tạo Phân Tích AI'}
                    </Button>
                  </div>

                  {/* AI Analysis Display */}
                  {aiAnalysis && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <Activity size={16} />
                        Phân Tích AI
                      </h3>
                      <div className="text-sm text-yellow-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {aiAnalysis}
                      </div>
                    </div>
                  )}

                  {/* Stats Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Thống Kê Sẽ Được Bao Gồm:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• Tổng bác sĩ: {stats.totalDoctors}</div>
                      <div>• Bác sĩ hoạt động: {stats.activeDoctors}</div>
                      <div>• Tổng bệnh nhân: {stats.totalPatients}</div>
                      <div>• Tổng lịch hẹn: {stats.totalAppointments}</div>
                      <div>• Doanh thu: {formatCurrency(stats.totalRevenue)}</div>
                      <div>• Tỷ lệ hoàn thành: {stats.totalAppointments > 0 ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1) : 0}%</div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                  size="sm"
                >
                  Hủy
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    generatePDF();
                    onClose();
                  }}
                  isDisabled={!hasAcceptedDisclaimer}
                  size="sm"
                  startContent={<FileText size={16} />}
                >
                  Tải PDF
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AdminDashboard;