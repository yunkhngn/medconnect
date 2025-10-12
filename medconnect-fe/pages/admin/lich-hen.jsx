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

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    GET_APPOINTMENTS: '/appointments',
    CREATE_APPOINTMENT: '/appointments',
    UPDATE_APPOINTMENT: (id) => `/appointments/${id}`,
    DELETE_APPOINTMENT: (id) => `/appointments/${id}`,
    UPDATE_STATUS: (id) => `/appointments/${id}/status`,
  },
  // Based on schema: id, patient_id, doctor_id, appointment_date, status, notes, created_at, updated_at
};

const Appointment = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    status: 'pending',
    notes: '',
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', color: 'default' },
    { value: 'pending', label: 'Chờ xác nhận', color: 'warning' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'primary' },
    { value: 'completed', label: 'Hoàn thành', color: 'success' },
    { value: 'cancelled', label: 'Đã hủy', color: 'danger' },
  ];

  // Mock data
  const mockAppointments = [
    {
      id: 1,
      patientId: 101,
      patientName: 'Nguyễn Thị Mai',
      doctorId: 201,
      doctorName: 'BS. Trần Văn A',
      appointmentDate: '2024-01-20T10:00:00',
      status: 'confirmed',
      notes: 'Khám tổng quát',
      createdAt: '2024-01-15T08:00:00',
    },
    {
      id: 2,
      patientId: 102,
      patientName: 'Lê Văn B',
      doctorId: 202,
      doctorName: 'BS. Phạm Thị C',
      appointmentDate: '2024-01-21T14:30:00',
      status: 'pending',
      notes: 'Tái khám',
      createdAt: '2024-01-16T09:30:00',
    },
  ];

  // Mock data for dropdowns
  const [patients, setPatients] = useState([
    { id: 101, name: 'Nguyễn Thị Mai' },
    { id: 102, name: 'Lê Văn B' },
    { id: 103, name: 'Trần Thị C' },
  ]);

  const [doctors, setDoctors] = useState([
    { id: 201, name: 'BS. Trần Văn A', specialization: 'Tim mạch' },
    { id: 202, name: 'BS. Phạm Thị C', specialization: 'Nội khoa' },
    { id: 203, name: 'BS. Lê Văn D', specialization: 'Nhi khoa' },
  ]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchQuery, selectedStatus, appointments]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setAppointments(mockAppointments);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setIsLoading(false);
    }
  };

  const createAppointment = async () => {
    try {
      // TODO: Replace with actual API call
      const newAppointment = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        patientName: 'Mock Patient',
        doctorName: 'Mock Doctor',
      };
      setAppointments([...appointments, newAppointment]);
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const updateAppointment = async () => {
    try {
      // TODO: Replace with actual API call
      setAppointments(
        appointments.map((a) =>
          a.id === currentAppointment.id ? { ...a, ...formData } : a
        )
      );
      resetForm();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;

    try {
      // TODO: Replace with actual API call
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // TODO: Replace with actual API call
      setAppointments(
        appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    setFilteredAppointments(filtered);
  };

  const handleEdit = (appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate.substring(0, 16),
      status: appointment.status,
      notes: appointment.notes,
    });
    onOpen();
  };

  const handleAdd = () => {
    setCurrentAppointment(null);
    resetForm();
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      status: 'pending',
      notes: '',
    });
  };

  const handleSubmit = () => {
    if (currentAppointment) {
      updateAppointment();
    } else {
      createAppointment();
    }
  };

  const paginatedAppointments = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredAppointments.slice(start, end);
  }, [page, filteredAppointments]);

  const pages = Math.ceil(filteredAppointments.length / rowsPerPage);

  const getStatusColor = (status) => {
    return statusOptions.find((s) => s.value === status)?.color || 'default';
  };

  // Left Panel - Stats & Filters
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng lịch hẹn</p>
            <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Chờ xác nhận</p>
            <p className="text-2xl font-bold text-yellow-600">
              {appointments.filter((a) => a.status === 'pending').length}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Đã xác nhận</p>
            <p className="text-2xl font-bold text-green-600">
              {appointments.filter((a) => a.status === 'confirmed').length}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Hoàn thành</p>
            <p className="text-2xl font-bold text-purple-600">
              {appointments.filter((a) => a.status === 'completed').length}
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
          placeholder="Tìm kiếm lịch hẹn..."
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
          + Thêm Lịch Hẹn
        </Button>
      </div>

      <Table aria-label="Appointments table">
        <TableHeader>
          <TableColumn>BỆNH NHÂN</TableColumn>
          <TableColumn>BÁC SĨ</TableColumn>
          <TableColumn>NGÀY GIỜ</TableColumn>
          <TableColumn>GHI CHÚ</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{appointment.patientName}</p>
                  <p className="text-xs text-gray-500">ID: {appointment.patientId}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{appointment.doctorName}</p>
                  <p className="text-xs text-gray-500">ID: {appointment.doctorId}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">
                    {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(appointment.appointmentDate).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm text-gray-600 max-w-xs truncate">
                  {appointment.notes || '---'}
                </p>
              </TableCell>
              <TableCell>
                <Chip color={getStatusColor(appointment.status)} size="sm">
                  {statusOptions.find((s) => s.value === appointment.status)?.label}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="light" onPress={() => handleEdit(appointment)}>
                    Sửa
                  </Button>
                  {appointment.status === 'pending' && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => updateStatus(appointment.id, 'confirmed')}
                    >
                      Xác nhận
                    </Button>
                  )}
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => deleteAppointment(appointment.id)}
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

  // Add/Edit Modal
  return (
    <AdminFrame title="Quản Lý Lịch Hẹn">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {currentAppointment ? 'Chỉnh sửa lịch hẹn' : 'Thêm lịch hẹn mới'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Bệnh nhân"
                    placeholder="Chọn bệnh nhân"
                    selectedKeys={formData.patientId ? [formData.patientId.toString()] : []}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  >
                    {patients.map((patient) => (
                      <SelectItem key={patient.id.toString()} value={patient.id.toString()}>
                        {patient.name} (ID: {patient.id})
                      </SelectItem>
                    ))}
                  </Select>

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
                    label="Ngày giờ hẹn"
                    type="datetime-local"
                    value={formData.appointmentDate}
                    onChange={(e) =>
                      setFormData({ ...formData, appointmentDate: e.target.value })
                    }
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
                  <Textarea
                    label="Ghi chú"
                    placeholder="Nhập ghi chú về lịch hẹn..."
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
                  {currentAppointment ? 'Cập nhật' : 'Thêm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminFrame>
  );
};

export default Appointment;