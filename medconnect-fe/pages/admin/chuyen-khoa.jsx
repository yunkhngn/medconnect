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
  Spinner,
  Textarea,
} from '@heroui/react';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    GET_SPECIALTIES: '/specialties',
    CREATE_SPECIALTY: '/specialties',
    UPDATE_SPECIALTY: (id) => `/specialties/${id}`,
    DELETE_SPECIALTY: (id) => `/specialties/${id}`,
  },
};

const ChuyenKhoa = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [specialties, setSpecialties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    onlinePrice: '',
    offlinePrice: '',
  });

  const [errors, setErrors] = useState({});

  const mockData = [
    { 
      id: 1, 
      name: 'Nội tổng quát', 
      description: 'Khám và điều trị các bệnh nội khoa tổng hợp', 
      onlinePrice: 250000,
      offlinePrice: 400000 
    },
    { 
      id: 2, 
      name: 'Da liễu', 
      description: 'Chẩn đoán và điều trị các bệnh về da', 
      onlinePrice: 180000,
      offlinePrice: 300000 
    },
    { 
      id: 3, 
      name: 'Răng - Hàm - Mặt', 
      description: 'Chuyên khoa điều trị và thẩm mỹ răng miệng', 
      onlinePrice: 200000,
      offlinePrice: 400000 
    },
  ];

  useEffect(() => {
    fetchSpecialties();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, specialties]);

  const fetchSpecialties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_SPECIALTIES}`);
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data);
      } else {
        // Fallback to mock data if API fails
        setSpecialties(mockData);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      // Fallback to mock data
      setSpecialties(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên chuyên khoa không được để trống';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }
    
    if (!formData.onlinePrice || isNaN(formData.onlinePrice) || formData.onlinePrice <= 0) {
      newErrors.onlinePrice = 'Giá khám online phải là số dương';
    }
    
    if (!formData.offlinePrice || isNaN(formData.offlinePrice) || formData.offlinePrice <= 0) {
      newErrors.offlinePrice = 'Giá khám trực tiếp phải là số dương';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        onlinePrice: parseInt(formData.onlinePrice),
        offlinePrice: parseInt(formData.offlinePrice)
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_SPECIALTY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newData = await response.json();
        setSpecialties([...specialties, newData]);
      } else {
        // Fallback for demo
        const newData = { id: Date.now(), ...payload };
        setSpecialties([...specialties, newData]);
      }
      resetForm();
    } catch (error) {
      console.error('Error creating specialty:', error);
      // Fallback for demo
      const newData = { 
        id: Date.now(), 
        ...formData, 
        onlinePrice: parseInt(formData.onlinePrice),
        offlinePrice: parseInt(formData.offlinePrice)
      };
      setSpecialties([...specialties, newData]);
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        onlinePrice: parseInt(formData.onlinePrice),
        offlinePrice: parseInt(formData.offlinePrice)
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_SPECIALTY(current.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSpecialties(specialties.map((s) => (s.id === current.id ? updatedData : s)));
      } else {
        // Fallback for demo
        setSpecialties(specialties.map((s) => (s.id === current.id ? { ...s, ...payload } : s)));
      }
      resetForm();
    } catch (error) {
      console.error('Error updating specialty:', error);
      // Fallback for demo
      setSpecialties(specialties.map((s) => (s.id === current.id ? { 
        ...s, 
        ...formData, 
        onlinePrice: parseInt(formData.onlinePrice),
        offlinePrice: parseInt(formData.offlinePrice)
      } : s)));
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa chuyên khoa này?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_SPECIALTY(id)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSpecialties(specialties.filter((s) => s.id !== id));
      } else {
        // Fallback for demo
        setSpecialties(specialties.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting specialty:', error);
      // Fallback for demo  
      setSpecialties(specialties.filter((s) => s.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let filteredList = specialties;
    if (searchQuery) {
      filteredList = filteredList.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFiltered(filteredList);
  };

  const handleEdit = (specialty) => {
    setCurrent(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description,
      onlinePrice: specialty.onlinePrice?.toString() || '',
      offlinePrice: specialty.offlinePrice?.toString() || '',
    });
    setErrors({});
    onOpen();
  };

  const handleAdd = () => {
    setCurrent(null);
    resetForm();
    setErrors({});
    onOpen();
  };

  const handleSubmit = () => {
    if (current) handleUpdate();
    else handleCreate();
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      onlinePrice: '', 
      offlinePrice: '' 
    });
    setErrors({});
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const paginated = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [page, filtered]);

  const pages = Math.ceil(filtered.length / rowsPerPage);

  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê chuyên khoa</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng số chuyên khoa</p>
            <p className="text-2xl font-bold text-blue-600">{specialties.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Giá online trung bình</p>
            <p className="text-xl font-bold text-green-600">
              {specialties.length > 0 
                ? formatCurrency(Math.round(specialties.reduce((sum, s) => sum + (s.onlinePrice || 0), 0) / specialties.length))
                : '0 ₫'
              }
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Giá offline trung bình</p>
            <p className="text-xl font-bold text-purple-600">
              {specialties.length > 0 
                ? formatCurrency(Math.round(specialties.reduce((sum, s) => sum + (s.offlinePrice || 0), 0) / specialties.length))
                : '0 ₫'
              }
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Chênh lệch giá trung bình</p>
            <p className="text-lg font-bold text-orange-600">
              {specialties.length > 0 
                ? formatCurrency(Math.round(specialties.reduce((sum, s) => sum + ((s.offlinePrice || 0) - (s.onlinePrice || 0)), 0) / specialties.length))
                : '0 ₫'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const rightPanel = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Tìm kiếm chuyên khoa..."
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
          + Thêm Chuyên Khoa
        </Button>
      </div>

      <Table aria-label="Specialty table">
        <TableHeader>
          <TableColumn>TÊN CHUYÊN KHOA</TableColumn>
          <TableColumn>MÔ TẢ</TableColumn>
          <TableColumn>GIÁ ONLINE</TableColumn>
          <TableColumn>GIÁ OFFLINE</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} loadingContent={<Spinner label="Đang tải..." />} emptyContent="Không có dữ liệu">
          {paginated.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="max-w-xs truncate">{item.description}</TableCell>
              <TableCell>
                <span className="text-green-600 font-medium">
                  {formatCurrency(item.onlinePrice)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-blue-600 font-medium">
                  {formatCurrency(item.offlinePrice)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="light" onPress={() => handleEdit(item)}>
                    Sửa
                  </Button>
                  <Button size="sm" color="danger" variant="light" onPress={() => handleDelete(item.id)}>
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

  return (
    <AdminFrame title="Quản Lý Chuyên Khoa">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{current ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Tên chuyên khoa"
                    placeholder="Ví dụ: Nội tổng quát"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                  />
                  <Textarea
                    label="Mô tả"
                    placeholder="Nhập mô tả chuyên khoa..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    minRows={2}
                    isInvalid={!!errors.description}
                    errorMessage={errors.description}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Giá khám online"
                      placeholder="300000"
                      value={formData.onlinePrice}
                      onChange={(e) => setFormData({ ...formData, onlinePrice: e.target.value })}
                      type="number"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">₫</span>
                        </div>
                      }
                      isInvalid={!!errors.onlinePrice}
                      errorMessage={errors.onlinePrice}
                    />
                    <Input
                      label="Giá khám trực tiếp"
                      placeholder="500000"
                      value={formData.offlinePrice}
                      onChange={(e) => setFormData({ ...formData, offlinePrice: e.target.value })}
                      type="number"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">₫</span>
                        </div>
                      }
                      isInvalid={!!errors.offlinePrice}
                      errorMessage={errors.offlinePrice}
                    />
                  </div>
                  {formData.onlinePrice && formData.offlinePrice && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Preview giá:</p>
                      <div className="flex justify-between text-sm">
                        <span>Online: <strong className="text-green-600">{formatCurrency(parseInt(formData.onlinePrice) || 0)}</strong></span>
                        <span>Offline: <strong className="text-blue-600">{formatCurrency(parseInt(formData.offlinePrice) || 0)}</strong></span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Chênh lệch: {formatCurrency((parseInt(formData.offlinePrice) || 0) - (parseInt(formData.onlinePrice) || 0))}
                      </p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button color="primary" onPress={() => { handleSubmit(); onClose(); }}>
                  {current ? 'Cập nhật' : 'Thêm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminFrame>
  );
};

export default ChuyenKhoa;
