import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminFrame, Grid } from '@/components/layouts/';
import { useToast } from '@/hooks/useToast';
import ToastNotification from '@/components/ui/ToastNotification';
import { doctorAPI } from '@/services/api';
import { FileText } from 'lucide-react';
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
  Card,
  CardBody,
  Pagination,
} from '@heroui/react';

const Doctor = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onOpenChange: onImageModalOpenChange } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');  // New filter for status
  const [isLoading, setIsLoading] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [licenseImages, setLicenseImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
        license: d.license,  // ✅ Include license object
        specializationLabel: d.specialty,
        specialityId: d.specialityId,  // ✅ Include specialityId for form mapping
        userId: d.userId,
        avatar: d.avatar,
        status: (d.status || 'ACTIVE'),  // Keep original case for proper filtering
        experienceYears: d.experienceYears || 0,
        educationLevel: d.educationLevel || '',
        bio: d.bio || '',
        clinicAddress: d.clinicAddress || '',
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
      console.log('=== Frontend: updateDoctor ===');
      console.log('Current doctor:', currentDoctor);
      console.log('Current doctor status:', currentDoctor?.status);
      console.log('Form data status:', formData.status);
      
      const wasApproved = currentDoctor?.status === 'PENDING' && formData.status === 'ACTIVE';
      console.log('Was approved:', wasApproved);
      
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
      
      console.log('Payload being sent:', payload);
      
      const response = await doctorAPI.updateDoctor(currentDoctor.id, payload, user);
      console.log('Backend response:', response);
      
      // Check if response indicates success or error
      if (response.success === false) {
        // Backend returned an error
        toast.error(response.message || 'Không thể cập nhật bác sĩ');
        console.error('Backend error:', response);
        return;
      }
      
      // Backend will handle Firebase account creation and email sending when approving
      if (wasApproved) {
        toast.success('Đã duyệt bác sĩ. Email với thông tin đăng nhập đã được gửi tự động.');
      } else {
        toast.success('Cập nhật bác sĩ thành công');
      }
      
      await fetchDoctors();
      resetForm();
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error(error.message || 'Không thể cập nhật bác sĩ');
    }
  };

  const deleteDoctor = async (id) => {
    if (!confirm('Xóa bác sĩ này sẽ xóa cả lịch hẹn, phiên video và tài khoản liên quan. Bạn có chắc chắn?')) return;
    
    try {
      await doctorAPI.deleteDoctor(id, user);
      toast.success('Đã xóa bác sĩ và dữ liệu liên quan');
      await fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error(error.message || 'Không thể xóa bác sĩ');
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
    
    // Use specialityId directly if available, otherwise try to find by name
    let specialityIdValue = '';
    if (doctor.specialityId) {
      specialityIdValue = String(doctor.specialityId);
    } else {
      const specialty = specialties.find(s => 
        s.label.toLowerCase() === (doctor.specializationLabel || '').toLowerCase()
      );
      specialityIdValue = specialty?.value || '';
    }
    
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialityId: specialityIdValue,
      experienceYears: doctor.experienceYears !== undefined && doctor.experienceYears !== null ? doctor.experienceYears : 0,
      educationLevel: doctor.educationLevel || '',
      bio: doctor.bio || '',
      status: doctor.status || 'ACTIVE',
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Thống kê</h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Tổng bác sĩ</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{doctors.length}</p>
          </div>
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Đang hoạt động</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {doctors.filter((d) => d.status === 'active' || d.status === 'ACTIVE').length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Bộ lọc</h3>
        <div className="space-y-3">
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            size="sm"
            selectedKeys={selectedStatus ? [selectedStatus] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedStatus(value);
            }}
            classNames={{
              trigger: "h-10 sm:h-12",
            }}
          >
            <SelectItem key="all" value="all">Tất cả</SelectItem>
            <SelectItem key="PENDING" value="PENDING">Chờ duyệt</SelectItem>
            <SelectItem key="ACTIVE" value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem key="INACTIVE" value="INACTIVE">Không hoạt động</SelectItem>
          </Select>
          
          <Select
            label="Chuyên khoa"
            placeholder="Chọn chuyên khoa"
            size="sm"
            selectedKeys={selectedSpecialty ? [selectedSpecialty] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedSpecialty(value);
            }}
            classNames={{
              trigger: "h-10 sm:h-12",
            }}
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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <Input
          placeholder="Tìm kiếm bác sĩ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-xs"
          size="sm"
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
          <span className="hidden sm:inline">+ Thêm Bác Sĩ</span>
          <span className="sm:hidden">+ Thêm</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table 
          aria-label="Doctors table"
          removeWrapper
          classNames={{
            wrapper: "min-h-[200px]",
            th: "text-xs sm:text-sm",
            td: "text-xs sm:text-sm",
          }}
        >
          <TableHeader>
            <TableColumn className="min-w-[150px]">BÁC SĨ</TableColumn>
            <TableColumn className="min-w-[100px] hidden md:table-cell">CHỨNG CHỈ</TableColumn>
            <TableColumn className="min-w-[120px] hidden lg:table-cell">CHUYÊN KHOA</TableColumn>
            <TableColumn className="min-w-[100px] hidden xl:table-cell">SỐ ĐIỆN THOẠI</TableColumn>
            <TableColumn className="min-w-[80px] hidden xl:table-cell">USER ID</TableColumn>
            <TableColumn className="min-w-[100px]">TRẠNG THÁI</TableColumn>
            <TableColumn className="min-w-[80px]">THAO TÁC</TableColumn>
          </TableHeader>
          <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
            {paginatedDoctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar src={doctor.avatar} size="sm" className="flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`}</p>
                      {doctor.name && (
                        <p className="text-xs text-gray-500 hidden sm:block">Bác sĩ</p>
                      )}
                      <div className="sm:hidden space-y-1 mt-1">
                        <p className="text-xs text-gray-500">{doctor.phone}</p>
                        {doctor.specializationLabel && (
                          <Chip size="sm" variant="flat" className="text-xs">
                            {doctor.specializationLabel}
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {doctor.license?.license_number ? (
                    <Chip size="sm" variant="flat" color="primary" className="text-xs">
                      {doctor.license.license_number}
                    </Chip>
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-400">Chưa có</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Chip size="sm" variant="flat" className="text-xs">
                    {doctor.specializationLabel || '—'}
                  </Chip>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <p className="text-xs sm:text-sm">{doctor.phone}</p>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <p className="text-xs sm:text-sm text-gray-500">#{doctor.userId}</p>
                </TableCell>
                <TableCell>
                  <Chip 
                    color={
                      doctor.status === 'ACTIVE' || doctor.status === 'active' ? 'success' : 
                      doctor.status === 'PENDING' ? 'warning' : 
                      'default'
                    } 
                    size="sm"
                    className="text-xs"
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
                      <Button isIconOnly size="sm" variant="light" className="min-w-[32px]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Actions">
                      <DropdownItem key="edit" onPress={() => handleEdit(doctor)}>
                        Chỉnh sửa
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        onPress={() => deleteDoctor(doctor.id)}
                      >
                        Xóa bác sĩ
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
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

  return (
    <AdminFrame title="Quản Lý Bác Sĩ">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "py-4 sm:py-6",
          backdrop: "bg-black/50 backdrop-opacity-40"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b p-4 sm:p-6">
                <span className="text-base sm:text-lg">{currentDoctor ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ mới'}</span>
              </ModalHeader>
              <ModalBody className="overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input
                    label="Họ và tên"
                    placeholder="BS. Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-1 sm:col-span-2"
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-default-200 bg-gray-50"
                    }}
                    isRequired
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="doctor@medconnect.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-default-200 bg-gray-50"
                    }}
                    isRequired
                    isDisabled={currentDoctor !== null}
                    description={currentDoctor ? "Email không thể thay đổi" : ""}
                  />
                  <Input
                    label="Số điện thoại"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-default-200 bg-gray-50"
                    }}
                    isRequired
                  />
                  <Input
                    label="Số năm kinh nghiệm"
                    type="number"
                    placeholder="5"
                    value={formData.experienceYears !== undefined && formData.experienceYears !== null ? String(formData.experienceYears) : ''}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-default-200 bg-gray-50"
                    }}
                  />
                  <Select
                    label="Chuyên khoa"
                    placeholder="Chọn chuyên khoa"
                    selectedKeys={formData.specialityId ? [String(formData.specialityId)] : []}
                    onSelectionChange={(keys) => {
                      const selectedValue = Array.from(keys)[0];
                      setFormData({ ...formData, specialityId: selectedValue || "" });
                    }}
                    variant="bordered"
                    classNames={{
                      trigger: "border-default-200 bg-gray-50"
                    }}
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
                    value={formData.educationLevel || ''}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-default-200 bg-gray-50"
                    }}
                  />
                  <Select
                    label="Trạng thái tài khoản"
                    placeholder="Chọn trạng thái"
                    selectedKeys={formData.status ? [formData.status] : []}
                    onSelectionChange={(keys) => {
                      const selectedStatus = Array.from(keys)[0] || formData.status;
                      setFormData({ ...formData, status: selectedStatus });
                    }}
                    variant="bordered"
                    classNames={{
                      trigger: "border-default-200 bg-gray-50"
                    }}
                    isDisabled={!currentDoctor} // Disable when creating new doctor
                  >
                    <SelectItem 
                      key="ACTIVE" 
                      value="ACTIVE"
                      isDisabled={
                        currentDoctor?.status === 'ACTIVE' ? false :
                        currentDoctor?.status === 'PENDING' ? false :
                        currentDoctor?.status === 'INACTIVE' ? false :
                        false
                      }
                    >
                      Hoạt động
                    </SelectItem>
                    <SelectItem 
                      key="PENDING" 
                      value="PENDING"
                      isDisabled={
                        currentDoctor?.status === 'ACTIVE' ? true : // Cannot change from ACTIVE to PENDING
                        currentDoctor?.status === 'PENDING' ? false :
                        currentDoctor?.status === 'INACTIVE' ? true : // Cannot change from INACTIVE to PENDING
                        false
                      }
                    >
                      Chờ duyệt
                    </SelectItem>
                    <SelectItem 
                      key="INACTIVE" 
                      value="INACTIVE"
                      isDisabled={
                        currentDoctor?.status === 'PENDING' ? true : // From PENDING, only allow ACTIVE
                        false
                      }
                    >
                      Không hoạt động
                    </SelectItem>
                  </Select>
                  {currentDoctor && (
                    <div className="col-span-2 text-xs text-gray-500 mt-1">
                      {currentDoctor.status === 'PENDING' && (
                        <span className="text-orange-600">⚠️ Bác sĩ đang chờ duyệt, chỉ có thể chuyển sang "Hoạt động"</span>
                      )}
                      {currentDoctor.status === 'ACTIVE' && (
                        <span className="text-blue-600">ℹ️ Bác sĩ đang hoạt động, không thể chuyển về "Chờ duyệt"</span>
                      )}
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Giới thiệu bản thân</label>
                    <textarea
                      placeholder="Tôi là bác sĩ tim mạch..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full min-h-[100px] p-3 rounded-lg bg-gray-50 border border-default-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  </div>

                  {/* Certificate Display Section - Only in Edit Mode */}
                  {currentDoctor && currentDoctor.license && (
                    <div className="col-span-2 mt-4">
                      <label className="block text-sm font-medium mb-3 text-gray-700">
                        📋 Chứng chỉ hành nghề
                      </label>
                      <div className="relative bg-gradient-to-br from-white rounded-xl p-6 shadow-lg">
                        {/* Status Badge - Top Left */}
                        <div className="absolute top-4 left-4">
                          <Chip
                            size="md"
                            color={currentDoctor.license.is_active && !currentDoctor.license.is_expired ? "success" : "danger"}
                            variant="shadow"
                            className="font-semibold"
                          >
                            {currentDoctor.license.is_expired ? "Đã hết hạn" : currentDoctor.license.is_active ? "Hiệu lực" : "Không hoạt động"}
                          </Chip>
                        </div>

                        {/* View Image Button - Top Right */}
                        {currentDoctor.license.proof_images && (
                          <div className="absolute top-4 right-4">
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              startContent={<FileText size={16} />}
                              onPress={() => {
                                try {
                                  // Try to parse as JSON array
                                  const images = JSON.parse(currentDoctor.license.proof_images);
                                  if (Array.isArray(images) && images.length > 0) {
                                    setLicenseImages(images);
                                    setSelectedImageIndex(0);
                                    onImageModalOpen();
                                  } else {
                                    // If it's a single string URL
                                    setLicenseImages([currentDoctor.license.proof_images]);
                                    setSelectedImageIndex(0);
                                    onImageModalOpen();
                                  }
                                } catch (error) {
                                  // Fallback: treat as single URL string
                                  setLicenseImages([currentDoctor.license.proof_images]);
                                  setSelectedImageIndex(0);
                                  onImageModalOpen();
                                }
                              }}
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              Xem ảnh
                            </Button>
                          </div>
                        )}

                        {/* Header */}
                        <div className="text-center mb-6 mt-8">
                          <div className="flex justify-center mb-3">
                            <div className="bg-gradient-to-br from-teal-500 to-green-500 p-3 rounded-full">
                              <FileText size={32} className="text-white" />
                            </div>
                          </div>
                          <h4 className="text-sm uppercase tracking-wider text-gray-600 font-semibold mb-1">
                            Giấy phép hành nghề
                          </h4>
                          <p className="text-2xl font-bold text-teal-700 tracking-wide">
                            {currentDoctor.license.license_number}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-2 mb-6">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent"></div>
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent"></div>
                        </div>

                        {/* Information Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Ngày cấp</p>
                              <div className="flex items-center gap-2 text-gray-800">
                                <span className="font-medium">{currentDoctor.license.issued_date || 'N/A'}</span>
                              </div>
                            </div>
                            {currentDoctor.license.issued_by && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Nơi cấp</p>
                                <div className="flex items-start gap-2 text-gray-800">
                                  <span className="font-medium text-sm leading-tight">{currentDoctor.license.issued_by}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Hết hạn</p>
                              <div className="flex items-center gap-2 text-gray-800">
                                <span className="font-medium">{currentDoctor.license.expiry_date || 'Vô thời hạn'}</span>
                              </div>
                            </div>
                            {currentDoctor.license.issuer_title && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Chức vụ</p>
                                <div className="flex items-start gap-2 text-gray-800">
                                  <span className="font-medium text-sm leading-tight">{currentDoctor.license.issuer_title}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Scope of Practice */}
                        {currentDoctor.license.scope_of_practice && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Phạm vi</p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="font-medium text-sm text-gray-800 leading-tight">
                                {currentDoctor.license.scope_of_practice}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {currentDoctor.license.notes && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Ghi chú</p>
                            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                              <span className="font-medium text-sm text-gray-800 leading-tight">
                                {currentDoctor.license.notes}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Expiry Warning */}
                        {currentDoctor.license.days_until_expiry !== null && 
                         currentDoctor.license.days_until_expiry > 0 && 
                         currentDoctor.license.days_until_expiry < 365 && (
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg p-3 flex items-center gap-3">
                            <div className="bg-orange-500 p-2 rounded-full">
                              <FileText size={18} className="text-white" />
                            </div>
                            <div>
                              <p className="text-orange-800 font-semibold text-sm">Sắp hết hạn</p>
                              <p className="text-orange-600 text-xs">Còn {currentDoctor.license.days_until_expiry} ngày</p>
                            </div>
                          </div>
                        )}

                        {/* Decorative Seal/Stamp */}
                        <div className="absolute bottom-6 right-6 opacity-10">
                          <div className="w-20 h-20 rounded-full border-4 border-teal-500 flex items-center justify-center">
                            <FileText size={40} className="text-teal-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* No License State */}
                  {currentDoctor && !currentDoctor.license && (
                    <div className="col-span-2 mt-4">
                      <label className="block text-sm font-medium mb-3 text-gray-700">
                        📋 Chứng chỉ hành nghề
                      </label>
                      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <FileText size={64} className="mb-3 text-gray-400" />
                        <p className="text-gray-600 font-medium">Chưa có chứng chỉ hành nghề</p>
                        <p className="text-sm text-gray-500 mt-1">Bác sĩ chưa upload chứng chỉ</p>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex gap-2">
                  <Button variant="light" onPress={onClose} className="flex-1">
                  Hủy
                </Button>
                  {currentDoctor?.status === 'PENDING' && (
                    <Button
                      color="success"
                      onPress={async () => {
                        try {
                          // Set status to ACTIVE and submit directly
                          const approvePayload = {
                            name: formData.name,
                            email: formData.email,
                            phone: formData.phone,
                            specialityId: parseInt(formData.specialityId),
                            experienceYears: formData.experienceYears,
                            educationLevel: formData.educationLevel,
                            bio: formData.bio,
                            status: 'ACTIVE',  // Force ACTIVE for approval
                          };
                          
                          console.log('=== Approving Doctor ===');
                          console.log('Payload:', approvePayload);
                          
                          const response = await doctorAPI.updateDoctor(currentDoctor.id, approvePayload, user);
                          console.log('Backend response:', response);
                          
                          if (response.success === false) {
                            toast.error(response.message || 'Không thể phê duyệt bác sĩ');
                            console.error('Backend error:', response);
                            return;
                          }
                          
                          toast.success('Đã phê duyệt bác sĩ. Email với thông tin đăng nhập đã được gửi tự động.');
                          await fetchDoctors();
                          resetForm();
                          onClose();
                        } catch (error) {
                          console.error('Error approving doctor:', error);
                          toast.error(error.message || 'Không thể phê duyệt bác sĩ');
                        }
                      }}
                      className="flex-1"
                    >
                      Phê duyệt
                    </Button>
                  )}
                </div>
                <Button
                  color="primary"
                  onPress={() => {
                    handleSubmit();
                    onClose();
                  }}
                  className={currentDoctor?.status === 'PENDING' ? 'w-full sm:w-auto' : ''}
                >
                  {currentDoctor ? 'Cập nhật' : 'Thêm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* License Images Modal */}
      <Modal 
        isOpen={isImageModalOpen} 
        onOpenChange={onImageModalOpenChange}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FileText className="text-teal-600" size={24} />
                  <span>Ảnh chứng chỉ hành nghề</span>
                </div>
                {licenseImages.length > 1 && (
                  <p className="text-sm text-gray-500 font-normal mt-1">
                    {selectedImageIndex + 1} / {licenseImages.length}
                  </p>
                )}
              </ModalHeader>
              <ModalBody className="py-6">
                {licenseImages.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image Display */}
                    <div className="w-full flex justify-center items-center bg-gray-100 rounded-lg p-4 min-h-[400px]">
                      <img
                        src={licenseImages[selectedImageIndex]}
                        alt={`Chứng chỉ ${selectedImageIndex + 1}`}
                        className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x400?text=Không+thể+tải+ảnh';
                        }}
                      />
                    </div>

                    {/* Thumbnail Gallery */}
                    {licenseImages.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Chọn ảnh khác:</p>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                          {licenseImages.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                                selectedImageIndex === index
                                  ? 'border-teal-500 ring-2 ring-teal-200 shadow-md'
                                  : 'border-gray-200 hover:border-teal-300'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-20 object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/100x80?text=Error';
                                }}
                              />
                              {selectedImageIndex === index && (
                                <div className="absolute inset-0 bg-teal-500 bg-opacity-20 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">✓</span>
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons for Multiple Images */}
                    {licenseImages.length > 1 && (
                      <div className="flex justify-center gap-4 pt-2">
                        <Button
                          variant="flat"
                          color="primary"
                          isDisabled={selectedImageIndex === 0}
                          onPress={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}
                        >
                          ← Ảnh trước
                        </Button>
                        <Button
                          variant="flat"
                          color="primary"
                          isDisabled={selectedImageIndex === licenseImages.length - 1}
                          onPress={() => setSelectedImageIndex(prev => Math.min(licenseImages.length - 1, prev + 1))}
                        >
                          Ảnh sau →
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText size={64} className="mb-3 text-gray-400" />
                    <p className="text-gray-600 font-medium">Không có ảnh để hiển thị</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Đóng
                </Button>
                {licenseImages.length > 0 && (
                  <Button
                    color="primary"
                    onPress={() => {
                      window.open(licenseImages[selectedImageIndex], '_blank');
                    }}
                  >
                    Mở ảnh trong tab mới
                  </Button>
                )}
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