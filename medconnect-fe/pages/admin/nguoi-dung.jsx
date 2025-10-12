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
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  Pagination,
} from '@heroui/react';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    GET_PATIENTS: '/patients',
    CREATE_PATIENT: '/patients',
    UPDATE_PATIENT: (id) => `/patients/${id}`,
    DELETE_PATIENT: (id) => `/patients/${id}`,
    TOGGLE_STATUS: (id) => `/patients/${id}/status`,
  },
};

const Patient = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Tạm ngưng' },
    { value: 'blocked', label: 'Đã khóa' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
  ];

  const bloodTypeOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'AB', label: 'AB' },
    { value: 'O', label: 'O' },
  ];

  // Mock data
  const mockPatients = [
    {
      id: 1,
      fullName: 'Nguyễn Thị Mai',
      email: 'mai.nguyen@email.com',
      phone: '0912345678',
      address: 'Hà Nội',
      dateOfBirth: '1990-05-15',
      gender: 'female',
      bloodType: 'A',
      status: 'active',
      avatar: '/assets/homepage/mockup-avatar.jpg',
      joinDate: '2024-01-15',
    },
    // Add more mock data...
  ];

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, selectedStatus, patients]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setPatients(mockPatients);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setIsLoading(false);
    }
  };

  const createPatient = async () => {
    try {
      // TODO: Replace with actual API call
      const newPatient = {
        ...formData,
        id: Date.now(),
        status: 'active',
        avatar: '/assets/homepage/mockup-avatar.jpg',
        joinDate: new Date().toISOString().split('T')[0],
      };
      setPatients([...patients, newPatient]);
      resetForm();
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const updatePatient = async () => {
    try {
      // TODO: Replace with actual API call
      setPatients(patients.map(p => p.id === currentPatient.id ? { ...p, ...formData } : p));
      resetForm();
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const deletePatient = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    
    try {
      // TODO: Replace with actual API call
      setPatients(patients.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      // TODO: Replace with actual API call
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      setPatients(patients.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    setFilteredPatients(filtered);
  };

  const handleEdit = (patient) => {
    setCurrentPatient(patient);
    setFormData({
      fullName: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType,
    });
    onOpen();
  };

  const handleAdd = () => {
    setCurrentPatient(null);
    resetForm();
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
    });
  };

  const handleSubmit = () => {
    if (currentPatient) {
      updatePatient();
    } else {
      createPatient();
    }
  };

  const paginatedPatients = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPatients.slice(start, end);
  }, [page, filteredPatients]);

  const pages = Math.ceil(filteredPatients.length / rowsPerPage);

  // Left Panel - Stats & Filters
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng người dùng</p>
            <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {patients.filter((p) => p.status === 'active').length}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Đã khóa</p>
            <p className="text-2xl font-bold text-red-600">
              {patients.filter((p) => p.status === 'blocked').length}
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
          placeholder="Tìm kiếm người dùng..."
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
          + Thêm Người Dùng
        </Button>
      </div>

      <Table aria-label="Patients table">
        <TableHeader>
          <TableColumn>NGƯỜI DÙNG</TableColumn>
          <TableColumn>LIÊN HỆ</TableColumn>
          <TableColumn>ĐỊA CHỈ</TableColumn>
          <TableColumn>NHÓM MÁU</TableColumn>
          <TableColumn>NGÀY THAM GIA</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedPatients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar src={patient.avatar} size="sm" />
                  <div>
                    <p className="font-medium">{patient.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {patient.gender === 'male' ? '👨 Nam' : patient.gender === 'female' ? '👩 Nữ' : '🧑 Khác'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{patient.email}</p>
                  <p className="text-gray-500">{patient.phone}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">{patient.address}</p>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="danger">
                  {patient.bloodType}
                </Chip>
              </TableCell>
              <TableCell>
                <p className="text-sm">{new Date(patient.joinDate).toLocaleDateString('vi-VN')}</p>
              </TableCell>
              <TableCell>
                <Chip 
                  color={
                    patient.status === 'active' ? 'success' : 
                    patient.status === 'blocked' ? 'danger' : 'default'
                  } 
                  size="sm"
                >
                  {patient.status === 'active' ? 'Hoạt động' : 
                   patient.status === 'blocked' ? 'Đã khóa' : 'Tạm ngưng'}
                </Chip>
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Actions">
                    <DropdownItem key="edit" onPress={() => handleEdit(patient)}>
                      Chỉnh sửa
                    </DropdownItem>
                    <DropdownItem key="toggle" onPress={() => toggleStatus(patient.id, patient.status)}>
                      {patient.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                    </DropdownItem>
                    <DropdownItem key="delete" className="text-danger" color="danger" onPress={() => deletePatient(patient.id)}>
                      Xóa
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        <Pagination
          total={pages}
          page={page}
          onChange={setPage}
          showControls
        />
      </div>
    </div>
  );

  return (
    <AdminFrame title="Quản Lý Người Dùng">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {currentPatient ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="user@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    label="Số điện thoại"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <Input
                    label="Ngày sinh"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                  <Select
                    label="Giới tính"
                    placeholder="Chọn giới tính"
                    selectedKeys={formData.gender ? [formData.gender] : []}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    {genderOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Nhóm máu"
                    placeholder="Chọn nhóm máu"
                    selectedKeys={formData.bloodType ? [formData.bloodType] : []}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  >
                    {bloodTypeOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Địa chỉ"
                    placeholder="Hà Nội, Việt Nam"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="col-span-2"
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
                  {currentPatient ? 'Cập nhật' : 'Thêm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminFrame>
  );
};

export default Patient;