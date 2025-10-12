import React, { useState, useEffect } from 'react';
import { AdminFrame, Grid } from '@/components/layouts/';
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
  Pagination,
} from '@heroui/react';

// API Configuration - Based on schema: id, appointment_id, amount, status, transaction_id, created_at
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    GET_PAYMENTS: '/payments',
    CREATE_PAYMENT: '/payments',
    UPDATE_PAYMENT: (id) => `/payments/${id}`,
    DELETE_PAYMENT: (id) => `/payments/${id}`,
    UPDATE_STATUS: (id) => `/payments/${id}/status`,
  },
};

const Payment = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    appointmentId: '',
    amount: '',
    status: 'pending',
    transactionId: '',
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', color: 'default' },
    { value: 'pending', label: 'Chờ thanh toán', color: 'warning' },
    { value: 'completed', label: 'Đã thanh toán', color: 'success' },
    { value: 'failed', label: 'Thất bại', color: 'danger' },
    { value: 'refunded', label: 'Đã hoàn tiền', color: 'secondary' },
  ];

  // Mock data
  const mockPayments = [
    {
      id: 1,
      appointmentId: 1001,
      patientName: 'Nguyễn Thị Mai',
      doctorName: 'BS. Trần Văn A',
      amount: 300000,
      status: 'completed',
      transactionId: 'TXN-20240115-001',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: 2,
      appointmentId: 1002,
      patientName: 'Lê Văn B',
      doctorName: 'BS. Phạm Thị C',
      amount: 250000,
      status: 'pending',
      transactionId: 'TXN-20240116-002',
      createdAt: '2024-01-16T14:20:00',
    },
  ];

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchQuery, selectedStatus, payments]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setPayments(mockPayments);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setIsLoading(false);
    }
  };

  const createPayment = async () => {
    try {
      // TODO: Replace with actual API call
      const newPayment = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        patientName: 'Mock Patient',
        doctorName: 'Mock Doctor',
      };
      setPayments([...payments, newPayment]);
      resetForm();
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const updatePayment = async () => {
    try {
      // TODO: Replace with actual API call
      setPayments(
        payments.map((p) =>
          p.id === currentPayment.id ? { ...p, ...formData } : p
        )
      );
      resetForm();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const deletePayment = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;

    try {
      // TODO: Replace with actual API call
      setPayments(payments.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // TODO: Replace with actual API call
      setPayments(
        payments.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    setFilteredPayments(filtered);
  };

  const handleEdit = (payment) => {
    setCurrentPayment(payment);
    setFormData({
      appointmentId: payment.appointmentId,
      amount: payment.amount,
      status: payment.status,
      transactionId: payment.transactionId,
    });
    onOpen();
  };

  const handleAdd = () => {
    setCurrentPayment(null);
    resetForm();
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      appointmentId: '',
      amount: '',
      status: 'pending',
      transactionId: '',
    });
  };

  const handleSubmit = () => {
    if (currentPayment) {
      updatePayment();
    } else {
      createPayment();
    }
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
              {calculateTotal('completed').toLocaleString()}đ
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
        <Button color="primary" onPress={handleAdd}>
          + Thêm Giao Dịch
        </Button>
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
                  {payment.transactionId}
                </Chip>
              </TableCell>
              <TableCell>
                <p className="text-sm text-gray-600">#{payment.appointmentId}</p>
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
                  <Button size="sm" variant="light" onPress={() => handleEdit(payment)}>
                    Sửa
                  </Button>
                  {payment.status === 'pending' && (
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      onPress={() => updateStatus(payment.id, 'completed')}
                    >
                      Xác nhận
                    </Button>
                  )}
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => deletePayment(payment.id)}
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
    <AdminFrame title="Quản Lý Thanh Toán">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {currentPayment ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Appointment ID"
                    type="number"
                    placeholder="1001"
                    value={formData.appointmentId}
                    onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                  />
                  <Input
                    label="Số tiền"
                    type="number"
                    placeholder="300000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    endContent={<span className="text-gray-400">VNĐ</span>}
                  />
                  <Input
                    label="Mã giao dịch"
                    placeholder="TXN-20240115-001"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  />
                  <Select
                    label="Trạng thái"
                    selectedKeys={[formData.status]}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {statusOptions.slice(1).map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleSubmit();
                    onClose();
                  }}
                >
                  {currentPayment ? 'Cập nhật' : 'Thêm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminFrame>
  );
};

export default Payment;