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
  Textarea,
} from '@heroui/react';

// API Configuration - Based on schema: id, doctor_id, amount, period, status, transaction_id, notes, created_at
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    GET_DOCTOR_PAYMENTS: '/doctor-payments',
    CREATE_DOCTOR_PAYMENT: '/doctor-payments',
    UPDATE_DOCTOR_PAYMENT: (id) => `/doctor-payments/${id}`,
    CONFIRM_PAYMENT: (id) => `/doctor-payments/${id}/confirm`,
    DELETE_DOCTOR_PAYMENT: (id) => `/doctor-payments/${id}`,
  },
};

const DoctorPayment = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onOpenChange: onConfirmOpenChange } = useDisclosure();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    doctorId: '',
    amount: '',
    period: '',
    status: 'pending',
    transactionId: '',
    notes: '',
  });

  const [confirmData, setConfirmData] = useState({
    transactionId: '',
    notes: '',
  });

  const [doctors, setDoctors] = useState([
    { id: 201, name: 'BS. Trần Văn A', specialization: 'Tim mạch' },
    { id: 202, name: 'BS. Phạm Thị C', specialization: 'Nội khoa' },
    { id: 203, name: 'BS. Lê Văn D', specialization: 'Nhi khoa' },
  ]);

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', color: 'default' },
    { value: 'pending', label: 'Chờ xử lý', color: 'warning' },
    { value: 'processing', label: 'Đang xử lý', color: 'primary' },
    { value: 'completed', label: 'Đã chuyển khoản', color: 'success' },
    { value: 'cancelled', label: 'Đã hủy', color: 'danger' },
  ];

  // Mock data
  const mockPayments = [
    {
      id: 1,
      doctorId: 201,
      doctorName: 'BS. Trần Văn A',
      amount: 15000000,
      period: '2024-01',
      status: 'pending',
      transactionId: '',
      notes: 'Thanh toán tháng 01/2024',
      createdAt: '2024-01-15T10:00:00',
      totalAppointments: 50,
    },
    {
      id: 2,
      doctorId: 202,
      doctorName: 'BS. Phạm Thị C',
      amount: 12000000,
      period: '2024-01',
      status: 'completed',
      transactionId: 'TXN-DOC-001',
      notes: 'Đã chuyển khoản',
      createdAt: '2024-01-10T09:00:00',
      totalAppointments: 40,
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
        doctorName: doctors.find(d => d.id === parseInt(formData.doctorId))?.name,
        totalAppointments: 0,
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

  const confirmPayment = async () => {
    try {
      // TODO: Replace with actual API call
      setPayments(
        payments.map((p) =>
          p.id === confirmingPayment.id
            ? {
                ...p,
                status: 'completed',
                transactionId: confirmData.transactionId,
                notes: confirmData.notes,
              }
            : p
        )
      );
      setConfirmingPayment(null);
      setConfirmData({ transactionId: '', notes: '' });
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  const deletePayment = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa khoản thanh toán này?')) return;

    try {
      // TODO: Replace with actual API call
      setPayments(payments.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
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
      doctorId: payment.doctorId,
      amount: payment.amount,
      period: payment.period,
      status: payment.status,
      transactionId: payment.transactionId,
      notes: payment.notes,
    });
    onOpen();
  };

  const handleConfirm = (payment) => {
    setConfirmingPayment(payment);
    setConfirmData({
      transactionId: '',
      notes: `Đã chuyển khoản ${payment.amount.toLocaleString()}đ cho ${payment.doctorName}`,
    });
    onConfirmOpen();
  };

  const handleAdd = () => {
    setCurrentPayment(null);
    resetForm();
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      doctorId: '',
      amount: '',
      period: '',
      status: 'pending',
      transactionId: '',
      notes: '',
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

  // Left Panel
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng chi trả</p>
            <p className="text-2xl font-bold text-blue-600">
              {calculateTotal('all').toLocaleString()}đ
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Chờ xử lý</p>
            <p className="text-2xl font-bold text-yellow-600">
              {calculateTotal('pending').toLocaleString()}đ
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Đã thanh toán</p>
            <p className="text-2xl font-bold text-green-600">
              {calculateTotal('completed').toLocaleString()}đ
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

  // Right Panel
  const rightPanel = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Tìm kiếm thanh toán..."
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
          + Tạo Khoản Chi
        </Button>
      </div>

      <Table aria-label="Doctor payments table">
        <TableHeader>
          <TableColumn>BÁC SĨ</TableColumn>
          <TableColumn>KỲ THANH TOÁN</TableColumn>
          <TableColumn>SỐ LỊCH</TableColumn>
          <TableColumn>SỐ TIỀN</TableColumn>
          <TableColumn>MÃ GIAO DỊCH</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <p className="font-medium">{payment.doctorName}</p>
                <p className="text-xs text-gray-500">ID: {payment.doctorId}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{payment.period}</p>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat">
                  {payment.totalAppointments} lịch
                </Chip>
              </TableCell>
              <TableCell>
                <p className="font-semibold text-primary">
                  {payment.amount.toLocaleString()}đ
                </p>
              </TableCell>
              <TableCell>
                {payment.transactionId ? (
                  <Chip size="sm" variant="flat" color="primary">
                    {payment.transactionId}
                  </Chip>
                ) : (
                  <span className="text-xs text-gray-400">---</span>
                )}
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
                      onPress={() => handleConfirm(payment)}
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
    <AdminFrame title="Thanh Toán Bác Sĩ">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {currentPayment ? 'Chỉnh sửa khoản chi' : 'Tạo khoản chi mới'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Bác sĩ"
                    placeholder="Chọn bác sĩ"
                    selectedKeys={formData.doctorId ? [formData.doctorId.toString()] : []}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  >
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id.toString()} value={doctor.id.toString()}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Kỳ thanh toán"
                    type="month"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  />
                  <Input
                    label="Số tiền"
                    type="number"
                    placeholder="15000000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    endContent={<span className="text-gray-400">VNĐ</span>}
                  />
                  <Textarea
                    label="Ghi chú"
                    placeholder="Thanh toán tháng..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    minRows={3}
                  />
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
                  {currentPayment ? 'Cập nhật' : 'Tạo'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Confirm Payment Modal */}
      <Modal isOpen={isConfirmOpen} onOpenChange={onConfirmOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Xác nhận chuyển khoản
              </ModalHeader>
              <ModalBody>
                {confirmingPayment && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Bác sĩ</p>
                      <p className="font-semibold text-lg">{confirmingPayment.doctorName}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Số tiền</p>
                      <p className="font-bold text-2xl text-green-600">
                        {confirmingPayment.amount.toLocaleString()}đ
                      </p>
                    </div>
                    <Input
                      label="Mã giao dịch"
                      placeholder="TXN-DOC-001"
                      value={confirmData.transactionId}
                      onChange={(e) =>
                        setConfirmData({ ...confirmData, transactionId: e.target.value })
                      }
                      isRequired
                    />
                    <Textarea
                      label="Ghi chú xác nhận"
                      value={confirmData.notes}
                      onChange={(e) =>
                        setConfirmData({ ...confirmData, notes: e.target.value })
                      }
                      minRows={3}
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    confirmPayment();
                    onClose();
                  }}
                  isDisabled={!confirmData.transactionId}
                >
                  Xác nhận đã chuyển
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminFrame>
  );
};

export default DoctorPayment;
