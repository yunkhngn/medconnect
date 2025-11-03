import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminFrame, Grid } from '@/components/layouts/';
import { useToast } from '@/hooks/useToast';
import ToastNotification from '@/components/ui/ToastNotification';
import { doctorAPI } from '@/services/api';
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

const Doctor = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');  // New filter for status
  const [isLoading, setIsLoading] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [specialties, setSpecialties] = useState([
    { value: 'all', label: 'Tất cả chuyên khoa' }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialityId: '',
    experienceYears: 0,
    educationLevel: '',
    bio: '',
    status: 'ACTIVE',  // Add status field
  });

  useEffect(() => {
    if (user) {
      fetchDoctors();
      fetchSpecialties();
    }
  }, [user]);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedSpecialty, selectedStatus, doctors]);

  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      const data = await doctorAPI.getAllSpecialties(user);
      // Map backend {id, name, description} to UI {value, label}
      const mapped = [
        { value: 'all', label: 'Tất cả chuyên khoa' },
        ...(data || []).map(s => ({
          value: s.id.toString(),
          label: s.name
        }))
      ];
      setSpecialties(mapped);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  // API Functions
  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await doctorAPI.getAllDoctors(user);
      console.log('Raw data from API:', data);
      const mapped = (data || []).map((d) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        licenseId: d.licenseId,
        specializationLabel: d.specialty,
        userId: d.userId,
        avatar: d.avatar,
        status: (d.status || 'ACTIVE'),  // Keep original case for proper filtering
        experienceYears: d.experienceYears,
        educationLevel: d.educationLevel,
        bio: d.bio,
        clinicAddress: d.clinicAddress,
        provinceCode: d.provinceCode,
        districtCode: d.districtCode,
        wardCode: d.wardCode,
      }));
      console.log('Mapped doctors:', mapped);
      // Show all doctors (including newly created ones)
      setDoctors(mapped);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Không thể tải danh sách bác sĩ');
    } finally {
      setIsLoading(false);
    }
  };

  const createDoctor = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialityId: parseInt(formData.specialityId),
        experienceYears: formData.experienceYears,
        educationLevel: formData.educationLevel,
        bio: formData.bio,
        status: formData.status,  // Add status
      };
      
      await doctorAPI.createDoctor(payload, user);
      toast.success('Tạo bác sĩ thành công');
      await fetchDoctors();
      resetForm();
    } catch (error) {
      console.error('Error creating doctor:', error);
      toast.error(error.message || 'Không thể tạo bác sĩ');
    }
  };

  const updateDoctor = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialityId: parseInt(formData.specialityId),
        experienceYears: formData.experienceYears,
        educationLevel: formData.educationLevel,
        bio: formData.bio,
        status: formData.status,  // Add status
      };
      
      await doctorAPI.updateDoctor(currentDoctor.id, payload, user);
      toast.success('Cập nhật bác sĩ thành công');
      await fetchDoctors();
      resetForm();
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error(error.message || 'Không thể cập nhật bác sĩ');
    }
  };

  const deleteDoctor = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bác sĩ này?')) return;
    
    try {
      await doctorAPI.deleteDoctor(id, user);
      toast.success('Xóa bác sĩ thành công');
      await fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Không thể xóa bác sĩ');
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
      filtered = filtered.filter((d) => {
        // Match by specialty ID or name
        const specialtyMatch = specialties.find(s => s.value === selectedSpecialty);
        if (specialtyMatch && specialtyMatch.label) {
          return (d.specializationLabel || '').toLowerCase().includes(specialtyMatch.label.toLowerCase());
        }
        return false;
      });
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((d) => (d.status || 'ACTIVE').toUpperCase() === selectedStatus);
    }

    setFilteredDoctors(filtered);
  };

  const handleEdit = (doctor) => {
    setCurrentDoctor(doctor);
    
    // Find specialty ID from specialty name
    const specialty = specialties.find(s => 
      s.label.toLowerCase() === (doctor.specializationLabel || '').toLowerCase()
    );
    
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialityId: specialty?.value || '',
      experienceYears: doctor.experienceYears || 0,
      educationLevel: doctor.educationLevel || '',
      bio: doctor.bio || '',
      status: doctor.status || 'ACTIVE',  // Add status
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
      name: '',
      email: '',
      phone: '',
      specialityId: '',
      experienceYears: 0,
      educationLevel: '',
      bio: '',
      status: 'ACTIVE',  // Add default status
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
        <div className="space-y-3">
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            selectedKeys={selectedStatus ? [selectedStatus] : []}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <SelectItem key="all" value="all">Tất cả</SelectItem>
            <SelectItem key="PENDING" value="PENDING">Chờ duyệt</SelectItem>
            <SelectItem key="ACTIVE" value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem key="INACTIVE" value="INACTIVE">Không hoạt động</SelectItem>
          </Select>
          
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
                <Chip 
                  color={
                    doctor.status === 'ACTIVE' || doctor.status === 'active' ? 'success' : 
                    doctor.status === 'PENDING' ? 'warning' : 
                    'default'
                  } 
                  size="sm"
                >
                  {doctor.status === 'ACTIVE' || doctor.status === 'active' ? 'Hoạt động' : 
                   doctor.status === 'PENDING' ? 'Chờ duyệt' :
                   doctor.status === 'INACTIVE' ? 'Không hoạt động' :
                   'Tạm ngưng'}
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
                    label="Họ và tên"
                    placeholder="BS. Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-2"
                    isRequired
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="doctor@medconnect.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    isRequired
                    isDisabled={currentDoctor !== null}
                    description={currentDoctor ? "Email không thể thay đổi" : ""}
                  />
                  <Input
                    label="Số điện thoại"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Số năm kinh nghiệm"
                    type="number"
                    placeholder="5"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                  />
                  <Select
                    label="Chuyên khoa"
                    placeholder="Chọn chuyên khoa"
                    selectedKeys={formData.specialityId ? [formData.specialityId] : []}
                    onChange={(e) => setFormData({ ...formData, specialityId: e.target.value })}
                    isRequired
                  >
                    {specialties.slice(1).map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Trình độ học vấn"
                    placeholder="Tiến sĩ Y khoa, Thạc sĩ..."
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  />
                  <Select
                    label="Trạng thái tài khoản"
                    placeholder="Chọn trạng thái"
                    selectedKeys={formData.status ? [formData.status] : []}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <SelectItem key="ACTIVE" value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem key="PENDING" value="PENDING">Chờ duyệt</SelectItem>
                    <SelectItem key="INACTIVE" value="INACTIVE">Không hoạt động</SelectItem>
                  </Select>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Giới thiệu bản thân</label>
                    <textarea
                      placeholder="Tôi là bác sĩ tim mạch..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full min-h-[100px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  </div>
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
      <ToastNotification />
    </AdminFrame>
  );
};

export default Doctor;