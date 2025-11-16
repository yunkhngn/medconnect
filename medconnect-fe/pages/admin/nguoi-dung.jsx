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
import { API_BASE_URL } from "@/utils/api";

const Patient = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isEmrOpen,
    onOpen: onEmrOpen,
    onOpenChange: onEmrOpenChange,
  } = useDisclosure();
  const {
    isOpen: isResetPasswordOpen,
    onOpen: onResetPasswordOpen,
    onOpenChange: onResetPasswordOpenChange,
  } = useDisclosure();

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedBloodType, setSelectedBloodType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [selectedPatientForEmr, setSelectedPatientForEmr] = useState(null);
  const [emrEntries, setEmrEntries] = useState([]);
  const [emrLoading, setEmrLoading] = useState(false);
  const [emrError, setEmrError] = useState('');
  const [appointmentsMap, setAppointmentsMap] = useState({});
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [resetPasswordMode, setResetPasswordMode] = useState('email'); // 'email' or 'modal'
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

        // Normalize status - handle both enum values and string values
        let status = p.status;
        if (status) {
          // Convert to lowercase if it's uppercase enum value
          status = status.toLowerCase();
        } else {
          // Default to active if no status
          status = 'active';
        }

        return {
          ...p,
          gender,
          bloodType: p.bloodType || '',
          status: status,
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

  // Optional: toggle status (active/inactive)
  const toggleStatus = async (patient) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      // Normalize status for comparison
      const currentStatus = patient.status ? patient.status.toLowerCase() : 'active';
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      // Use the update patient endpoint instead of status endpoint
      const response = await fetch(`${API_BASE_URL}/admin/patients/${patient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError, 'Response text:', text);
            if (response.ok) {
              // If response is OK but not JSON, assume success
              toast.success(newStatus === 'active' ? 'Đã kích hoạt bệnh nhân' : 'Đã tạm ngưng bệnh nhân');
              // Update local state immediately
              setPatients(prevPatients => 
                prevPatients.map(p => 
                  p.id === patient.id 
                    ? { ...p, status: newStatus }
                    : p
                )
              );
        fetchPatients();
              return;
      } else {
              toast.error('Lỗi khi thay đổi trạng thái');
              return;
            }
          }
        } else {
          // Empty response but status is OK
          if (response.ok) {
            toast.success(newStatus === 'active' ? 'Đã kích hoạt bệnh nhân' : 'Đã tạm ngưng bệnh nhân');
            // Update local state immediately
            setPatients(prevPatients => 
              prevPatients.map(p => 
                p.id === patient.id 
                  ? { ...p, status: newStatus }
                  : p
              )
            );
            fetchPatients();
            return;
          } else {
            toast.error(`Lỗi ${response.status}: ${response.statusText}`);
            return;
          }
        }
      } else {
        // Response is not JSON
        if (response.ok) {
          toast.success(newStatus === 'active' ? 'Đã kích hoạt bệnh nhân' : 'Đã tạm ngưng bệnh nhân');
          // Update local state immediately
          setPatients(prevPatients => 
            prevPatients.map(p => 
              p.id === patient.id 
                ? { ...p, status: newStatus }
                : p
            )
          );
          fetchPatients();
          return;
        } else {
          const text = await response.text().catch(() => '');
          toast.error(`Lỗi ${response.status}: ${text || response.statusText}`);
          return;
        }
      }
      
      if (data && data.success) {
        toast.success(newStatus === 'active' ? 'Đã kích hoạt bệnh nhân' : 'Đã tạm ngưng bệnh nhân');
        // Update local state immediately for better UX
        setPatients(prevPatients => 
          prevPatients.map(p => 
            p.id === patient.id 
              ? { ...p, status: newStatus }
              : p
          )
        );
        // Also fetch from server to ensure consistency
        fetchPatients();
      } else {
        toast.error(data?.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Lỗi khi thay đổi trạng thái: ' + error.message);
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

  const handleViewEmr = async (patient) => {
    setSelectedPatientForEmr(patient);
    setEmrEntries([]);
    setEmrError('');
    onEmrOpen();
    
    // Fetch EMR data
    if (user && patient?.id) {
      setEmrLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patient.id}/entries`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const entries = Array.isArray(data) ? data : [];
          setEmrEntries(entries);
          
          // Fetch doctor names from appointments if available
          const appointmentIds = entries
            .map(e => e.appointment_id)
            .filter(id => id != null);
          
          if (appointmentIds.length > 0 && user) {
            const appointmentsData = {};
            await Promise.all(
              appointmentIds.map(async (apptId) => {
                try {
                  const apptResponse = await fetch(`${API_BASE_URL}/appointments/${apptId}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });
                  if (apptResponse.ok) {
                    const apptData = await apptResponse.json();
                    appointmentsData[apptId] = apptData;
                  }
                } catch (err) {
                  console.error(`Failed to fetch appointment ${apptId}:`, err);
                }
              })
            );
            setAppointmentsMap(appointmentsData);
          }
        } else if (response.status === 404) {
          setEmrEntries([]);
          setEmrError('');
        } else {
          setEmrError('Không thể tải hồ sơ bệnh án');
        }
      } catch (error) {
        console.error('Error fetching EMR:', error);
        setEmrError('Lỗi khi tải hồ sơ bệnh án');
      } finally {
        setEmrLoading(false);
      }
    }
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Thống kê</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Tổng</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{patients.length}</p>
          </div>
          <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Nam</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {patients.filter((p) => p.gender === 'male').length}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-pink-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Nữ</p>
            <p className="text-xl sm:text-2xl font-bold text-pink-600">
              {patients.filter((p) => p.gender === 'female').length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Bộ lọc</h3>
        <div className="space-y-3">
          <Select
            label="Giới tính"
            placeholder="Chọn giới tính"
            size="sm"
            selectedKeys={selectedGender ? new Set([selectedGender]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedGender(value);
            }}
            classNames={{
              trigger: "h-10 sm:h-12",
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
            size="sm"
            selectedKeys={selectedBloodType ? new Set([selectedBloodType]) : new Set(['all'])}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] || 'all';
              setSelectedBloodType(value);
            }}
            classNames={{
              trigger: "h-10 sm:h-12",
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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <Input
          placeholder="Tìm kiếm người dùng..."
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
          <span className="hidden sm:inline">+ Thêm Người Dùng</span>
          <span className="sm:hidden">+ Thêm</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table 
          aria-label="Patients table"
          removeWrapper
          classNames={{
            wrapper: "min-h-[200px]",
            th: "text-xs sm:text-sm",
            td: "text-xs sm:text-sm",
          }}
        >
        <TableHeader>
            <TableColumn className="min-w-[150px]">NGƯỜI DÙNG</TableColumn>
            <TableColumn className="min-w-[120px] hidden md:table-cell">LIÊN HỆ</TableColumn>
            <TableColumn className="min-w-[80px] hidden lg:table-cell">GIỚI TÍNH</TableColumn>
            <TableColumn className="min-w-[150px] hidden lg:table-cell">ĐỊA CHỈ</TableColumn>
            <TableColumn className="min-w-[100px] hidden xl:table-cell">NHÓM MÁU</TableColumn>
            <TableColumn className="min-w-[100px] hidden xl:table-cell">NGÀY THAM GIA</TableColumn>
            <TableColumn className="min-w-[80px]">THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Không có dữ liệu">
          {paginatedPatients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>
                  <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar 
                    src={patient.avatar || null} 
                    size="sm"
                    showFallback
                      className="flex-shrink-0"
                  />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{patient.fullName}</p>
                      <p className="text-xs text-gray-500 truncate hidden sm:block">{patient.email}</p>
                      <div className="sm:hidden space-y-1 mt-1">
                        <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                        <p className="text-xs text-gray-500">{patient.phone}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Chip size="sm" variant="flat" color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'secondary' : 'default'} className="text-xs">
                            {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}
                          </Chip>
                          {patient.bloodType && (
                            <Chip size="sm" variant="flat" color="danger" className="text-xs">
                              {patient.bloodType}
                            </Chip>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
              </TableCell>

                <TableCell className="hidden md:table-cell">
                  <div className="text-xs sm:text-sm">
                    <p className="truncate">{patient.email}</p>
                    <p className="text-gray-500 truncate">{patient.phone}</p>
                </div>
              </TableCell>

                <TableCell className="hidden lg:table-cell">
                <Chip size="sm" variant="flat" color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'secondary' : 'default'}>
                  {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}
                </Chip>
              </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <p className="text-xs sm:text-sm truncate max-w-[200px]">
                  {typeof patient.address === 'object'
                    ? (patient.address?.full || [patient.address?.address_detail, patient.address?.ward_name, patient.address?.district_name, patient.address?.province_name].filter(Boolean).join(', '))
                    : (patient.address || '')}
                </p>
              </TableCell>

                <TableCell className="hidden xl:table-cell">
                <Chip size="sm" variant="flat" color="danger">
                  {patient.bloodType || 'Chưa xác định'}
                </Chip>
              </TableCell>

                <TableCell className="hidden xl:table-cell">
                  <p className="text-xs sm:text-sm">
                  {patient.joinDate ? new Date(patient.joinDate).toLocaleDateString('vi-VN') : ''}
                </p>
              </TableCell>

              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light" className="min-w-[32px]">
                      ⋮
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Thao tác">
                    <DropdownItem key="view-emr" onPress={() => handleViewEmr(patient)}>
                      Xem EMR
                    </DropdownItem>
                    <DropdownItem key="edit" onPress={() => handleEdit(patient)}>
                      Chỉnh sửa
                    </DropdownItem>
                      <DropdownItem key="reset-password" onPress={() => handleResetPassword(patient)}>
                        Reset mật khẩu
                      </DropdownItem>
                    <DropdownItem key="toggle" onPress={() => toggleStatus(patient)}>
                      {(patient.status && patient.status.toLowerCase() === 'active') ? 'Tạm ngưng' : 'Kích hoạt'}
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
      </div>

      <div className="flex justify-center">
        <Pagination 
          total={pages} 
          page={page} 
          onChange={setPage} 
          showControls
          size="sm"
          className="gap-2"
        />
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
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="text-base sm:text-lg">{currentPatient ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</ModalHeader>
                <ModalBody className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                    <Input 
                      label="Địa chỉ" 
                      value={formData.address} 
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                      className="col-span-1 sm:col-span-2" 
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

        {/* EMR Modal */}
        <Modal isOpen={isEmrOpen} onOpenChange={onEmrOpenChange} size="3xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold">Hồ Sơ Bệnh Án Điện Tử (EMR)</h2>
                  {selectedPatientForEmr && (
                    <p className="text-xs sm:text-sm text-gray-500 break-words">
                      Bệnh nhân: {selectedPatientForEmr.fullName} • {selectedPatientForEmr.email}
                    </p>
                  )}
                </ModalHeader>
                <ModalBody className="p-4 sm:p-6">
                  {selectedPatientForEmr && (
                    <div className="space-y-6">
                      {/* Basic info */}
                      <div className="rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold mb-3 text-lg">Thông Tin Bệnh Nhân</h3>
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

                      {/* Lịch Sử Khám Bệnh */}
                      <div className="rounded-lg p-4">
                        <h3 className="font-semibold mb-3 text-lg">Lịch Sử Khám Bệnh</h3>
                        {emrLoading && (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Đang tải...</p>
                          </div>
                        )}
                        {!emrLoading && emrError && (
                          <div className="text-center py-4 text-red-600 text-sm">{emrError}</div>
                        )}
                        {!emrLoading && !emrError && emrEntries.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">Chưa có lịch sử khám bệnh</div>
                        )}
                        {!emrLoading && !emrError && emrEntries.length > 0 && (
                          <div className="space-y-3">
                            {emrEntries.map((entry, idx) => {
                              // Parse diagnosis
                              const diagnosis = entry?.diagnosis || entry?.assessment_plan?.final_diagnosis || [];
                              const primaryDiag = Array.isArray(diagnosis) && diagnosis.length > 0 
                                ? (diagnosis[0]?.text || diagnosis[0]?.primary || diagnosis[0]) 
                                : (typeof diagnosis === 'string' ? diagnosis : null);
                              const diagText = primaryDiag || entry?.chief_complaint || entry?.reason_for_visit || 'Chưa có chẩn đoán';
                              
                              // Get date
                              const date = entry?.visit_date || entry?.encounter?.started_at || entry?.date || entry?.visit_id?.replace('V', '');
                              const dateStr = date ? (isNaN(Date.parse(date)) ? date : new Date(date).toLocaleDateString('vi-VN')) : 'Chưa có ngày';
                              
                              // Get doctor name - check multiple possible fields and appointment
                              const appointment = entry?.appointment_id ? appointmentsMap[entry.appointment_id] : null;
                              const doctorName = entry?.doctor_name 
                                || entry?.doctor?.name 
                                || entry?.doctorName
                                || entry?.encounter?.doctor?.name
                                || entry?.encounter?.doctor_name
                                || appointment?.doctor?.name
                                || appointment?.doctorName
                                || (entry?.doctor_id ? 'Bác sĩ (ID: ' + entry.doctor_id + ')' : null)
                                || 'Chưa có thông tin';
                              
                              // Get visit type
                              const visitType = entry?.visit_type || entry?.type || 'Khám';
                              
                              return (
                                <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="font-medium">{visitType === 'online' ? 'Khám online' : visitType === 'offline' ? 'Khám offline' : visitType}</p>
                                    <span className="text-xs text-gray-500">{dateStr}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">Bác sĩ: {doctorName}</p>
                                  <p className="text-sm text-gray-600">Chẩn đoán: {diagText}</p>
                                  {entry?.notes && (
                                    <p className="text-sm text-gray-500 mt-1 italic">Ghi chú: {entry.notes}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Đơn Thuốc */}
                      <div className="rounded-lg p-4">
                        <h3 className="font-semibold mb-3 text-lg">Đơn Thuốc</h3>
                        {emrLoading && (
                          <div className="text-center py-4 text-sm text-gray-500">Đang tải...</div>
                        )}
                        {!emrLoading && !emrError && emrEntries.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">Chưa có đơn thuốc</div>
                        )}
                        {!emrLoading && !emrError && emrEntries.length > 0 && (
                          <div className="space-y-2">
                            {emrEntries.map((entry, entryIdx) => {
                              const prescriptions = entry?.prescriptions || entry?.medications || [];
                              const date = entry?.visit_date || entry?.encounter?.started_at || entry?.date || entry?.visit_id?.replace('V', '');
                              const dateStr = date ? (isNaN(Date.parse(date)) ? date : new Date(date).toLocaleDateString('vi-VN')) : '';
                              
                              if (prescriptions.length === 0) return null;
                              
                              return prescriptions.map((med, medIdx) => (
                                <div key={`${entryIdx}-${medIdx}`} className="flex justify-between items-center p-2 bg-green-50 rounded">
                                  <div>
                                    <p className="font-medium text-sm">{med.name || med.medication_name || 'Chưa có tên thuốc'}</p>
                                    <p className="text-xs text-gray-600">
                                      {med.dosage && `Liều: ${med.dosage}`}
                                      {med.frequency && ` • ${med.frequency}`}
                                      {med.duration && ` • ${med.duration}`}
                                    </p>
                                  </div>
                                  {dateStr && <span className="text-xs text-gray-500">{dateStr}</span>}
                                </div>
                              ));
                            }).flat().filter(Boolean)}
                            {emrEntries.every(e => (!e.prescriptions || e.prescriptions.length === 0) && (!e.medications || e.medications.length === 0)) && (
                              <div className="text-center py-4 text-gray-500 text-sm">Chưa có đơn thuốc</div>
                            )}
                          </div>
                        )}
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

        {/* Reset Password Modal */}
        <Modal 
          isOpen={isResetPasswordOpen} 
          onOpenChange={onResetPasswordOpenChange}
          size="md"
          scrollBehavior="inside"
          classNames={{
            base: "max-w-[95vw] sm:max-w-[90vw] md:max-w-md",
            header: "text-base sm:text-lg",
            body: "p-4 sm:p-6",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">Reset Mật Khẩu</h2>
                  <p className="text-sm text-gray-500 font-normal">
                    {selectedUserForReset && `${selectedUserForReset.fullName || selectedUserForReset.email}`}
                  </p>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        Mật khẩu mới sẽ được tạo tự động và gửi về email của người dùng.
                      </p>
                    </div>

                    {newPassword && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 mb-2">Mật khẩu mới đã được tạo:</h3>
                        <div className="bg-white rounded p-3 border border-green-300">
                          <code className="text-sm font-mono text-green-900 break-all">{newPassword}</code>
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                          Mật khẩu này cũng đã được gửi về email của người dùng.
                        </p>
                      </div>
                    )}

                    {!newPassword && (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <p>Chọn cách reset mật khẩu:</p>
                          <p className="mt-2 font-medium">Email: {selectedUserForReset?.email}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button
                            color="primary"
                            variant="bordered"
                            onPress={() => handleResetPasswordSubmit(true)}
                            isLoading={isResettingPassword}
                            isDisabled={isResettingPassword}
                            size="sm"
                            className="h-auto py-3"
                          >
                            <div className="text-center">
                              <div className="font-semibold">Gửi email</div>
                              <div className="text-xs text-gray-500 mt-1">Chỉ gửi email</div>
                            </div>
                          </Button>
                          <Button
                            color="primary"
                            variant="bordered"
                            onPress={() => handleResetPasswordSubmit(false)}
                            isLoading={isResettingPassword}
                            isDisabled={isResettingPassword}
                            size="sm"
                            className="h-auto py-3"
                          >
                            <div className="text-center">
                              <div className="font-semibold">Reset tại chỗ</div>
                              <div className="text-xs text-gray-500 mt-1">Hiển thị trong modal</div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="danger" 
                    variant="light" 
                    onPress={onClose}
                    size="sm"
                  >
                    {newPassword ? 'Đóng' : 'Hủy'}
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
