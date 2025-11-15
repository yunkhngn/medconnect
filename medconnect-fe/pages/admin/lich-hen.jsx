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
  Chip,
  Select,
  SelectItem,
  Pagination,
} from '@heroui/react';

import { API_BASE_URL } from "@/utils/api";
import { formatSlotTime, getSlotOptions } from "@/utils/appointmentUtils";

const Appointment = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const slotOptions = getSlotOptions();

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
          status: formData.status.toUpperCase(),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Cập nhật lịch hẹn thành công!');
        fetchAppointments();
        resetForm();
        setCurrentAppointment(null);
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
    // When editing, only allow status change
    setFormData({
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      appointmentDate: '',
      slot: '',
      status: appointment.status.toLowerCase(),
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentAppointment(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setCurrentAppointment(null);
    resetForm();
    setIsModalOpen(false);
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Thống kê</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Tổng</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{appointments.length}</p>
          </div>
          <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Chờ</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              {appointments.filter((a) => a.status === 'pending').length}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Xác nhận</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {appointments.filter((a) => a.status === 'confirmed').length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Bộ lọc</h3>
        <div className="space-y-3 sm:space-y-4">
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            size="sm"
            selectedKeys={selectedStatus ? new Set([selectedStatus]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedStatus(value);
            }}
            classNames={{
              trigger: "h-10 sm:h-12",
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
            size="sm"
            selectedKeys={selectedPatient ? new Set([selectedPatient]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedPatient(value);
            }}
            classNames={{
              trigger: "h-10 sm:h-12",
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
            size="sm"
            selectedKeys={selectedDoctor ? new Set([selectedDoctor]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedDoctor(value);
            }}
            classNames={{
              trigger: "h-10 sm:h-12",
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
            size="sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            placeholder="Chọn ngày"
            variant="bordered"
            classNames={{
              inputWrapper: "h-10 sm:h-12 focus-within:border-primary focus-within:ring-0"
            }}
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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <Input
          placeholder="Tìm kiếm lịch hẹn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-xs"
          size="sm"
          variant="bordered"
          classNames={{
            inputWrapper: "focus-within:border-primary focus-within:ring-0"
          }}
          startContent={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <Button 
          color="primary" 
          onPress={handleAdd}
          size="sm"
          className="w-full sm:w-auto"
        >
          <span className="hidden sm:inline">+ Thêm Lịch Hẹn</span>
          <span className="sm:hidden">+ Thêm</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table 
          aria-label="Appointments table"
          removeWrapper
          classNames={{
            wrapper: "min-h-[200px]",
            th: "text-xs sm:text-sm",
            td: "text-xs sm:text-sm",
          }}
        >
          <TableHeader>
            <TableColumn className="min-w-[120px]">BỆNH NHÂN</TableColumn>
            <TableColumn className="min-w-[120px] hidden md:table-cell">BÁC SĨ</TableColumn>
            <TableColumn className="min-w-[120px]">NGÀY & GIỜ</TableColumn>
            <TableColumn className="min-w-[100px] hidden lg:table-cell">BẮT ĐẦU VIDEO</TableColumn>
            <TableColumn className="min-w-[100px] hidden lg:table-cell">KẾT THÚC VIDEO</TableColumn>
            <TableColumn className="min-w-[100px]">TRẠNG THÁI</TableColumn>
            <TableColumn className="min-w-[80px]">THAO TÁC</TableColumn>
          </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{appointment.patientName}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">ID: {appointment.patientId}</p>
                  <div className="sm:hidden space-y-1 mt-1">
                    <p className="text-xs text-gray-500">BS: {appointment.doctorName}</p>
                    <Chip color={getStatusColor(appointment.status?.toLowerCase())} size="sm" variant="flat" className="text-xs">
                      {statusOptions.find((s) => s.value === appointment.status?.toLowerCase())?.label || appointment.status || 'N/A'}
                    </Chip>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{appointment.doctorName}</p>
                  <p className="text-xs text-gray-500">ID: {appointment.doctorId}</p>
                </div>
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                <div>
                  <p className="font-medium">
                    {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-blue-600">
                    {appointment.slotTime || formatSlotTime(appointment.slot)}
                  </p>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="text-xs">
                  {appointment.videoCallStart ? new Date(appointment.videoCallStart).toLocaleString('vi-VN') : '—'}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="text-xs">
                  {appointment.videoCallEnd ? new Date(appointment.videoCallEnd).toLocaleString('vi-VN') : '—'}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Chip color={getStatusColor(appointment.status?.toLowerCase())} size="sm" variant="flat" className="text-xs">
                  {statusOptions.find((s) => s.value === appointment.status?.toLowerCase())?.label || appointment.status || 'N/A'}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  <Button size="sm" variant="light" onPress={() => handleEdit(appointment)} className="text-xs min-w-[60px]">
                    <span className="hidden sm:inline">Sửa</span>
                    <span className="sm:hidden">S</span>
                  </Button>
                  {appointment.status === 'pending' && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => updateStatus(appointment.id, 'confirmed')}
                      className="text-xs min-w-[60px]"
                    >
                      <span className="hidden sm:inline">Xác nhận</span>
                      <span className="sm:hidden">OK</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => deleteAppointment(appointment.id)}
                    className="text-xs min-w-[60px]"
                  >
                    <span className="hidden sm:inline">Xóa</span>
                    <span className="sm:hidden">X</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <div className="flex justify-center">
        <Pagination 
          total={pages} 
          page={page} 
          onChange={setPage} 
          showControls
          size="sm"
        />
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

      <Modal 
        isOpen={isModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleModalClose();
          } else {
            setIsModalOpen(true);
          }
        }} 
        size="2xl"
        classNames={{
          base: "max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl",
          header: "text-base sm:text-lg",
          body: "p-4 sm:p-6",
        }}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => {
            return (
            <>
              <ModalHeader>
                {currentAppointment ? 'Chỉnh sửa lịch hẹn' : 'Thêm lịch hẹn mới'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-3 sm:space-y-4">
                  {currentAppointment ? (
                    // Edit mode: Only show status
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <p className="text-sm text-gray-600">Bệnh nhân: <span className="font-medium text-gray-800">{currentAppointment.patientName}</span></p>
                        <p className="text-sm text-gray-600">Bác sĩ: <span className="font-medium text-gray-800">{currentAppointment.doctorName}</span></p>
                        <p className="text-sm text-gray-600">Ngày khám: <span className="font-medium text-gray-800">{new Date(currentAppointment.appointmentDate).toLocaleDateString('vi-VN')}</span></p>
                        <p className="text-sm text-gray-600">Giờ khám: <span className="font-medium text-gray-800">{currentAppointment.slotTime || formatSlotTime(currentAppointment.slot)}</span></p>
                      </div>
                      <Select
                        label="Trạng thái"
                        selectedKeys={new Set([formData.status.toUpperCase()])}
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0];
                          setFormData({ ...formData, status: (selectedValue || 'PENDING').toLowerCase() });
                        }}
                      >
                        {statusOptions.slice(1).map((item) => (
                          <SelectItem 
                            key={item.value.toUpperCase()} 
                            value={item.value.toUpperCase()}
                            textValue={item.label}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </>
                  ) : (
                    // Add mode: Show all fields
                    <>
                      <Select
                        label="Bệnh nhân"
                        placeholder="Chọn bệnh nhân"
                        selectedKeys={formData.patientId ? new Set([formData.patientId.toString()]) : new Set()}
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0];
                          setFormData({ ...formData, patientId: selectedValue || '' });
                        }}
                        variant="bordered"
                        classNames={{
                          trigger: "focus-within:border-primary focus-within:ring-0"
                        }}
                      >
                        {patients.length === 0 ? (
                          <SelectItem key="loading" value="loading" isDisabled>
                            Đang tải...
                          </SelectItem>
                        ) : (
                          patients.map((patient) => {
                            const displayName = `${patient.fullName || patient.name || `Bệnh nhân #${patient.id}`} (ID: ${patient.id})`;
                            return (
                              <SelectItem 
                                key={patient.id.toString()} 
                                value={patient.id.toString()}
                                textValue={displayName}
                              >
                                {displayName}
                              </SelectItem>
                            );
                          })
                        )}
                      </Select>

                      <Select
                        label="Bác sĩ"
                        placeholder="Chọn bác sĩ"
                        selectedKeys={formData.doctorId ? new Set([formData.doctorId.toString()]) : new Set()}
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0];
                          setFormData({ ...formData, doctorId: selectedValue || '', slot: '' }); // Reset slot when doctor changes
                          setAvailableSlots([]); // Clear slots when doctor changes
                          // Fetch available slots if date is also selected
                          if (formData.appointmentDate && selectedValue) {
                            fetchAvailableSlots(parseInt(selectedValue), formData.appointmentDate);
                          }
                        }}
                        variant="bordered"
                        classNames={{
                          trigger: "focus-within:border-primary focus-within:ring-0"
                        }}
                      >
                        {doctors.length === 0 ? (
                          <SelectItem key="loading" value="loading" isDisabled>
                            Đang tải...
                          </SelectItem>
                        ) : (
                          doctors.map((doctor) => {
                            const displayName = `${doctor.name || `Bác sĩ #${doctor.id}`}${doctor.speciality ? ` - ${doctor.speciality}` : ''}`;
                            return (
                              <SelectItem 
                                key={doctor.id.toString()} 
                                value={doctor.id.toString()}
                                textValue={displayName}
                              >
                                {displayName}
                              </SelectItem>
                            );
                          })
                        )}
                      </Select>

                      <Input
                        label="Ngày khám"
                        type="date"
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
                        variant="bordered"
                        classNames={{
                          inputWrapper: "focus-within:border-primary focus-within:ring-0"
                        }}
                      />

                      <Select
                        label="Giờ khám (Slot)"
                        placeholder={isLoadingSlots ? "Đang tải..." : (formData.doctorId && formData.appointmentDate ? "Chọn giờ khám" : "Chọn bác sĩ và ngày trước")}
                        isDisabled={isLoadingSlots || !formData.doctorId || !formData.appointmentDate}
                        selectedKeys={formData.slot ? new Set([formData.slot]) : new Set()}
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0];
                          setFormData({ ...formData, slot: selectedValue || '' });
                        }}
                        variant="bordered"
                        classNames={{
                          trigger: "focus-within:border-primary focus-within:ring-0"
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
                        selectedKeys={new Set([formData.status.toUpperCase()])}
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0];
                          setFormData({ ...formData, status: (selectedValue || 'PENDING').toLowerCase() });
                        }}
                        variant="bordered"
                        classNames={{
                          trigger: "focus-within:border-primary focus-within:ring-0"
                        }}
                      >
                        {statusOptions.slice(1).filter(item => item.value !== 'completed' && item.value !== 'cancelled').map((item) => (
                          <SelectItem 
                            key={item.value.toUpperCase()} 
                            value={item.value.toUpperCase()}
                            textValue={item.label}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleModalClose}>
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    const success = await handleSubmit();
                    if (success) {
                      handleModalClose();
                    }
                  }}
                >
                  {currentAppointment ? 'Cập nhật' : 'Thêm'}
                </Button>
              </ModalFooter>
            </>
            );
          }}
        </ModalContent>
      </Modal>
      </AdminFrame>
    </>
  );
};

export default Appointment;