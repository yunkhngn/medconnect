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
    status: 'active',
  });

  const statusOptions = [
    { value: 'active', label: 'Hoạt động', color: 'success' },
    { value: 'inactive', label: 'Ngừng hoạt động', color: 'danger' },
  ];

  const mockData = [
    { id: 1, name: 'Nội tổng quát', description: 'Khám và điều trị các bệnh nội khoa tổng hợp', status: 'active' },
    { id: 2, name: 'Da liễu', description: 'Chẩn đoán và điều trị các bệnh về da', status: 'active' },
    { id: 3, name: 'Răng - Hàm - Mặt', description: 'Chuyên khoa điều trị và thẩm mỹ răng miệng', status: 'inactive' },
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
      // TODO: Gọi API thật tại đây
      setTimeout(() => {
        setSpecialties(mockData);
        setIsLoading(false);
      }, 400);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // TODO: API thật
      const newData = { id: Date.now(), ...formData };
      setSpecialties([...specialties, newData]);
      resetForm();
    } catch (error) {
      console.error('Error creating specialty:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      // TODO: API thật
      setSpecialties(specialties.map((s) => (s.id === current.id ? { ...s, ...formData } : s)));
      resetForm();
    } catch (error) {
      console.error('Error updating specialty:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa chuyên khoa này?')) return;
    try {
      // TODO: API thật
      setSpecialties(specialties.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting specialty:', error);
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
      status: specialty.status,
    });
    onOpen();
  };

  const handleAdd = () => {
    setCurrent(null);
    resetForm();
    onOpen();
  };

  const handleSubmit = () => {
    if (current) handleUpdate();
    else handleCreate();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'active' });
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
            <p className="text-sm text-gray-600">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {specialties.filter((s) => s.status === 'active').length}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Ngừng hoạt động</p>
            <p className="text-2xl font-bold text-red-600">
              {specialties.filter((s) => s.status === 'inactive').length}
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
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} loadingContent={<Spinner label="Đang tải..." />} emptyContent="Không có dữ liệu">
          {paginated.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Chip color={item.status === 'active' ? 'success' : 'danger'} size="sm">
                  {item.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                </Chip>
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
                  />
                  <Textarea
                    label="Mô tả"
                    placeholder="Nhập mô tả chuyên khoa..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    minRows={2}
                  />
                  <Select
                    label="Trạng thái"
                    selectedKeys={[formData.status]}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {statusOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
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
