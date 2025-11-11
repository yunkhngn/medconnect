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
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  Pagination,
} from '@heroui/react';

// API config
const API_BASE_URL = 'http://localhost:8080/api';

const Patient = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isEmrOpen,
    onOpen: onEmrOpen,
    onOpenChange: onEmrOpenChange,
  } = useDisclosure();

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedBloodType, setSelectedBloodType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [selectedPatientForEmr, setSelectedPatientForEmr] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
  });

  // Constants (fallback values; may be overridden by backend)
  const [statusOptions, setStatusOptions] = useState([
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Tạm ngưng' },
    { value: 'blocked', label: 'Đã khóa' },
  ]);
  const [genderOptions, setGenderOptions] = useState([
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
  ]);
  const [bloodTypeOptions, setBloodTypeOptions] = useState([
    { value: '', label: 'Chưa xác định' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'AB', label: 'AB' },
    { value: 'O', label: 'O' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ]);

  // Fetch constants from backend (if available)
  useEffect(() => {
    const fetchConstants = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/constants/all`);
        if (res.ok) {
          const data = await res.json();
          if (data.patientStatuses && data.patientStatuses.length > 0) {
            setStatusOptions(data.patientStatuses);
          }
          if (data.genders && data.genders.length > 0) {
            setGenderOptions(data.genders);
          }
          if (data.bloodTypes && data.bloodTypes.length > 0) {
            setBloodTypeOptions(data.bloodTypes);
          }
        }
      } catch (error) {
        console.error('Failed to fetch constants:', error);
        // keep fallback values
      }
    };
    fetchConstants();
  }, []);

  // Fetch patients (uses auth token if available)
  const fetchPatients = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let headers = {};
      if (user?.getIdToken) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/admin/patients`, {
        headers,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        console.error('Error response fetching patients', response.status, text);
        toast.error('Không thể tải danh sách bệnh nhân');
        setPatients([]);
        return;
      }

      const data = await response.json();

      // support different server shapes: either { success, data } or raw array
      const rawPatients = Array.isArray(data) ? data : (data.data || data.patients || []);

      // Normalize some fields
      const normalizedPatients = (rawPatients || []).map((p) => {
        let gender = p.gender;
        if (gender === 'Nam') gender = 'male';
        if (gender === 'Nữ') gender = 'female';
        if (!gender) gender = p.gender || '';

        return {
          ...p,
          gender,
          bloodType: p.bloodType || '',
        };
      });

      setPatients(normalizedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Lỗi khi tải danh sách bệnh nhân');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGender, selectedBloodType, patients]);

  // Create
  const createPatient = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Tạo bệnh nhân thành công!');
        fetchPatients();
        resetForm();
      } else {
        toast.error(data.message || 'Tạo bệnh nhân thất bại');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error(error.message || 'Lỗi khi tạo bệnh nhân');
    }
  };

  // Update
  const updatePatient = async () => {
    if (!user || !currentPatient) return;
    try {
      const token = await user.getIdToken();
      const { password, ...updateData } = formData; // don't send password on update unless intended

      // clean data
      const cleanData = {};
      Object.keys(updateData).forEach((key) => {
        const value = updateData[key];
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'address' && typeof value === 'object') {
            cleanData[key] = value.address || value.address_detail || '';
          } else {
            cleanData[key] = value;
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/admin/patients/${currentPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Cập nhật bệnh nhân thành công!');
        fetchPatients();
        resetForm();
      } else {
        toast.error(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Lỗi khi cập nhật bệnh nhân');
    }
  };

  // Delete
  const deletePatient = async (id) => {
    if (!user) return;
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/patients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Xóa bệnh nhân thành công!');
        fetchPatients();
      } else {
        toast.error(data.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Lỗi khi xóa bệnh nhân');
    }
  };

  // Optional: toggle status (active/block)
  const toggleStatus = async (id) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/patients/${id}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchPatients();
      } else {
        toast.error(data.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone?.includes(searchQuery)
      );
    }

    if (selectedGender !== 'all') {
      filtered = filtered.filter((p) => p.gender === selectedGender);
    }

    if (selectedBloodType !== 'all') {
      filtered = filtered.filter((p) => p.bloodType === selectedBloodType);
    }

    setFilteredPatients(filtered);
    setPage(1);
  };

  const handleEdit = (patient) => {
    setCurrentPatient(patient);

    let addressValue = patient.address;
    if (typeof patient.address === 'object' && patient.address !== null) {
      addressValue = patient.address.address || patient.address.address_detail || '';
    }

    setFormData({
      fullName: patient.fullName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      address: addressValue || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      bloodType: patient.bloodType || '',
    });
    onOpen();
  };

  const handleAdd = () => {
    setCurrentPatient(null);
    resetForm();
    onOpen();
  };

  const handleViewEmr = (patient) => {
    setSelectedPatientForEmr(patient);
    onEmrOpen();
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
    });
  };

  const handleSubmit = async () => {
    if (currentPatient) await updatePatient();
    else await createPatient();
  };

  const paginatedPatients = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPatients.slice(start, end);
  }, [page, filteredPatients]);

  const pages = Math.max(1, Math.ceil(filteredPatients.length / rowsPerPage));

  // Left panel - stats & filters
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng người dùng</p>
            <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Nam</p>
            <p className="text-2xl font-bold text-purple-600">
              {patients.filter((p) => p.gender === 'male').length}
            </p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-gray-600">Nữ</p>
            <p className="text-2xl font-bold text-pink-600">
              {patients.filter((p) => p.gender === 'female').length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>
        <div className="space-y-3">
          <Select
            label="Giới tính"
            placeholder="Chọn giới tính"
            selectedKeys={selectedGender ? new Set([selectedGender]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedGender(value);
            }}
          >
            <SelectItem key="all" value="all">Tất cả</SelectItem>
            {genderOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Nhóm máu"
            placeholder="Chọn nhóm máu"
            selectedKeys={selectedBloodType ? new Set([selectedBloodType]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedBloodType(value);
            }}
          >
            <SelectItem key="all" value="all">Tất cả</SelectItem>
            {bloodTypeOptions.filter(item => item.value !== '').map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );

  // Right panel - table
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
          <TableColumn>GIỚI TÍNH</TableColumn>
          <TableColumn>ĐỊA CHỈ</TableColumn>
          <TableColumn>NHÓM MÁU</TableColumn>
          <TableColumn>NGÀY THAM GIA</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedPatients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar src={patient.avatar || '/assets/homepage/mockup-avatar.jpg'} size="sm" />
                  <div>
                    <p className="font-medium">{patient.fullName}</p>
                    <p className="text-xs text-gray-500">{patient.email}</p>
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
                <Chip size="sm" variant="flat" color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'secondary' : 'default'}>
                  {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}
                </Chip>
              </TableCell>

              <TableCell>
                <p className="text-sm">
                  {typeof patient.address === 'object'
                    ? (patient.address?.full || [patient.address?.address_detail, patient.address?.ward_name, patient.address?.district_name, patient.address?.province_name].filter(Boolean).join(', '))
                    : (patient.address || '')}
                </p>
              </TableCell>

              <TableCell>
                <Chip size="sm" variant="flat" color="danger">
                  {patient.bloodType || 'Chưa xác định'}
                </Chip>
              </TableCell>

              <TableCell>
                <p className="text-sm">
                  {patient.joinDate ? new Date(patient.joinDate).toLocaleDateString('vi-VN') : ''}
                </p>
              </TableCell>

              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      ⋮
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Thao tác">
                    <DropdownItem key="view-emr" onPress={() => handleViewEmr(patient)}>
                      📋 Xem EMR
                    </DropdownItem>
                    <DropdownItem key="edit" onPress={() => handleEdit(patient)}>
                      ✏️ Chỉnh sửa
                    </DropdownItem>
                    <DropdownItem key="toggle" onPress={() => toggleStatus(patient.id)}>
                      {patient.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                    </DropdownItem>
                    <DropdownItem key="delete" className="text-danger" color="danger" onPress={() => deletePatient(patient.id)}>
                      🗑️ Xóa
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
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
    <>
      <ToastNotification
        message={toast.toast.message}
        type={toast.toast.type}
        isVisible={toast.toast.isVisible}
        onClose={toast.hideToast}
        duration={toast.toast.duration}
      />
      <AdminFrame title="Quản Lý Người Dùng">
        <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

        {/* Modal Add/Edit */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>{currentPatient ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Họ và tên"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="user@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      isReadOnly={!!currentPatient}
                      description={currentPatient ? "Email không thể thay đổi" : ""}
                      isRequired
                    />
                    {!currentPatient && (
                      <Input
                        label="Mật khẩu"
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        description="Mật khẩu cho tài khoản mới"
                        isRequired
                      />
                    )}
                    <Input
                      label="Số điện thoại"
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      isRequired
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
                      selectedKeys={formData.gender ? new Set([formData.gender]) : new Set()}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] || '';
                        setFormData({ ...formData, gender: value });
                      }}
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
                      selectedKeys={formData.bloodType !== undefined && formData.bloodType !== null ? new Set([formData.bloodType]) : new Set()}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData({ ...formData, bloodType: value !== undefined ? value : '' });
                      }}
                    >
                      {bloodTypeOptions.map((item) => (
                        <SelectItem key={item.value || 'empty'} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input label="Địa chỉ" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="col-span-2" />
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

        {/* EMR Modal */}
        <Modal isOpen={isEmrOpen} onOpenChange={onEmrOpenChange} size="3xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">Hồ Sơ Bệnh Án Điện Tử (EMR)</h2>
                  {selectedPatientForEmr && (
                    <p className="text-sm text-gray-500">
                      Bệnh nhân: {selectedPatientForEmr.fullName} • {selectedPatientForEmr.email}
                    </p>
                  )}
                </ModalHeader>
                <ModalBody>
                  {selectedPatientForEmr && (
                    <div className="space-y-6">
                      {/* Basic info */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold mb-3 text-lg">📋 Thông Tin Bệnh Nhân</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Họ tên</p>
                            <p className="font-medium">{selectedPatientForEmr.fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Giới tính</p>
                            <p className="font-medium">
                              {selectedPatientForEmr.gender === 'male' ? 'Nam' : selectedPatientForEmr.gender === 'female' ? 'Nữ' : 'Khác'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ngày sinh</p>
                            <p className="font-medium">{selectedPatientForEmr.dateOfBirth || 'Chưa cập nhật'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Nhóm máu</p>
                            <p className="font-medium">{selectedPatientForEmr.bloodType || 'Chưa xác định'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Địa chỉ</p>
                            <p className="font-medium">
                              {typeof selectedPatientForEmr.address === 'object'
                                ? (selectedPatientForEmr.address?.full || 'Chưa cập nhật')
                                : (selectedPatientForEmr.address || 'Chưa cập nhật')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mockup history, prescriptions, tests */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 text-lg">🏥 Lịch Sử Khám Bệnh</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Khám tổng quát</p>
                              <span className="text-xs text-gray-500">15/10/2025</span>
                            </div>
                            <p className="text-sm text-gray-600">Bác sĩ: Dr. Nguyễn Văn A</p>
                            <p className="text-sm text-gray-600">Chẩn đoán: Sức khỏe tốt, theo dõi định kỳ</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Khám nội khoa</p>
                              <span className="text-xs text-gray-500">01/09/2025</span>
                            </div>
                            <p className="text-sm text-gray-600">Bác sĩ: Dr. Trần Thị B</p>
                            <p className="text-sm text-gray-600">Chẩn đoán: Viêm họng nhẹ</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 text-lg">💊 Đơn Thuốc</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <div>
                              <p className="font-medium text-sm">Paracetamol 500mg</p>
                              <p className="text-xs text-gray-600">2 viên x 3 lần/ngày sau ăn</p>
                            </div>
                            <span className="text-xs text-gray-500">15/10/2025</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <div>
                              <p className="font-medium text-sm">Vitamin C 1000mg</p>
                              <p className="text-xs text-gray-600">1 viên x 1 lần/ngày</p>
                            </div>
                            <span className="text-xs text-gray-500">01/09/2025</span>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 text-lg">🔬 Kết Quả Xét Nghiệm</h3>
                        <div className="space-y-2">
                          <div className="p-2 bg-purple-50 rounded">
                            <p className="font-medium text-sm">Xét nghiệm máu tổng quát</p>
                            <p className="text-xs text-gray-600">Ngày: 15/10/2025 • Kết quả: Bình thường</p>
                          </div>
                          <div className="p-2 bg-purple-50 rounded">
                            <p className="font-medium text-sm">Xét nghiệm đường huyết</p>
                            <p className="text-xs text-gray-600">Ngày: 15/10/2025 • Kết quả: 95 mg/dL (Bình thường)</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-sm text-gray-500 italic">
                        * Đây là dữ liệu mockup để demo giao diện
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={onClose}>
                    Đóng
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

export default Patient;
