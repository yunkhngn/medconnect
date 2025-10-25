"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Upload, User, Mail, Phone, MapPin, Heart, Calendar, Users, IdCard, Shield, Droplet, Lock, Key } from "lucide-react";
import {
  Input,
  Select,
  SelectItem,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Button,
  Divider,
} from "@heroui/react";
import { PatientFrame, Grid } from "@/components/layouts/";
import ToastNotification from "@/components/ui/ToastNotification";
import AddressSelector from "@/components/ui/AddressSelector";
import { useToast } from "@/hooks/useToast";
import { useAvatar } from "@/hooks/useAvatar";
import { useAddressData } from "@/hooks/useAddressData";
import BHYTInput from "@/components/ui/BHYTInput";
import { isValidBHYT } from "@/utils/bhytHelper";

import { useAuth } from "@/contexts/AuthContext";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function PatientProfileWithFrame() {
  const toast = useToast();
  const { getAvatarUrl, uploadAvatar, uploading } = useAvatar();
  const { getProvinceName, getDistrictName, getWardName } = useAddressData();
  const { user, loading: authLoading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [patient, setPatient] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    province_code: null,
    province_name: "",
    district_code: null,
    district_name: "",
    ward_code: null,
    ward_name: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    bloodType: "",
    allergies: "",
    socialInsurance: "",
    insuranceValidTo: "",
    citizenship: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Security states
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const maxDob = useMemo(() => new Date().toISOString().split("T")[0], []);

  const genderOptions = [
    { key: "Nam", label: "Nam" },
    { key: "Nữ", label: "Nữ" },
    { key: "Khác", label: "Khác" }
  ];

  const bloodTypeOptions = [
    { key: "A", label: "A" },
    { key: "B", label: "B" },
    { key: "AB", label: "AB" },
    { key: "O", label: "O" },
    { key: "A+", label: "A+" },
    { key: "A-", label: "A-" },
    { key: "B+", label: "B+" },
    { key: "B-", label: "B-" },
    { key: "AB+", label: "AB+" },
    { key: "AB-", label: "AB-" },
    { key: "O+", label: "O+" },
    { key: "O-", label: "O-" }
  ];

  // Load patient data when user is authenticated
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    if (!user) {
      setLoading(false);
      return;
    }

    fetchPatientData(user);
  }, [user, authLoading]);

  const fetchPatientData = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch("http://localhost:8080/api/patient/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatient({ ...patient, ...data });
        
        const avatarResponse = await fetch("http://localhost:8080/api/avatar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          const finalAvatarUrl = getAvatarUrl(firebaseUser, avatarData.avatarUrl);
          setAvatarUrl(finalAvatarUrl);
        }
      } else if (response.status === 404) {
        setPatient({
          ...patient,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
        });
        setAvatarUrl(getAvatarUrl(firebaseUser, null));
      } else {
        toast.error("Không thể tải thông tin hồ sơ");
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    toast.loading("Đang tải ảnh lên...");
    try {
      const newAvatarUrl = await uploadAvatar(file, user);
      setAvatarUrl(newAvatarUrl);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Tải ảnh đại diện thất bại");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    // Validate BHYT if provided
    if (patient.socialInsurance && !isValidBHYT(patient.socialInsurance)) {
      toast.error("Mã số BHYT không hợp lệ");
      return;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();
      
      const response = await fetch("http://localhost:8080/api/patient/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patient),
      });

      if (response.ok) {
        toast.success("Cập nhật hồ sơ thành công!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (security.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        security.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, security.newPassword);

      setSecurity({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      toast.success("Đổi mật khẩu thành công!");
    } catch (err) {
      console.error("Change password error:", err);
      if (err.code === "auth/wrong-password") {
        toast.error("Mật khẩu hiện tại không đúng");
      } else if (err.code === "auth/weak-password") {
        toast.error("Mật khẩu quá yếu");
      } else {
        toast.error(err.message || "Đổi mật khẩu thất bại");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <PatientFrame title="Hồ sơ bệnh nhân">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </PatientFrame>
    );
  }

  // Left Panel
  const leftPanel = (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6 text-center">
          <div className="relative inline-block">
            <Avatar
              src={avatarUrl}
              className="w-24 h-24 mx-auto mb-4 text-large"
              name={patient.name?.charAt(0)?.toUpperCase() || "P"}
            />
            <label
              htmlFor="avatar-input"
              className="absolute bottom-4 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors"
            >
              <Upload size={16} />
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
          <h3 className="text-lg font-semibold">{patient.name || "Bệnh nhân"}</h3>
          <p className="text-sm text-gray-600">{patient.email}</p>
          {patient.socialInsurance && (
            <p className="text-xs text-gray-500 mt-2">BHYT: {patient.socialInsurance}</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h4 className="font-semibold mb-3">Thông tin tài khoản</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Vai trò:</span>
              <span className="font-medium text-teal-600">Bệnh nhân</span>
            </div>
            {patient.bloodType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Nhóm máu:</span>
                <span className="font-medium text-red-600">{patient.bloodType}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="text-green-600 font-medium">Hoạt động</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-blue-50 border-blue-100">
        <CardBody className="p-4">
          <p className="text-xs font-semibold text-blue-900 mb-1">💡 Lưu ý</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Vui lòng cập nhật đầy đủ thông tin để được phục vụ tốt nhất. Email không thể thay đổi.
          </p>
        </CardBody>
      </Card>
    </div>
  );

  // Right Panel
  const rightPanel = (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <User size={24} className="text-teal-600" />
            Thông tin cơ bản
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={patient.name || ""}
              onValueChange={(v) => setPatient({ ...patient, name: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<User className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
            />
            <Input
              type="email"
              label="Email"
              value={patient.email || ""}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Mail className="text-default-400" size={20} />}
              isReadOnly
              description="Email không thể thay đổi"
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 bg-gray-50"
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="tel"
              label="Số điện thoại"
              placeholder="0912 345 678"
              value={patient.phone || ""}
              onValueChange={(v) => setPatient({ ...patient, phone: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Phone className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
            />
            <Input
              type="date"
              label="Ngày sinh"
              value={patient.dateOfBirth || ""}
              onValueChange={(v) => setPatient({ ...patient, dateOfBirth: v })}
              variant="bordered"
              labelPlacement="outside"
              max={maxDob}
              startContent={<Calendar className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Giới tính"
              placeholder="Chọn giới tính"
              selectedKeys={patient.gender ? [patient.gender] : []}
              onSelectionChange={(keys) => setPatient({ ...patient, gender: Array.from(keys)[0] })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Users className="text-default-400" size={20} />}
              classNames={{
                trigger: "border-default-200 hover:border-teal-500 data-[focus=true]:border-teal-500"
              }}
            >
              {genderOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Nhóm máu"
              placeholder="Chọn nhóm máu"
              selectedKeys={patient.bloodType ? [patient.bloodType] : []}
              onSelectionChange={(keys) => setPatient({ ...patient, bloodType: Array.from(keys)[0] })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Droplet className="text-default-400" size={20} />}
              classNames={{
                trigger: "border-default-200 hover:border-teal-500 data-[focus=true]:border-teal-500"
              }}
            >
              {bloodTypeOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Address Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-default-700">
              Địa chỉ <span className="text-danger">*</span>
            </label>
            <AddressSelector
              provinceCode={patient.province_code}
              districtCode={patient.district_code}
              wardCode={patient.ward_code}
              onProvinceChange={(code) => {
                setPatient(prev => ({
                  ...prev,
                  province_code: code ? parseInt(code) : null,
                  province_name: code ? getProvinceName(code) : ""
                }));
              }}
              onDistrictChange={(code) => {
                setPatient(prev => ({
                  ...prev,
                  district_code: code ? parseInt(code) : null,
                  district_name: code ? getDistrictName(code) : ""
                }));
              }}
              onWardChange={(code) => {
                setPatient(prev => ({
                  ...prev,
                  ward_code: code ? parseInt(code) : null,
                  ward_name: code ? getWardName(code) : ""
                }));
              }}
              disabled={saving}
              required
            />
          </div>

          <Input
            label="Địa chỉ chi tiết (tùy chọn)"
            placeholder="Số nhà, tên đường... (VD: Số 123, Đường ABC)"
            value={patient.address || ""}
            onValueChange={(v) => setPatient({ ...patient, address: v })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<MapPin className="text-default-400" size={20} />}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />

          <Input
            label="Căn cước công dân"
            placeholder="VD: 001234567890"
            value={patient.citizenship || ""}
            onValueChange={(v) => setPatient({ ...patient, citizenship: v })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<IdCard className="text-default-400" size={20} />}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />
        </CardBody>
      </Card>

      {/* Health Information */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Heart size={24} className="text-red-600" />
            Thông tin sức khỏe
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <BHYTInput
            value={patient.socialInsurance || ""}
            onChange={(v) => setPatient({ ...patient, socialInsurance: v })}
          />

          <Input
            type="date"
            label="BHYT hết hạn"
            value={patient.insuranceValidTo || ""}
            onValueChange={(v) => setPatient({ ...patient, insuranceValidTo: v })}
            variant="bordered"
            labelPlacement="outside"
            description="Ngày hết hạn thẻ BHYT"
            startContent={<Shield className="text-default-400" size={20} />}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />

          <Input
            label="Dị ứng"
            placeholder="VD: Không, hoặc liệt kê các dị ứng"
            value={patient.allergies || ""}
            onValueChange={(v) => setPatient({ ...patient, allergies: v })}
            variant="bordered"
            labelPlacement="outside"
            description="Các dị ứng thuốc hoặc thực phẩm"
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />
        </CardBody>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Phone size={24} className="text-orange-600" />
            Liên hệ khẩn cấp
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Input
            label="Tên người liên hệ"
            placeholder="Nguyễn Văn B"
            value={patient.emergencyContactName || ""}
            onValueChange={(v) => setPatient({ ...patient, emergencyContactName: v })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<User className="text-default-400" size={20} />}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="tel"
              label="Số điện thoại"
              placeholder="0912 345 678"
              value={patient.emergencyContactPhone || ""}
              onValueChange={(v) => setPatient({ ...patient, emergencyContactPhone: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Phone className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
            />
            <Input
              label="Quan hệ"
              placeholder="VD: Vợ/Chồng, Con, Anh/Chị/Em"
              value={patient.emergencyContactRelationship || ""}
              onValueChange={(v) => setPatient({ ...patient, emergencyContactRelationship: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Users className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
            />
          </div>

          <Button
            color="primary"
            onPress={handleSave}
            isLoading={saving}
            startContent={<Save size={18} />}
            className="w-full md:w-auto"
          >
            Lưu thay đổi
          </Button>
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Lock size={24} className="text-red-600" />
            Bảo mật
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Lưu ý:</strong> Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại.
            </p>
          </div>

          <Input
            type="password"
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            value={security.currentPassword}
            onValueChange={(v) => setSecurity({ ...security, currentPassword: v })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<Lock className="text-default-400" size={20} />}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-red-500 focus-within:!border-red-500"
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="password"
              label="Mật khẩu mới"
              placeholder="Tối thiểu 6 ký tự"
              value={security.newPassword}
              onValueChange={(v) => setSecurity({ ...security, newPassword: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Key className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-red-500 focus-within:!border-red-500"
              }}
            />
            <Input
              type="password"
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={security.confirmPassword}
              onValueChange={(v) => setSecurity({ ...security, confirmPassword: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Key className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-red-500 focus-within:!border-red-500"
              }}
            />
          </div>

          <Button
            color="danger"
            onPress={handleChangePassword}
            isLoading={changingPassword}
            isDisabled={!security.currentPassword || !security.newPassword || !security.confirmPassword}
            startContent={<Key size={18} />}
            className="w-full md:w-auto"
          >
            Đổi mật khẩu
          </Button>
        </CardBody>
      </Card>
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
      <PatientFrame title="Hồ sơ bệnh nhân">
        <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
      </PatientFrame>
    </>
  );
}
