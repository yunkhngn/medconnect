"use client";

import { useEffect, useState } from "react";
import { Save, Upload, User, Mail, Phone, IdCard, Stethoscope, Lock, Key } from "lucide-react";
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
  Switch
} from "@heroui/react";
import { DoctorFrame, Grid } from "@/components/layouts/";
import ToastNotification from "@/components/ui/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { useAvatar } from "@/hooks/useAvatar";

import { auth } from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function DoctorProfileWithFrame() {
  const toast = useToast();
  const { getAvatarUrl, uploadAvatar, uploading } = useAvatar();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    license_id: ""
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

  const specializations = [
    { key: "CARDIOLOGY", label: "Tim mạch" },
    { key: "DERMATOLOGY", label: "Da liễu" },
    { key: "INTERNAL_MEDICINE", label: "Nội khoa" },
    { key: "PEDIATRICS", label: "Nhi khoa" },
    { key: "ORTHOPEDICS", label: "Chỉnh hình" },
    { key: "NEUROLOGY", label: "Thần kinh" },
    { key: "PSYCHIATRY", label: "Tâm thần" },
    { key: "GENERAL_SURGERY", label: "Phẫu thuật tổng quát" },
    { key: "OBSTETRICS_GYNECOLOGY", label: "Sản phụ khoa" },
    { key: "OPHTHALMOLOGY", label: "Nhãn khoa" },
    { key: "ENT", label: "Tai mũi họng" },
    { key: "UROLOGY", label: "Tiết niệu" }
  ];

  // Listen to Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchDoctorData(firebaseUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDoctorData = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      
      // Fetch doctor profile
      const response = await fetch("http://localhost:8080/doctor/dashboard/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDoctor({ ...doctor, ...data });
        
        // Get user's avatar
        const avatarResponse = await fetch("http://localhost:8080/api/avatar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          const finalAvatarUrl = getAvatarUrl(firebaseUser, avatarData.avatarUrl);
          setAvatarUrl(finalAvatarUrl);
        }
      } else {
        toast.error("Không thể tải thông tin hồ sơ");
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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

    if (!doctor.phone || !doctor.specialization) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();
      
      const response = await fetch("http://localhost:8080/doctor/dashboard/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: doctor.phone,
          specialization: doctor.specialization
        }),
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

  // Change Password
  const handleChangePassword = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    // Validation
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
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        user.email,
        security.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, security.newPassword);

      // Clear form
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
      <DoctorFrame title="Hồ sơ bác sĩ">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </DoctorFrame>
    );
  }

  // Left Panel - Avatar & Info
  const leftPanel = (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6 text-center">
          <div className="relative inline-block">
            <Avatar
              src={avatarUrl}
              className="w-24 h-24 mx-auto mb-4 text-large"
              name={doctor.name?.charAt(0)?.toUpperCase() || "B"}
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
          <h3 className="text-lg font-semibold">{doctor.name || "Bác sĩ"}</h3>
          <p className="text-sm text-gray-600">{doctor.email}</p>
          <p className="text-xs text-gray-500 mt-2">
            {specializations.find(s => s.key === doctor.specialization)?.label || doctor.specialization}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h4 className="font-semibold mb-3">Thông tin tài khoản</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Vai trò:</span>
              <span className="font-medium text-teal-600">Bác sĩ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giấy phép:</span>
              <span className="font-medium">{doctor.license_id || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="text-green-600 font-medium">Hoạt động</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-teal-50 border-teal-100">
        <CardBody className="p-4">
          <p className="text-xs font-semibold text-teal-900 mb-1">💡 Thông tin</p>
          <p className="text-xs text-teal-700 leading-relaxed">
            Email và giấy phép hành nghề không thể thay đổi. Liên hệ quản trị viên nếu cần hỗ trợ.
          </p>
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
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <User size={24} className="text-teal-600" />
            Thông tin cá nhân
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              value={doctor.name || ""}
              variant="bordered"
              labelPlacement="outside"
              startContent={<User className="text-default-400" size={20} />}
              isReadOnly
              description="Không thể thay đổi"
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 bg-gray-50"
              }}
            />
            <Input
              type="email"
              label="Email"
              value={doctor.email || ""}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Mail className="text-default-400" size={20} />}
              isReadOnly
              description="Không thể thay đổi"
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
              placeholder="VD: 0912 345 678"
              value={doctor.phone || ""}
              onValueChange={(v) => setDoctor({ ...doctor, phone: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Phone className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
            />
            <Input
              label="Số giấy phép hành nghề"
              value={doctor.license_id || ""}
              variant="bordered"
              labelPlacement="outside"
              startContent={<IdCard className="text-default-400" size={20} />}
              isReadOnly
              description="Không thể thay đổi"
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 bg-gray-50"
              }}
            />
          </div>

          <Select
            label="Chuyên khoa"
            placeholder="Chọn chuyên khoa"
            selectedKeys={doctor.specialization ? [doctor.specialization] : []}
            onSelectionChange={(keys) => setDoctor({ ...doctor, specialization: Array.from(keys)[0] })}
            variant="bordered"
            labelPlacement="outside"
            startContent={<Stethoscope className="text-default-400" size={20} />}
            classNames={{
              trigger: "border-default-200 hover:border-teal-500 data-[focus=true]:border-teal-500"
            }}
          >
            {specializations.map((spec) => (
              <SelectItem key={spec.key} value={spec.key}>
                {spec.label}
              </SelectItem>
            ))}
          </Select>

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

      {/* Change Password */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Lock size={24} className="text-red-600" />
            Đổi mật khẩu
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
      <DoctorFrame title="Hồ sơ bác sĩ">
        <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
      </DoctorFrame>
    </>
  );
}
