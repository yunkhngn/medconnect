import React, { useState } from 'react';
import { AdminFrame, Grid } from '@/components/layouts/';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Avatar,
  Divider,
  Switch,
  Select,
  SelectItem,
} from '@heroui/react';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    GET_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    UPDATE_AVATAR: '/user/avatar',
  },
};

const Setting = () => {
  const [isSaving, setIsSaving] = useState(false);

  // Profile Data
  const [profileData, setProfileData] = useState({
    fullName: 'Admin User',
    email: 'admin@medconnect.vn',
    phone: '0901234567',
    address: 'Hà Nội, Việt Nam',
    avatar: '/assets/homepage/mockup-avatar.jpg',
  });

  // Password Data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    systemUpdates: false,
  });

  // Language & Theme
  const [preferences, setPreferences] = useState({
    language: 'vi',
    theme: 'light',
    timezone: 'Asia/Ho_Chi_Minh',
  });

  const languages = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
  ];

  const themes = [
    { value: 'light', label: 'Sáng' },
    { value: 'dark', label: 'Tối' },
    { value: 'auto', label: 'Tự động' },
  ];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: API call
      setTimeout(() => {
        alert('Đã lưu thông tin cá nhân!');
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: API call
      setTimeout(() => {
        alert('Đã đổi mật khẩu thành công!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error changing password:', error);
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      // TODO: API call
      setTimeout(() => {
        alert('Đã lưu cài đặt thông báo!');
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving notifications:', error);
      setIsSaving(false);
    }
  };

  // Left Panel - Quick Info & Avatar
  const leftPanel = (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6 text-center">
          <Avatar
            src={profileData.avatar}
            className="w-24 h-24 mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold">{profileData.fullName}</h3>
          <p className="text-sm text-gray-600">{profileData.email}</p>
          <Button size="sm" variant="flat" className="mt-4" fullWidth>
            Thay đổi ảnh đại diện
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h4 className="font-semibold mb-3">Thông tin tài khoản</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Vai trò:</span>
              <span className="font-medium">Admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày tham gia:</span>
              <span className="font-medium">15/01/2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="text-green-600 font-medium">Hoạt động</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Right Panel - Settings Forms
  const rightPanel = (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Thông tin cá nhân</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Input
            label="Họ và tên"
            value={profileData.fullName}
            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            disabled
          />
          <Input
            label="Số điện thoại"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
          />
          <Input
            label="Địa chỉ"
            value={profileData.address}
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
          />
          <Button color="primary" onPress={handleSaveProfile} isLoading={isSaving}>
            Lưu thay đổi
          </Button>
        </CardBody>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
          <Button color="primary" onPress={handleChangePassword} isLoading={isSaving}>
            Đổi mật khẩu
          </Button>
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Cài đặt thông báo</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Thông báo qua Email</p>
              <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
            </div>
            <Switch
              isSelected={notifications.emailNotifications}
              onValueChange={(value) => setNotifications({ ...notifications, emailNotifications: value })}
            />
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Thông báo Push</p>
              <p className="text-sm text-gray-600">Nhận thông báo đẩy trên trình duyệt</p>
            </div>
            <Switch
              isSelected={notifications.pushNotifications}
              onValueChange={(value) => setNotifications({ ...notifications, pushNotifications: value })}
            />
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Nhắc nhở lịch hẹn</p>
              <p className="text-sm text-gray-600">Nhận nhắc nhở về lịch hẹn</p>
            </div>
            <Switch
              isSelected={notifications.appointmentReminders}
              onValueChange={(value) => setNotifications({ ...notifications, appointmentReminders: value })}
            />
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Cập nhật hệ thống</p>
              <p className="text-sm text-gray-600">Nhận thông báo về cập nhật mới</p>
            </div>
            <Switch
              isSelected={notifications.systemUpdates}
              onValueChange={(value) => setNotifications({ ...notifications, systemUpdates: value })}
            />
          </div>
          <Button color="primary" onPress={handleSaveNotifications} isLoading={isSaving}>
            Lưu cài đặt
          </Button>
        </CardBody>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Tùy chỉnh</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Select
            label="Ngôn ngữ"
            selectedKeys={[preferences.language]}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
          >
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Giao diện"
            selectedKeys={[preferences.theme]}
            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
          >
            {themes.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                {theme.label}
              </SelectItem>
            ))}
          </Select>
          <Button color="primary" isLoading={isSaving}>
            Lưu tùy chỉnh
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <AdminFrame title="Cài Đặt Tài Khoản">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
    </AdminFrame>
  );
};

export default Setting;