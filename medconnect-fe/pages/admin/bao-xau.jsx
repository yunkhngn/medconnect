import React, { useState, useEffect } from 'react';
import { AdminFrame, Grid } from '@/components/layouts/';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import ToastNotification from '@/components/ui/ToastNotification';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Select,
  SelectItem,
  Card,
  CardBody,
  Pagination,
  Textarea,
} from '@heroui/react';
import { Flag, Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

import { getApiUrl } from "@/utils/api";
const API_BASE_URL = getApiUrl();

const ReportManagement = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    filterReports();
  }, [searchQuery, statusFilter, reports]);

  const fetchReports = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setReports(data.data);
        } else {
          toast.error(data.message || 'Không thể tải danh sách báo xấu');
          setReports([]);
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Không thể tải danh sách báo xấu');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Search by patient name, doctor name, or reason
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          (r.patientName && r.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (r.doctorName && r.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (r.reason && r.reason.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    setFilteredReports(filtered);
  };

  const updateReportStatus = async (reportId, newStatus) => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Cập nhật trạng thái thành công!');
        fetchReports();
      } else {
        toast.error(data.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const deleteReport = async (reportId) => {
    if (!confirm('Bạn có chắc muốn xóa báo xấu này?')) return;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Xóa báo xấu thành công!');
        fetchReports();
      } else {
        toast.error(data.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Lỗi khi xóa báo xấu');
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    onOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'REVIEWED': return 'primary';
      case 'RESOLVED': return 'success';
      case 'DISMISSED': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'REVIEWED': return 'Đã xem xét';
      case 'RESOLVED': return 'Đã giải quyết';
      case 'DISMISSED': return 'Đã bỏ qua';
      default: return status;
    }
  };

  const paginatedReports = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredReports.slice(start, end);
  }, [page, filteredReports]);

  const pages = Math.ceil(filteredReports.length / rowsPerPage);

  // Left Panel - Stats & Filters
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng báo xấu</p>
            <p className="text-2xl font-bold text-red-600">{reports.length}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Chờ xử lý</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reports.filter((r) => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Đã xem xét</p>
            <p className="text-2xl font-bold text-blue-600">
              {reports.filter((r) => r.status === 'REVIEWED').length}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Đã giải quyết</p>
            <p className="text-2xl font-bold text-green-600">
              {reports.filter((r) => r.status === 'RESOLVED').length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>
        <div className="space-y-4">
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            selectedKeys={statusFilter ? new Set([statusFilter]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setStatusFilter(value);
            }}
          >
            <SelectItem key="all" value="all">
              Tất cả
            </SelectItem>
            <SelectItem key="PENDING" value="PENDING">
              Chờ xử lý
            </SelectItem>
            <SelectItem key="REVIEWED" value="REVIEWED">
              Đã xem xét
            </SelectItem>
            <SelectItem key="RESOLVED" value="RESOLVED">
              Đã giải quyết
            </SelectItem>
            <SelectItem key="DISMISSED" value="DISMISSED">
              Đã bỏ qua
            </SelectItem>
          </Select>
        </div>
      </div>
    </div>
  );

  // Right Panel - Table
  const rightPanel = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Tìm kiếm báo xấu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
          variant="bordered"
          classNames={{
            inputWrapper: "focus-within:border-primary focus-within:ring-0"
          }}
          startContent={
            <Search className="w-4 h-4" />
          }
        />
      </div>

      <Table aria-label="Reports table">
        <TableHeader>
          <TableColumn>BỆNH NHÂN</TableColumn>
          <TableColumn>BÁC SĨ</TableColumn>
          <TableColumn>LÝ DO</TableColumn>
          <TableColumn>NGÀY TẠO</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedReports.map((report) => (
            <TableRow key={report.reportId}>
              <TableCell>
                <div>
                  <p className="font-medium">{report.patientName || 'N/A'}</p>
                  {report.patientId && (
                    <p className="text-xs text-gray-500">ID: {report.patientId}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{report.doctorName || 'N/A'}</p>
                  {report.doctorId && (
                    <p className="text-xs text-gray-500">ID: {report.doctorId}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm line-clamp-2">{report.reason || 'N/A'}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <Chip color={getStatusColor(report.status)} size="sm">
                  {getStatusLabel(report.status)}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => handleViewReport(report)}
                    startContent={<Eye className="w-4 h-4" />}
                  >
                    Xem
                  </Button>
                  {report.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        onPress={() => updateReportStatus(report.reportId, 'REVIEWED')}
                        startContent={<CheckCircle className="w-4 h-4" />}
                      >
                        Xem xét
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => updateReportStatus(report.reportId, 'DISMISSED')}
                        startContent={<XCircle className="w-4 h-4" />}
                      >
                        Bỏ qua
                      </Button>
                    </>
                  )}
                  {report.status === 'REVIEWED' && (
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      onPress={() => updateReportStatus(report.reportId, 'RESOLVED')}
                      startContent={<CheckCircle className="w-4 h-4" />}
                    >
                      Giải quyết
                    </Button>
                  )}
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => deleteReport(report.reportId)}
                  >
                    Xóa
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        <Pagination total={pages} page={page} onChange={setPage} showControls />
      </div>
    </div>
  );

  return (
    <>
      <ToastNotification
        message={toast.toast.message}
        type={toast.toast.type}
        isVisible={toast.toast.isVisible}
        onClose={toast.hideToast}
        duration={toast.toast.duration}
      />
      <AdminFrame title="Quản Lý Báo Xấu">
        <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

        {/* View Report Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <div className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-red-500" />
                    <span>Chi tiết báo xấu</span>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedReport && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Bệnh nhân</p>
                          <p className="text-base font-semibold">{selectedReport.patientName || 'N/A'}</p>
                          {selectedReport.patientId && (
                            <p className="text-xs text-gray-500">ID: {selectedReport.patientId}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Bác sĩ</p>
                          <p className="text-base font-semibold">{selectedReport.doctorName || 'N/A'}</p>
                          {selectedReport.doctorId && (
                            <p className="text-xs text-gray-500">ID: {selectedReport.doctorId}</p>
                          )}
                        </div>
                      </div>

                      {selectedReport.appointmentId && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Cuộc hẹn</p>
                          <p className="text-base">ID: {selectedReport.appointmentId}</p>
                          {selectedReport.appointmentDate && (
                            <p className="text-xs text-gray-500">
                              Ngày: {new Date(selectedReport.appointmentDate).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Lý do báo xấu</p>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-gray-800 whitespace-pre-line">
                            {selectedReport.reason || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                          <Chip color={getStatusColor(selectedReport.status)} size="sm" className="mt-1">
                            {getStatusLabel(selectedReport.status)}
                          </Chip>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Ngày tạo</p>
                          <p className="text-sm">
                            {selectedReport.createdAt
                              ? new Date(selectedReport.createdAt).toLocaleString('vi-VN')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {selectedReport.reviewedAt && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Ngày xem xét</p>
                          <p className="text-sm">
                            {new Date(selectedReport.reviewedAt).toLocaleString('vi-VN')}
                          </p>
                          {selectedReport.reviewedByName && (
                            <p className="text-xs text-gray-500">
                              Bởi: {selectedReport.reviewedByName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Đóng
                  </Button>
                  {selectedReport && selectedReport.status === 'PENDING' && (
                    <>
                      <Button
                        color="success"
                        onPress={() => {
                          updateReportStatus(selectedReport.reportId, 'REVIEWED');
                          onClose();
                        }}
                      >
                        Đánh dấu đã xem xét
                      </Button>
                      <Button
                        color="danger"
                        variant="flat"
                        onPress={() => {
                          updateReportStatus(selectedReport.reportId, 'DISMISSED');
                          onClose();
                        }}
                      >
                        Bỏ qua
                      </Button>
                    </>
                  )}
                  {selectedReport && selectedReport.status === 'REVIEWED' && (
                    <Button
                      color="success"
                      onPress={() => {
                        updateReportStatus(selectedReport.reportId, 'RESOLVED');
                        onClose();
                      }}
                    >
                      Đánh dấu đã giải quyết
                    </Button>
                  )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </AdminFrame>
    </>
  );
};

export default ReportManagement;

