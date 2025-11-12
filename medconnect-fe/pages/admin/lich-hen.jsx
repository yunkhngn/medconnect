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

const API_BASE_URL = 'http://localhost:8080/api';

const Appointment = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    slot: 'SLOT_1',
    status: 'PENDING',
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', color: 'default' },
    { value: 'pending', label: 'Chờ xác nhận', color: 'warning' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'primary' },
    { value: 'cancelled', label: 'Đã hủy', color: 'danger' },
  ];

  const slotOptions = [
    { value: 'SLOT_1', label: '07:30 - 08:00' },
    { value: 'SLOT_2', label: '08:15 - 08:45' },
    { value: 'SLOT_3', label: '09:00 - 09:30' },
    { value: 'SLOT_4', label: '09:45 - 10:15' },
    { value: 'SLOT_5', label: '10:30 - 11:00' },
    { value: 'SLOT_6', label: '11:15 - 11:45' },
    { value: 'SLOT_7', label: '13:00 - 13:30' },
    { value: 'SLOT_8', label: '13:45 - 14:15' },
    { value: 'SLOT_9', label: '14:30 - 15:00' },
    { value: 'SLOT_10', label: '15:15 - 15:45' },
    { value: 'SLOT_11', label: '16:00 - 16:30' },
    { value: 'SLOT_12', label: '16:45 - 17:15' },
  ];

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchPatients();
      fetchDoctors();
    }
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [searchQuery, selectedStatus, selectedPatient, selectedDoctor, selectedDate, appointments]);

  const fetchAppointments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setAppointments(data.data);
      } else {
        toast.error(data.message || 'Không thể tải danh sách lịch hẹn');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Không thể tải danh sách lịch hẹn');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const fetchDoctors = async () => {
    if (!user) return;
    
    try {
      // Public API - không cần token
      const response = await fetch(`${API_BASE_URL}/doctors`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      // Backend trả về array trực tiếp
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Không thể tải danh sách bác sĩ');
      setDoctors([]);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    try {
      // Format date as YYYY-MM-DD for API
      const dateStr = date.includes('/') 
        ? date.split('/').reverse().join('-') // Convert dd/MM/yyyy to yyyy-MM-dd
        : date; // Already in yyyy-MM-dd format
      
      const response = await fetch(
        `${API_BASE_URL}/appointments/doctor/${doctorId}/available-slots?date=${dateStr}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.availableSlots && Array.isArray(data.availableSlots)) {
        setAvailableSlots(data.availableSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const createAppointment = async () => {
    if (!user) return false;
    
    // Validate form
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.slot) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return false;
    }
    
    try {
      const token = await user.getIdToken();
      
      // Format date as dd/MM/yyyy for backend
      const date = new Date(formData.appointmentDate);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      
      const payload = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        appointmentDate: formattedDate,
        slot: formData.slot,
        status: formData.status,
      };
      
      console.log('Creating appointment with payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Tạo lịch hẹn thành công!');
        fetchAppointments();
        resetForm();
        return true;
      } else {
        toast.error(data.message || 'Tạo lịch hẹn thất bại');
        return false;
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Lỗi khi tạo lịch hẹn');
      return false;
    }
  };

    const updateAppointment = async () => {
    if (!user || !currentAppointment) return false;
    
    if (!formData.status) {
      toast.error('Vui lòng chọn trạng thái');
      return false;
    }
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${currentAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: formData.status,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Cập nhật lịch hẹn thành công!');
        fetchAppointments();
        resetForm();
        return true;
      } else {
        toast.error(data.message || 'Cập nhật thất bại');
        return false;
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Lỗi khi cập nhật lịch hẹn');
      return false;
    }
  };

  const deleteAppointment = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Xóa lịch hẹn thành công!');
        fetchAppointments();
      } else {
        toast.error(data.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Lỗi khi xóa lịch hẹn');
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}/status`, {
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
        fetchAppointments();
      } else {
        toast.error(data.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Search by patient or doctor name
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    // Filter by patient
    if (selectedPatient !== 'all') {
      filtered = filtered.filter((a) => a.patientId.toString() === selectedPatient);
    }

    // Filter by doctor
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter((a) => a.doctorId.toString() === selectedDoctor);
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((a) => a.appointmentDate === selectedDate);
    }

    setFilteredAppointments(filtered);
  };

  const handleEdit = (appointment) => {
    setCurrentAppointment(appointment);
    // Convert appointmentDate to yyyy-MM-dd format if needed
    let dateValue = appointment.appointmentDate;
    if (dateValue && dateValue.includes('/')) {
      // Convert dd/MM/yyyy to yyyy-MM-dd
      const parts = dateValue.split('/');
      dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    setFormData({
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      appointmentDate: dateValue,
      slot: appointment.slot,
      status: appointment.status.toUpperCase(),
    });
    // Fetch available slots for editing (though slots might be limited)
    if (appointment.doctorId && dateValue) {
      fetchAvailableSlots(appointment.doctorId, dateValue);
    }
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
      slot: 'SLOT_1',
      status: 'PENDING',
    });
    setAvailableSlots([]);
  };

  const handleSubmit = async () => {
    if (currentAppointment) {
      await updateAppointment();
    } else {
      await createAppointment();
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
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>
        <div className="space-y-4">
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            selectedKeys={selectedStatus ? new Set([selectedStatus]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedStatus(value);
            }}
          >
            {statusOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Bệnh nhân"
            placeholder="Tất cả bệnh nhân"
            selectedKeys={selectedPatient ? new Set([selectedPatient]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedPatient(value);
            }}
          >
            <SelectItem key="all" value="all">
              Tất cả bệnh nhân
            </SelectItem>
            {patients.map((patient) => (
              <SelectItem key={patient.id.toString()} value={patient.id.toString()}>
                {patient.fullName || patient.name}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Bác sĩ"
            placeholder="Tất cả bác sĩ"
            selectedKeys={selectedDoctor ? new Set([selectedDoctor]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedDoctor(value);
            }}
          >
            <SelectItem key="all" value="all">
              Tất cả bác sĩ
            </SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id.toString()} value={doctor.id.toString()}>
                {doctor.name}{doctor.speciality ? ` - ${doctor.speciality}` : ''}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Ngày khám"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            placeholder="Chọn ngày"
          />

          {(selectedPatient !== 'all' || selectedDoctor !== 'all' || selectedDate) && (
            <Button
              color="default"
              variant="flat"
              size="sm"
              className="w-full"
              onPress={() => {
                setSelectedPatient('all');
                setSelectedDoctor('all');
                setSelectedDate('');
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
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
          <TableColumn>NGÀY & GIỜ KHÁM</TableColumn>
          <TableColumn>BẮT ĐẦU VIDEO</TableColumn>
          <TableColumn>KẾT THÚC VIDEO</TableColumn>
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
                  <p className="text-sm font-medium">
                    {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-blue-600">
                    {appointment.slotTime}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  {appointment.videoCallStart ? new Date(appointment.videoCallStart).toLocaleString('vi-VN') : '—'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  {appointment.videoCallEnd ? new Date(appointment.videoCallEnd).toLocaleString('vi-VN') : '—'}
                </div>
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
    <>
      <ToastNotification
        message={toast.toast.message}
        type={toast.toast.type}
        isVisible={toast.toast.isVisible}
        onClose={toast.hideToast}
        duration={toast.toast.duration}
      />
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
                    isDisabled={!!currentAppointment}
                    selectedKeys={formData.patientId ? new Set([formData.patientId.toString()]) : new Set()}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] || '';
                      setFormData({ ...formData, patientId: value });
                    }}
                  >
                    {patients.length === 0 ? (
                      <SelectItem key="loading" value="loading" isDisabled>
                        Đang tải...
                      </SelectItem>
                    ) : (
                      patients.map((patient) => (
                        <SelectItem key={patient.id.toString()} value={patient.id.toString()}>
                          {patient.fullName || patient.name || `Bệnh nhân #${patient.id}`} (ID: {patient.id})
                        </SelectItem>
                      ))
                    )}
                  </Select>

                  <Select
                    label="Bác sĩ"
                    placeholder="Chọn bác sĩ"
                    isDisabled={!!currentAppointment}
                    selectedKeys={formData.doctorId ? new Set([formData.doctorId.toString()]) : new Set()}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] || '';
                      setFormData({ ...formData, doctorId: value, slot: '' }); // Reset slot when doctor changes
                      setAvailableSlots([]); // Clear slots when doctor changes
                      // Fetch available slots if date is also selected
                      if (formData.appointmentDate) {
                        fetchAvailableSlots(parseInt(value), formData.appointmentDate);
                      }
                    }}
                  >
                    {doctors.length === 0 ? (
                      <SelectItem key="loading" value="loading" isDisabled>
                        Đang tải...
                      </SelectItem>
                    ) : (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor.id.toString()} value={doctor.id.toString()}>
                          {doctor.name || `Bác sĩ #${doctor.id}`}{doctor.speciality ? ` - ${doctor.speciality}` : ''}
                        </SelectItem>
                      ))
                    )}
                  </Select>

                  <Input
                    label="Ngày khám"
                    type="date"
                    isDisabled={!!currentAppointment}
                    value={formData.appointmentDate}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      setFormData({ ...formData, appointmentDate: dateValue, slot: '' }); // Reset slot when date changes
                      setAvailableSlots([]); // Clear slots when date changes
                      // Fetch available slots if doctor is also selected
                      if (formData.doctorId) {
                        fetchAvailableSlots(parseInt(formData.doctorId), dateValue);
                      }
                    }}
                  />

                  <Select
                    label="Giờ khám (Slot)"
                    placeholder={isLoadingSlots ? "Đang tải..." : (formData.doctorId && formData.appointmentDate ? "Chọn giờ khám" : "Chọn bác sĩ và ngày trước")}
                    isDisabled={!!currentAppointment || isLoadingSlots || !formData.doctorId || !formData.appointmentDate}
                    selectedKeys={formData.slot ? new Set([formData.slot]) : new Set()}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] || '';
                      setFormData({ ...formData, slot: value });
                    }}
                  >
                    {isLoadingSlots ? (
                      <SelectItem key="loading" value="loading" isDisabled>
                        Đang tải slot...
                      </SelectItem>
                    ) : availableSlots.length === 0 && formData.doctorId && formData.appointmentDate ? (
                      <SelectItem key="no-slots" value="no-slots" isDisabled>
                        Không có slot trống
                      </SelectItem>
                    ) : (
                      availableSlots.map((slotValue) => {
                        const slotOption = slotOptions.find(s => s.value === slotValue);
                        return (
                          <SelectItem key={slotValue} value={slotValue}>
                            {slotOption ? slotOption.label : slotValue}
                          </SelectItem>
                        );
                      })
                    )}
                  </Select>

                  <Select
                    label="Trạng thái"
                    selectedKeys={new Set([formData.status])}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] || 'PENDING';
                      setFormData({ ...formData, status: value });
                    }}
                  >
                    {statusOptions.slice(1).filter(item => item.value !== 'completed').map((item) => (
                      <SelectItem key={item.value.toUpperCase()} value={item.value.toUpperCase()}>
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
                  onPress={async () => {
                    const success = await handleSubmit();
                    if (success) {
                      onClose();
                    }
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
    </>
  );
};

export default Appointment;