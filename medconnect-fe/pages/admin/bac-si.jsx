import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
    GET_DOCTORS: '/admin/doctor/all',
    DELETE_DOCTOR: (id) => `/admin/doctor/${id}`,
  },
};

const Doctor = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licenseId: '',
    phone: '',
    specialization: '',
    userId: '',
  });

  const specialties = [
    { value: 'all', label: 'Tất cả chuyên khoa' },
    { value: 'tim-mach', label: 'Tim mạch' },
    { value: 'noi-khoa', label: 'Nội khoa' },
    { value: 'ngoai-khoa', label: 'Ngoại khoa' },
    { value: 'nhi-khoa', label: 'Nhi khoa' },
    { value: 'san-phu-khoa', label: 'Sản phụ khoa' },
  ];

  // Mock data - replace with API call
  const mockDoctors = [
    {
      id: 1,
      firstName: 'Nguyễn Văn',
      lastName: 'A',
      licenseId: 'BS-12345',
      phone: '0901234567',
      specialization: 'tim-mach',
      userId: 101,
      status: 'active',
      avatar: '/assets/homepage/mockup-avatar.jpg',
    },
    // Add more mock doctors...
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedSpecialty, doctors]);

  // API Functions
  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const token = user ? await user.getIdToken() : null;
      const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_DOCTORS, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      // Map backend -> UI
      const mapped = (data || []).map((d) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        licenseId: d.licenseId,
        specializationLabel: d.specialty,
        userId: d.userId,
        avatar: d.avatar,
        status: (d.status || 'ACTIVE').toLowerCase(),
      }));
      // Exclude soft-deleted doctors
      setDoctors(mapped.filter((d) => d.status === 'active'));
        setIsLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setIsLoading(false);
    }
  };

  const createDoctor = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_DOCTOR, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      const newDoctor = { ...formData, id: Date.now(), status: 'active', avatar: '/assets/homepage/mockup-avatar.jpg' };
      setDoctors([...doctors, newDoctor]);
      resetForm();
    } catch (error) {
      console.error('Error creating doctor:', error);
    }
  };

  const updateDoctor = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.UPDATE_DOCTOR(currentDoctor.id), {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      setDoctors(doctors.map(d => d.id === currentDoctor.id ? { ...d, ...formData } : d));
      resetForm();
    } catch (error) {
      console.error('Error updating doctor:', error);
    }
  };

  const deleteDoctor = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bác sĩ này?')) return;
    
    try {
      const token = user ? await user.getIdToken() : null;
      const resp = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DELETE_DOCTOR(id), {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || 'Delete failed');
      }
      setDoctors((prev) => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((d) =>
        (d.name || '').toLowerCase().includes(q) || (d.phone || '').includes(searchQuery)
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter((d) =>
        (d.specializationLabel || '').toLowerCase().includes(selectedSpecialty.replace('-', ' '))
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleEdit = (doctor) => {
    setCurrentDoctor(doctor);
    setFormData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      licenseId: doctor.licenseId,
      phone: doctor.phone,
      specialization: doctor.specialization,
      userId: doctor.userId,
    });
    onOpen();
  };

  const handleAdd = () => {
    setCurrentDoctor(null);
    resetForm();
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      licenseId: '',
      phone: '',
      specialization: '',
      userId: '',
    });
  };

  const handleSubmit = () => {
    if (currentDoctor) {
      updateDoctor();
    } else {
      createDoctor();
    }
  };

  const paginatedDoctors = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDoctors.slice(start, end);
  }, [page, filteredDoctors]);

  const pages = Math.ceil(filteredDoctors.length / rowsPerPage);

  // Left Panel - Filters & Stats
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng bác sĩ</p>
            <p className="text-2xl font-bold text-blue-600">{doctors.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {doctors.filter((d) => d.status === 'active').length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>
        <Select
          label="Chuyên khoa"
          placeholder="Chọn chuyên khoa"
          selectedKeys={selectedSpecialty ? [selectedSpecialty] : []}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
        >
          {specialties.map((item) => (
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
          placeholder="Tìm kiếm bác sĩ..."
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
          + Thêm Bác Sĩ
        </Button>
      </div>

      <Table aria-label="Doctors table">
        <TableHeader>
          <TableColumn>BÁC SĨ</TableColumn>
          <TableColumn>CHỨNG CHỈ</TableColumn>
          <TableColumn>CHUYÊN KHOA</TableColumn>
          <TableColumn>SỐ ĐIỆN THOẠI</TableColumn>
          <TableColumn>USER ID</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedDoctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar src={doctor.avatar} size="sm" />
                  <div>
                    <p className="font-medium">{doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`}</p>
                    {doctor.name && (
                      <p className="text-xs text-gray-500">Bác sĩ</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {doctor.licenseId}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat">
                  {doctor.specializationLabel || '—'}
                </Chip>
              </TableCell>
              <TableCell>
                <p className="text-sm">{doctor.phone}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-gray-500">#{doctor.userId}</p>
              </TableCell>
              <TableCell>
                <Chip color={doctor.status === 'active' ? 'success' : 'default'} size="sm">
                  {doctor.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
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
                    <DropdownItem key="edit" onPress={() => handleEdit(doctor)}>
                      Chỉnh sửa
                    </DropdownItem>
                    <DropdownItem key="delete" className="text-danger" color="danger" onPress={() => deleteDoctor(doctor.id)}>
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
    <AdminFrame title="Quản Lý Bác Sĩ">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {currentDoctor ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ mới'}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Họ"
                    placeholder="Nguyễn Văn"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <Input
                    label="Tên"
                    placeholder="A"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                  <Input
                    label="Chứng chỉ hành nghề"
                    placeholder="BS-12345"
                    value={formData.licenseId}
                    onChange={(e) => setFormData({ ...formData, licenseId: e.target.value })}
                  />
                  <Input
                    label="Số điện thoại"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <Select
                    label="Chuyên khoa"
                    placeholder="Chọn chuyên khoa"
                    selectedKeys={formData.specialization ? [formData.specialization] : []}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  >
                    {specialties.slice(1).map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="User ID"
                    type="number"
                    placeholder="101"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
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
                  {currentDoctor ? 'Cập nhật' : 'Thêm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminFrame>
  );
};

export default Doctor;