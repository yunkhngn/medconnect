import React, { useState, useEffect } from 'react';
import { AdminFrame, Grid } from '@/components/layouts/';
import { useAuth } from '@/contexts/AuthContext';
import ToastNotification from '@/components/ui/ToastNotification';
import { useToast } from '@/hooks/useToast';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Select,
  SelectItem,
  Pagination,
} from '@heroui/react';

const API_BASE_URL = 'http://localhost:8080/api';

const Payment = () => {
  const { user } = useAuth();
  const { toast, showToast, hideToast, success, error } = useToast();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', color: 'default' },
    { value: 'pending', label: 'Chờ thanh toán', color: 'warning' },
    { value: 'paid', label: 'Đã thanh toán', color: 'success' },
    { value: 'failed', label: 'Thất bại', color: 'danger' },
    { value: 'refunded', label: 'Đã hoàn tiền', color: 'secondary' },
  ];

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  useEffect(() => {
    filterPayments();
  }, [searchQuery, selectedStatus, payments]);

  const fetchPayments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setPayments(data.data);
      } else {
        error(data.message || 'Không thể tải danh sách thanh toán');
        setPayments([]);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      error('Không thể tải danh sách thanh toán');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/payments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        success('Cập nhật trạng thái thành công!');
        fetchPayments();
      } else {
        error(data.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      error('Lỗi khi cập nhật trạng thái');
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          (p.transactionId && p.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.patientName && p.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.doctorName && p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    setFilteredPayments(filtered);
  };

  const paginatedPayments = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPayments.slice(start, end);
  }, [page, filteredPayments]);

  const pages = Math.ceil(filteredPayments.length / rowsPerPage);

  const getStatusColor = (status) => {
    return statusOptions.find((s) => s.value === status)?.color || 'default';
  };

  const calculateTotal = (status) => {
    return payments
      .filter((p) => status === 'all' || p.status === status)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  // Left Panel - Stats & Filters
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê doanh thu</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-blue-600">
              {calculateTotal('all').toLocaleString()}đ
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Đã thanh toán</p>
            <p className="text-2xl font-bold text-green-600">
              {calculateTotal('paid').toLocaleString()}đ
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Chờ thanh toán</p>
            <p className="text-2xl font-bold text-yellow-600">
              {calculateTotal('pending').toLocaleString()}đ
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Thất bại</p>
            <p className="text-2xl font-bold text-red-600">
              {calculateTotal('failed').toLocaleString()}đ
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Đã hoàn tiền</p>
            <p className="text-2xl font-bold text-purple-600">
              {calculateTotal('refunded').toLocaleString()}đ
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>
        <Select
          label="Trạng thái"
          placeholder="Chọn trạng thái"
          selectedKeys={selectedStatus ? [selectedStatus] : []}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statusOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );

  // Right Panel - Table
  const rightPanel = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Tìm kiếm giao dịch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
          startContent={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      <Table aria-label="Payments table">
        <TableHeader>
          <TableColumn>MÃ GIAO DỊCH</TableColumn>
          <TableColumn>LỊCH HẸN</TableColumn>
          <TableColumn>BỆNH NHÂN</TableColumn>
          <TableColumn>BÁC SĨ</TableColumn>
          <TableColumn>SỐ TIỀN</TableColumn>
          <TableColumn>NGÀY TẠO</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {payment.transactionId || 'N/A'}
                </Chip>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm text-gray-600">#{payment.appointmentId}</p>
                  <p className="text-xs text-gray-500">
                    {payment.appointmentDate && new Date(payment.appointmentDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">{payment.appointmentSlot}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium text-sm">{payment.patientName}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{payment.doctorName}</p>
              </TableCell>
              <TableCell>
                <p className="font-semibold text-primary">
                  {payment.amount.toLocaleString()}đ
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm">
                  {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(payment.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </TableCell>
              <TableCell>
                <Chip color={getStatusColor(payment.status)} size="sm">
                  {statusOptions.find((s) => s.value === payment.status)?.label}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {payment.status === 'pending' && (
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      onPress={() => updateStatus(payment.id, 'paid')}
                    >
                      Xác nhận thanh toán
                    </Button>
                  )}
                  {payment.status === 'paid' && (
                    <Button
                      size="sm"
                      color="warning"
                      variant="flat"
                      onPress={() => updateStatus(payment.id, 'refunded')}
                    >
                      Hoàn tiền
                    </Button>
                  )}
                  {payment.status === 'pending' && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => updateStatus(payment.id, 'failed')}
                    >
                      Thất bại
                    </Button>
                  )}
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
    <AdminFrame title="Quản Lý Thanh Toán">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
      <ToastNotification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </AdminFrame>
  );
};

export default Payment;