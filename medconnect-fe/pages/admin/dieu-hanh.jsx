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
  Spinner,
} from '@heroui/react';
import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  changeAdminPassword,
} from '@/services/adminService';

const Manage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isPasswordModalOpen,
    onOpen: onPasswordModalOpen,
    onOpenChange: onPasswordModalOpenChange,
  } = useDisclosure();

  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [passwordData, setPasswordData] = useState({
    userId: null,
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'blocked', label: 'Đã khóa' },
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [searchQuery, selectedStatus, admins]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAllAdmins();
      if (response.success) {
        setAdmins(response.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError(error.message || 'Không thể tải danh sách admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const response = await createAdmin(formData);
      if (response.success) {
        setSuccess('Tạo admin thành công!');
        await fetchAdmins();
        resetForm();
        setTimeout(() => onOpenChange(false), 1500);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setError(error.message || 'Không thể tạo admin');
    }
  };

  const handleUpdateAdmin = async () => {
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('Vui lòng điền email');
      return;
    }

    try {
      const updateData = {
        email: formData.email,
      };

      const response = await updateAdmin(currentAdmin.userId, updateData);
      if (response.success) {
        setSuccess('Cập nhật admin thành công!');
        await fetchAdmins();
        resetForm();
        setTimeout(() => onOpenChange(false), 1500);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      setError(error.message || 'Không thể cập nhật admin');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa admin này? Hành động này không thể hoàn tác!')) return;

    try {
      const response = await deleteAdmin(id);
      if (response.success) {
        setSuccess('Xóa admin thành công!');
        await fetchAdmins();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError(error.message || 'Không thể xóa admin');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const shouldDisable = currentStatus === 'active';
    
    try {
      const response = await toggleAdminStatus(id, shouldDisable);
      if (response.success) {
        setSuccess(response.message);
        await fetchAdmins();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setError(error.message || 'Không thể thay đổi trạng thái');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const response = await changeAdminPassword(passwordData.userId, passwordData.newPassword);
      if (response.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setPasswordData({ userId: null, newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          onPasswordModalOpenChange(false);
          setSuccess('');
        }, 1500);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message || 'Không thể đổi mật khẩu');
    }
  };

  const filterAdmins = () => {
    let filtered = admins;

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.userId.toString().includes(searchQuery)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    setFilteredAdmins(filtered);
  };

  const handleEdit = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      email: admin.email,
      password: '', // Không hiển thị password khi edit
    });
    setError('');
    setSuccess('');
    onOpen();
  };

  const handleAdd = () => {
    setCurrentAdmin(null);
    resetForm();
    setError('');
    setSuccess('');
    onOpen();
  };

  const handleOpenPasswordModal = (admin) => {
    setPasswordData({
      userId: admin.userId,
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    onPasswordModalOpen();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
    });
    setCurrentAdmin(null);
  };

  const handleSubmit = () => {
    if (currentAdmin) {
      handleUpdateAdmin();
    } else {
      handleCreateAdmin();
    }
  };

  const paginatedAdmins = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredAdmins.slice(start, end);
  }, [page, filteredAdmins]);

  const pages = Math.ceil(filteredAdmins.length / rowsPerPage);

  // Left Panel - Stats & Filters
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tổng Admin</p>
            <p className="text-2xl font-bold text-blue-600">{admins.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {admins.filter((a) => a.status === 'active').length}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Đã khóa</p>
            <p className="text-2xl font-bold text-red-600">
              {admins.filter((a) => a.status === 'blocked').length}
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
    </div>
  );

  // Right Panel - Table
  const rightPanel = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Tìm kiếm admin (email, ID)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
          startContent={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
        <Button color="primary" onPress={handleAdd}>
          + Thêm Admin
        </Button>
      </div>

      <Table aria-label="Admins table">
        <TableHeader>
          <TableColumn>ADMIN</TableColumn>
          <TableColumn>USER ID</TableColumn>
          <TableColumn>FIREBASE UID</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Đang tải..." />}
          emptyContent="Không có dữ liệu"
        >
          {paginatedAdmins.map((admin) => (
            <TableRow key={admin.userId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      admin.email
                    )}&background=random`}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">{admin.email}</p>
                    <p className="text-xs text-gray-500">👑 Admin</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  #{admin.userId}
                </Chip>
              </TableCell>
              <TableCell>
                <p className="text-xs text-gray-500 font-mono">{admin.firebaseUid?.slice(0, 12)}...</p>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="warning">
                  {admin.role}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip
                  color={admin.status === 'active' ? 'success' : admin.status === 'blocked' ? 'danger' : 'default'}
                  size="sm"
                >
                  {admin.status === 'active' ? 'Hoạt động' : admin.status === 'blocked' ? 'Đã khóa' : 'Không xác định'}
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
                    <DropdownItem key="edit" onPress={() => handleEdit(admin)}>
                      Chỉnh sửa
                    </DropdownItem>
                    <DropdownItem key="password" onPress={() => handleOpenPasswordModal(admin)}>
                      Đổi mật khẩu
                    </DropdownItem>
                    <DropdownItem key="toggle" onPress={() => handleToggleStatus(admin.userId, admin.status)}>
                      {admin.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      onPress={() => handleDeleteAdmin(admin.userId)}
                    >
                      Xóa
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pages > 1 && (
        <div className="flex justify-center">
          <Pagination total={pages} page={page} onChange={setPage} showControls />
        </div>
      )}
    </div>
  );

  return (
    <AdminFrame title="Quản Lý Admin - Điều Hành">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{currentAdmin ? 'Chỉnh sửa Admin' : 'Thêm Admin Mới'}</ModalHeader>
              <ModalBody>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="admin@medconnect.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    isRequired
                  />
                  {!currentAdmin && (
                    <Input
                      label="Mật khẩu"
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      isRequired
                      description="Mật khẩu mặc định cho admin mới"
                    />
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  {currentAdmin 
                    ? 'Cập nhật email của admin. Để đổi mật khẩu, vui lòng sử dụng chức năng "Đổi mật khẩu".' 
                    : 'Tạo tài khoản admin mới với email và mật khẩu. Admin có thể đổi mật khẩu sau.'}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {currentAdmin ? 'Cập nhật' : 'Thêm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Password Change Modal */}
      <Modal isOpen={isPasswordModalOpen} onOpenChange={onPasswordModalOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Đổi Mật Khẩu Admin</ModalHeader>
              <ModalBody>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Mật khẩu mới"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Xác nhận mật khẩu"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    isRequired
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button color="primary" onPress={handleChangePassword}>
                  Đổi mật khẩu
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminFrame>
  );
};

export default Manage;