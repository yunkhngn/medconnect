import React, { useState, useEffect } from 'react';
import DoctorFrame from '@/components/layouts/Doctor/Frame';
import { auth } from '@/lib/firebase';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Avatar,
  Divider,
  Chip,
  Spinner
} from "@nextui-org/react";

const DoctorProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    license_id: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    phone: '',
    specialization: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const specializations = [
    { key: "CARDIOLOGY", label: "Tim mạch" },
    { key: "DERMATOLOGY", label: "Da liễu" },
    { key: "INTERNAL_MEDICINE", label: "Nội khoa" },
    { key: "PEDIATRICS", label: "Nhi khoa" },
    { key: "ORTHOPEDICS", label: "Chỉnh hình" },
    { key: "NEUROLOGY", label: "Thần kinh" },
    { key: "PSYCHIATRY", label: "Tâm thần" },
    { key: "GENERAL_SURGERY", label: "Phẫu thuật tổng quát" }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      localStorage.setItem("token", token);
      const response = await fetch('http://localhost:8080/doctor/dashboard/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditedData({
          phone: data.phone || '',
          specialization: data.specialization || ''
        });
      } else {
        showMessage('Không thể tải thông tin hồ sơ', 'error');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showMessage('Lỗi kết nối máy chủ', 'error');
    }
    setIsLoading(false);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      phone: profile.phone || '',
      specialization: profile.specialization || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      phone: profile.phone || '',
      specialization: profile.specialization || ''
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:8080/doctor/dashboard/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          phone: data.phone,
          specialization: data.specialization
        }));
        setIsEditing(false);
        showMessage('Cập nhật thông tin thành công', 'success');
      } else {
        const error = await response.json();
        showMessage(error.message || 'Cập nhật thất bại', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('Lỗi kết nối máy chủ', 'error');
    }
    setIsSaving(false);
  };

  const getSpecializationLabel = (key) => {
    const spec = specializations.find(s => s.key === key);
    return spec ? spec.label : key;
  };

  if (isLoading) {
    return (
      <DoctorFrame title="Hồ sơ">
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DoctorFrame>
    );
  }

  return (
    <DoctorFrame title="Hồ sơ">
      <div className="max-w-4xl mx-auto">
        {/* Message Alert */}
        {message.text && (
          <Card className={`mb-6 ${message.type === 'error' ? 'border-l-4 border-danger' : 'border-l-4 border-success'}`}>
            <CardBody>
              <p className={message.type === 'error' ? 'text-danger' : 'text-success'}>
                {message.text}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Profile Header Card */}
        <Card className="mb-6 shadow-lg">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar
                name={profile.name?.[0] || 'D'}
                className="w-28 h-28 text-3xl bg-gradient-to-br from-teal-400 to-teal-600 text-white"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{profile.name}</h2>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Chip
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                    variant="flat"
                    color="primary"
                  >
                    {getSpecializationLabel(profile.specialization)}
                  </Chip>
                  <Chip
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    variant="flat"
                    color="secondary"
                  >
                    License: {profile.license_id}
                  </Chip>
                </div>
              </div>
              {!isEditing && (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  }
                  onPress={handleEdit}
                >
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Profile Details Card */}
        <Card className="shadow-lg">
          <CardHeader className="flex justify-between items-center px-8 pt-6">
            <h3 className="text-xl font-semibold text-gray-800">Thông tin chi tiết</h3>
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  color="default"
                  variant="flat"
                  onPress={handleCancel}
                  isDisabled={isSaving}
                >
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isLoading={isSaving}
                >
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </CardHeader>
          <Divider />
          <CardBody className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <Input
                  value={profile.name}
                  isReadOnly
                  variant="bordered"
                  startContent={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  classNames={{
                    input: "text-gray-600",
                    inputWrapper: "bg-gray-50"
                  }}
                />
              </div>

              {/* Email - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  value={profile.email}
                  isReadOnly
                  variant="bordered"
                  startContent={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  classNames={{
                    input: "text-gray-600",
                    inputWrapper: "bg-gray-50"
                  }}
                />
              </div>

              {/* Phone - Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <Input
                  value={isEditing ? editedData.phone : profile.phone}
                  onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                  isReadOnly={!isEditing}
                  variant="bordered"
                  placeholder="Nhập số điện thoại"
                  startContent={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                  classNames={{
                    input: isEditing ? "" : "text-gray-600",
                    inputWrapper: isEditing ? "" : "bg-gray-50"
                  }}
                />
              </div>

              {/* Specialization - Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chuyên khoa
                </label>
                {isEditing ? (
                  <Select
                    selectedKeys={[editedData.specialization]}
                    onChange={(e) => setEditedData({ ...editedData, specialization: e.target.value })}
                    variant="bordered"
                    placeholder="Chọn chuyên khoa"
                    startContent={
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    }
                  >
                    {specializations.map((spec) => (
                      <SelectItem key={spec.key} value={spec.key}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={getSpecializationLabel(profile.specialization)}
                    isReadOnly
                    variant="bordered"
                    startContent={
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    }
                    classNames={{
                      input: "text-gray-600",
                      inputWrapper: "bg-gray-50"
                    }}
                  />
                )}
              </div>

              {/* License ID - Read Only */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số giấy phép hành nghề
                </label>
                <Input
                  value={profile.license_id}
                  isReadOnly
                  variant="bordered"
                  startContent={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  classNames={{
                    input: "text-gray-600",
                    inputWrapper: "bg-gray-50"
                  }}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DoctorFrame>
  );
};

export default DoctorProfile;