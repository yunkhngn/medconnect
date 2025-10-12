import React, { useState, useEffect } from 'react';
import DoctorFrame from '@/components/layouts/Doctor/Frame';
import { auth } from '@/lib/firebase';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
  Select,
  SelectItem
} from "@nextui-org/react";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      appointmentCode: 'APT001',
      patientName: 'Nguyễn Văn A',
      patientEmail: 'nguyenvana@email.com',
      patientPhone: '0901234567',
      date: '2025-01-15',
      time: '09:00',
      type: 'online',
      status: 'pending',
      reason: 'Khám tổng quát',
      createdAt: '2025-01-10'
    },
    {
      id: 2,
      appointmentCode: 'APT002',
      patientName: 'Trần Thị B',
      patientEmail: 'tranthib@email.com',
      patientPhone: '0902345678',
      date: '2025-01-14',
      time: '10:30',
      type: 'offline',
      status: 'confirmed',
      reason: 'Tái khám',
      createdAt: '2025-01-09'
    },
    {
      id: 3,
      appointmentCode: 'APT003',
      patientName: 'Lê Văn C',
      patientEmail: 'levanc@email.com',
      patientPhone: '0903456789',
      date: '2025-01-13',
      time: '14:00',
      type: 'online',
      status: 'completed',
      reason: 'Tư vấn sức khỏe',
      createdAt: '2025-01-05'
    },
    {
      id: 4,
      appointmentCode: 'APT004',
      patientName: 'Phạm Thị D',
      patientEmail: 'phamthid@email.com',
      patientPhone: '0904567890',
      date: '2025-01-12',
      time: '15:30',
      type: 'offline',
      status: 'cancelled',
      reason: 'Khám bệnh',
      createdAt: '2025-01-08'
    },
    {
      id: 5,
      appointmentCode: 'APT005',
      patientName: 'Hoàng Văn E',
      patientEmail: 'hoangvane@email.com',
      patientPhone: '0905678901',
      date: '2025-01-16',
      time: '08:30',
      type: 'online',
      status: 'pending',
      reason: 'Kiểm tra định kỳ',
      createdAt: '2025-01-11'
    }
  ]);

  const [filteredAppointments, setFilteredAppointments] = useState(appointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAppt, setEditedAppt] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const rowsPerPage = 10;

  const months = [
    { key: '2025-01', label: 'Tháng 1, 2025' },
    { key: '2024-12', label: 'Tháng 12, 2024' },
    { key: '2024-11', label: 'Tháng 11, 2024' },
    { key: '2024-10', label: 'Tháng 10, 2024' }
  ];

  const statusOptions = [
    { key: 'all', label: 'Tất cả trạng thái' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  useEffect(() => {
    filterAppointments();
  }, [searchQuery, selectedMonth, selectedStatus]);

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.appointmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter(apt => apt.date.startsWith(selectedMonth));
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === selectedStatus);
    }

    setFilteredAppointments(filtered);
    setPage(1);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppt(appointment);
    setEditedAppt({ ...appointment });
    setIsEditing(false);
    onOpen();
  };

  const handleEditMode = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedAppt({ ...selectedAppt });
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/doctor/appointments/${selectedAppt.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: editedAppt.date,
          time: editedAppt.time,
          type: editedAppt.type,
          reason: editedAppt.reason
        })
      });

      if (response.ok) {
        setAppointments(prev => prev.map(apt =>
          apt.id === selectedAppt.id ? { ...apt, ...editedAppt } : apt
        ));
        setSelectedAppt({ ...editedAppt });
        setIsEditing(false);
        alert('Cập nhật lịch hẹn thành công!');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Lỗi khi cập nhật lịch hẹn');
    }
  };

  const handleConfirm = async () => {
    if (selectedAppt) {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`/api/doctor/appointments/${selectedAppt.id}/confirm`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setAppointments(prev => prev.map(apt =>
            apt.id === selectedAppt.id ? { ...apt, status: 'confirmed' } : apt
          ));
          onClose();
        }
      } catch (error) {
        console.error('Error confirming appointment:', error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedAppt) {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`/api/doctor/appointments/${selectedAppt.id}/reject`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setAppointments(prev => prev.map(apt =>
            apt.id === selectedAppt.id ? { ...apt, status: 'cancelled' } : apt
          ));
          onClose();
        }
      } catch (error) {
        console.error('Error rejecting appointment:', error);
      }
    }
  };

  const handleViewEMR = (appointment) => {
    window.open(`/doctor/emr/${appointment.patientName}`, '_blank');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'primary',
      completed: 'success',
      cancelled: 'danger'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);

  return (
    <DoctorFrame title="Lịch hẹn">
      <div className="space-y-6">
        {/* Filter Bar */}
        <Card className="shadow-md">
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left side - Date filters */}
              <div className="md:col-span-3">
                <Select
                  label="Tháng/Năm"
                  selectedKeys={[selectedMonth]}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  variant="bordered"
                  size="sm"
                  classNames={{
                    trigger: "min-h-10",
                    value: "text-sm"
                  }}
                >
                  {months.map((month) => (
                    <SelectItem key={month.key} value={month.key}>
                      {month.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="md:col-span-3">
                <Select
                  label="Trạng thái"
                  selectedKeys={[selectedStatus]}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  variant="bordered"
                  size="sm"
                  classNames={{
                    trigger: "min-h-10",
                    value: "text-sm"
                  }}
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Right side - Search */}
              <div className="md:col-span-6">
                <Input
                  label="Tìm kiếm"
                  placeholder="Tìm kiếm bệnh nhân, mã lịch hẹn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="bordered"
                  size="sm"
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "min-h-10"
                  }}
                  startContent={
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  isClearable
                  onClear={() => setSearchQuery('')}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border-l-4 border-warning">
            <CardBody className="p-4">
              <p className="text-sm text-gray-600 mb-1">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-warning">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-sm border-l-4 border-primary">
            <CardBody className="p-4">
              <p className="text-sm text-gray-600 mb-1">Đã xác nhận</p>
              <p className="text-2xl font-bold text-primary">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-sm border-l-4 border-success">
            <CardBody className="p-4">
              <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
              <p className="text-2xl font-bold text-success">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-sm border-l-4 border-danger">
            <CardBody className="p-4">
              <p className="text-sm text-gray-600 mb-1">Đã hủy</p>
              <p className="text-2xl font-bold text-danger">
                {appointments.filter(a => a.status === 'cancelled').length}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Appointments Table */}
        <Card className="shadow-md">
          <CardBody className="p-0">
            <Table
              aria-label="Appointments table"
              bottomContent={
                totalPages > 1 && (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={setPage}
                    />
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn>MÃ LỊCH HẸN</TableColumn>
                <TableColumn>BỆNH NHÂN</TableColumn>
                <TableColumn>NGÀY GIỜ</TableColumn>
                <TableColumn>LOẠI</TableColumn>
                <TableColumn>LÝ DO</TableColumn>
                <TableColumn>TRẠNG THÁI</TableColumn>
                <TableColumn>HÀNH ĐỘNG</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedAppointments.map((apt) => (
                  <TableRow key={apt.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm">{apt.appointmentCode}</p>
                        <p className="text-xs text-gray-500">Đặt: {apt.createdAt}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={apt.patientName[0]}
                          size="sm"
                          className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white"
                        />
                        <div>
                          <p className="font-medium text-sm">{apt.patientName}</p>
                          <p className="text-xs text-gray-500">{apt.patientEmail}</p>
                          <p className="text-xs text-gray-500">{apt.patientPhone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{apt.date}</p>
                        <p className="text-xs text-gray-600">{apt.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={apt.type === 'online' ? 'primary' : 'secondary'}
                        variant="flat"
                        startContent={
                          <span className={`w-2 h-2 rounded-full ${apt.type === 'online' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        }
                      >
                        {apt.type === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{apt.reason}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={getStatusColor(apt.status)} variant="flat">
                        {getStatusLabel(apt.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleViewDetails(apt)}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Appointment Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center justify-between w-full pr-6">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">Chi tiết lịch hẹn</span>
                {selectedAppt && (
                  <Chip color={getStatusColor(selectedAppt.status)}>
                    {getStatusLabel(selectedAppt.status)}
                  </Chip>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && selectedAppt?.status !== 'completed' && selectedAppt?.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                    onPress={handleEditMode}
                  >
                    Sửa
                  </Button>
                )}
                <span className="text-base font-semibold text-primary">{selectedAppt?.appointmentCode}</span>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedAppt && (
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thông tin bệnh nhân
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                      <p className="font-semibold">{selectedAppt.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium">{selectedAppt.patientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                      <p className="font-medium">{selectedAppt.patientPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Info */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Chi tiết lịch hẹn
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Ngày khám</p>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedAppt.date}
                          onChange={(e) => setEditedAppt({ ...editedAppt, date: e.target.value })}
                          size="sm"
                          variant="bordered"
                        />
                      ) : (
                        <p className="font-semibold text-lg">{selectedAppt.date}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Giờ khám</p>
                      {isEditing ? (
                        <Input
                          type="time"
                          value={editedAppt.time}
                          onChange={(e) => setEditedAppt({ ...editedAppt, time: e.target.value })}
                          size="sm"
                          variant="bordered"
                        />
                      ) : (
                        <p className="font-semibold text-lg">{selectedAppt.time}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Loại khám</p>
                      {isEditing ? (
                        <Select
                          selectedKeys={[editedAppt.type]}
                          onChange={(e) => setEditedAppt({ ...editedAppt, type: e.target.value })}
                          size="sm"
                          variant="bordered"
                        >
                          <SelectItem key="online" value="online">Trực tuyến</SelectItem>
                          <SelectItem key="offline" value="offline">Trực tiếp</SelectItem>
                        </Select>
                      ) : (
                        <Chip
                          color={selectedAppt.type === 'online' ? 'primary' : 'secondary'}
                          startContent={<span className="w-2 h-2 bg-green-500 rounded-full" />}
                        >
                          {selectedAppt.type === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                        </Chip>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                      <p className="font-medium">{selectedAppt.createdAt}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Lý do khám</p>
                      {isEditing ? (
                        <Input
                          value={editedAppt.reason}
                          onChange={(e) => setEditedAppt({ ...editedAppt, reason: e.target.value })}
                          size="sm"
                          variant="bordered"
                          placeholder="Nhập lý do khám"
                        />
                      ) : (
                        <p className="font-medium">{selectedAppt.reason}</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedAppt.status === 'pending' && !isEditing && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Lưu ý:</strong> Lịch hẹn này đang chờ xác nhận. Vui lòng xem xét và phản hồi sớm.
                    </p>
                  </div>
                )}

                {isEditing && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Chế độ chỉnh sửa:</strong> Bạn có thể thay đổi thông tin lịch hẹn. Nhấn "Lưu" để cập nhật hoặc "Hủy" để quay lại.
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {isEditing ? (
              <>
                <Button color="default" variant="flat" onPress={handleCancelEdit}>
                  Hủy
                </Button>
                <Button color="primary" onPress={handleSaveEdit}>
                  Lưu thay đổi
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={() => handleViewEMR(selectedAppt)}
                  startContent={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                >
                  Xem EMR
                </Button>
                {selectedAppt?.status === 'pending' && (
                  <>
                    <Button color="danger" variant="flat" onPress={handleReject}>
                      Từ chối
                    </Button>
                    <Button color="success" onPress={handleConfirm}>
                      Xác nhận
                    </Button>
                  </>
                )}
                {selectedAppt?.type === 'online' && selectedAppt?.status === 'confirmed' && (
                  <Button color="primary" onPress={onClose}>
                    Tham gia
                  </Button>
                )}
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DoctorFrame>
  );
};

export default DoctorAppointments;