"use client";

import React, { useState, useEffect } from 'react';
import { AdminFrame, Grid } from '@/components/layouts/';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { useAvatar } from '@/hooks/useAvatar';
import ToastNotification from '@/components/ui/ToastNotification';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Avatar,
  Divider,
} from '@heroui/react';
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  User, 
  Mail, 
  Phone,
  Upload,
  Camera
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getApiUrl } from "@/utils/api";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const Setting = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const { getAvatarUrl, uploadAvatar, uploading: uploadingAvatar } = useAvatar();
  
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile Data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
  });

  // Password Data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch admin profile
  useEffect(() => {
    if (authUser && auth.currentUser) {
      fetchAdminProfile();
    }
  }, [authUser]);

  const fetchAdminProfile = async () => {
    setLoading(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      // Get basic info from Firebase
      const email = firebaseUser.email || '';
      const displayName = firebaseUser.displayName || '';
      
      // Get info from backend
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${getApiUrl()}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
  });

        if (response.ok) {
          const data = await response.json();
          setProfileData({
            name: data.name || displayName || '',
            email: data.email || email,
            phone: data.phone || '',
            avatar: data.avatar || null,
          });
        } else {
          // Fallback to Firebase data
          setProfileData({
            name: displayName || '',
            email: email,
            phone: '',
            avatar: firebaseUser.photoURL || null,
          });
        }
      } catch (backendError) {
        console.error('Error fetching profile from backend:', backendError);
        // Fallback to Firebase data
        setProfileData({
          name: displayName || '',
          email: email,
          phone: '',
          avatar: firebaseUser.photoURL || null,
        });
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }

    setIsSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      // Update via backend API
        const response = await fetch(`${getApiUrl()}/user/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profileData.name,
          phone: profileData.phone || '',
          }),
        });

        if (response.ok) {
        const data = await response.json();
        toast.success('Đã lưu thông tin cá nhân!');
        // Refresh profile data
        await fetchAdminProfile();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Lỗi khi lưu thông tin');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Lỗi khi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.newPassword);
      
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Change password error:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Mật khẩu hiện tại không đúng');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Mật khẩu mới quá yếu');
      } else {
        toast.error('Không thể đổi mật khẩu');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File phải là hình ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file phải nhỏ hơn 5MB');
      return;
    }

    try {
      const avatarUrl = await uploadAvatar(file);
      setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
      
      // Update backend
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await fetch(`${getApiUrl()}/avatar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ avatarUrl }),
        });
      }
      
      toast.success('Đã cập nhật ảnh đại diện!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Không thể tải ảnh lên');
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Yếu', color: 'danger' };
    if (password.length < 8) return { label: 'Trung bình', color: 'warning' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: 'Mạnh', color: 'success' };
    }
    return { label: 'Khá', color: 'primary' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const avatarUrl = getAvatarUrl(auth.currentUser, profileData.avatar);

  // Left Panel - Quick Info & Avatar
  const leftPanel = (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardBody className="p-6 text-center">
          <div className="relative inline-block mb-4">
          <Avatar
              src={avatarUrl}
              className="w-32 h-32 mx-auto"
              showFallback
              fallback={
                <User className="w-16 h-16 text-default-400" />
              }
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-2 bg-teal-500 text-white rounded-full cursor-pointer hover:bg-teal-600 transition-colors shadow-lg"
            >
              <Camera size={20} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>
          {uploadingAvatar && (
            <p className="text-sm text-gray-500 mb-2">Đang tải ảnh lên...</p>
          )}
          <h3 className="text-xl font-semibold text-gray-800">{profileData.name || 'Admin User'}</h3>
          <p className="text-sm text-gray-600">{profileData.email || 'admin@medconnect.vn'}</p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
              Quản trị viên
            </span>
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-lg">
        <CardBody className="p-6">
          <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-teal-600" size={20} />
            Thông tin tài khoản
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vai trò:</span>
              <span className="font-medium text-gray-800">Admin</span>
            </div>
            <Divider />
            <div className="flex justify-between items-center">
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
      <Card className="shadow-lg">
        <CardHeader className="flex gap-3 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <User size={24} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h3>
              <p className="text-sm text-gray-600">Cập nhật thông tin tài khoản của bạn</p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="p-6 space-y-4">
          <Input
            label="Họ và tên"
            placeholder={profileData.name || "Nhập họ và tên"}
            value={profileData.name}
            onValueChange={(v) => setProfileData({ ...profileData, name: v })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<User className="text-default-400" size={20} />}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />
          <Input
            label="Email"
            type="email"
            value={profileData.email}
            disabled
            variant="bordered"
            labelPlacement="outside"
            startContent={<Mail className="text-default-400" size={20} />}
            description="Email không thể thay đổi"
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 bg-gray-50"
            }}
          />
          <Input
            label="Số điện thoại"
            placeholder={profileData.phone || "Nhập số điện thoại"}
            value={profileData.phone}
            onValueChange={(v) => setProfileData({ ...profileData, phone: v })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<Phone className="text-default-400" size={20} />}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />
          <div className="flex justify-end pt-2">
            <Button 
              color="primary" 
              onPress={handleSaveProfile} 
              isLoading={isSaving}
              size="lg"
              className="font-semibold"
            >
            Lưu thay đổi
          </Button>
          </div>
        </CardBody>
      </Card>

      {/* Change Password */}
      <Card className="shadow-lg">
        <CardHeader className="flex gap-3 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Đổi mật khẩu</h3>
              <p className="text-sm text-gray-600">Thay đổi mật khẩu đăng nhập</p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="p-6 space-y-4">
          {/* Security Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Lưu ý bảo mật:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                <li>Nên sử dụng kết hợp chữ hoa, chữ thường và số</li>
                <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
              </ul>
            </div>
          </div>

          <Input
            type={showCurrentPassword ? "text" : "password"}
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            value={passwordData.currentPassword}
            onValueChange={(v) => setPasswordData({ ...passwordData, currentPassword: v })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<Key className="text-default-400" size={20} />}
            endContent={
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="focus:outline-none"
              >
                {showCurrentPassword ? (
                  <EyeOff className="text-default-400" size={20} />
                ) : (
                  <Eye className="text-default-400" size={20} />
                )}
              </button>
            }
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-purple-500 focus-within:!border-purple-500"
            }}
          />

          <div className="space-y-2">
          <Input
              type={showNewPassword ? "text" : "password"}
            label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
            value={passwordData.newPassword}
              onValueChange={(v) => setPasswordData({ ...passwordData, newPassword: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Lock className="text-default-400" size={20} />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="focus:outline-none"
                >
                  {showNewPassword ? (
                    <EyeOff className="text-default-400" size={20} />
                  ) : (
                    <Eye className="text-default-400" size={20} />
                  )}
                </button>
              }
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-purple-500 focus-within:!border-purple-500"
              }}
            />
            {passwordStrength && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Độ mạnh:</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  passwordStrength.color === 'danger' ? 'bg-red-100 text-red-700' :
                  passwordStrength.color === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  passwordStrength.color === 'success' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <Input
            type={showConfirmPassword ? "text" : "password"}
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            value={passwordData.confirmPassword}
            onValueChange={(v) => setPasswordData({ ...passwordData, confirmPassword: v })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<ShieldCheck className="text-default-400" size={20} />}
            endContent={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="text-default-400" size={20} />
                ) : (
                  <Eye className="text-default-400" size={20} />
                )}
              </button>
            }
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-purple-500 focus-within:!border-purple-500"
            }}
          />

          <div className="flex justify-end pt-2">
            <Button
              color="secondary"
              size="lg"
              startContent={<Key size={20} />}
              onPress={handleChangePassword}
              isLoading={changingPassword}
              className="font-semibold"
            >
            Đổi mật khẩu
          </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <AdminFrame title="Cài Đặt Tài Khoản">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </AdminFrame>
    );
  }

  return (
    <AdminFrame title="Cài Đặt Tài Khoản">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
      <ToastNotification
        message={toast.toast.message}
        type={toast.toast.type}
        isVisible={toast.toast.isVisible}
        onClose={toast.hideToast}
        duration={toast.toast.duration}
      />
    </AdminFrame>
  );
};

export default Setting;