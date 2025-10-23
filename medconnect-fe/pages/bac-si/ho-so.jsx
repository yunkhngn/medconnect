"use client";

import { useEffect, useState } from "react";
import { Save, Upload, User, Mail, Phone, IdCard, Stethoscope, Lock, Key, FileText, Calendar, AlertCircle, Plus, Edit2, Award } from "lucide-react";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Textarea
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
    speciality_id: null,
    experience_years: 0,
    active_license: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Specialities from API
  const [specialities, setSpecialities] = useState([]);
  const [loadingSpecialities, setLoadingSpecialities] = useState(true);

  // Licenses
  const [licenses, setLicenses] = useState([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  
  // License modal
  const { isOpen: isLicenseModalOpen, onOpen: onLicenseModalOpen, onClose: onLicenseModalClose } = useDisclosure();
  const [editingLicense, setEditingLicense] = useState(null);
  const [licenseForm, setLicenseForm] = useState({
    license_number: "",
    issued_date: "",
    expiry_date: "",
    issued_by: "Cục Quản lý Khám chữa bệnh - Bộ Y tế",
    issuer_title: "Cục trưởng",
    scope_of_practice: "",
    notes: ""
  });
  const [savingLicense, setSavingLicense] = useState(false);

  // Security states
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Listen to Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchDoctorData(firebaseUser);
        fetchLicenses(firebaseUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch specialities on mount
  useEffect(() => {
    fetchSpecialities();
  }, []);

  const fetchSpecialities = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/specialities");
      if (response.ok) {
        const data = await response.json();
        setSpecialities(data);
      }
    } catch (error) {
      console.error("Error fetching specialities:", error);
    } finally {
      setLoadingSpecialities(false);
    }
  };

  const fetchDoctorData = async (firebaseUser) => {
    console.log("[DEBUG] Current Firebase UID:", firebaseUser.uid);
    console.log("[DEBUG] Current Email:", firebaseUser.email);
    
    try {
      const token = await firebaseUser.getIdToken();
      const decodedToken = await firebaseUser.getIdTokenResult();
      console.log("[DEBUG] Token claims:", decodedToken.claims);
      
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

  const fetchLicenses = async (firebaseUser) => {
    setLoadingLicenses(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("http://localhost:8080/api/licenses/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLicenses(data);
      }
    } catch (error) {
      console.error("Error fetching licenses:", error);
    } finally {
      setLoadingLicenses(false);
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

    if (!doctor.phone || !doctor.speciality_id) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();
      
      const payload = {
        phone: doctor.phone,
        speciality_id: doctor.speciality_id,
        experience_years: doctor.experience_years || 0
      };

      console.log("[Update Profile] Payload:", payload);
      
      const response = await fetch("http://localhost:8080/doctor/dashboard/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("[Update Profile] Response status:", response.status);
      
      // Get response text first
      const responseText = await response.text();
      console.log("[Update Profile] Response body:", responseText);

      if (response.ok) {
        let result = {};
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            console.warn("[Update Profile] Response is not JSON:", responseText);
          }
        }
        console.log("[Update Profile] Success:", result);
        toast.success("Cập nhật hồ sơ thành công!");
        await fetchDoctorData(user); // Refresh data
      } else {
        let errorData = {};
        if (responseText) {
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            errorData = { message: responseText };
          }
        }
        console.error("[Update Profile] Error:", errorData);
        throw new Error(errorData.message || errorData.error || `Cập nhật thất bại (${response.status})`);
      }
    } catch (error) {
      console.error("[Update Profile] Exception:", error);
      toast.error(error.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenLicenseModal = (license = null) => {
    if (license) {
      setEditingLicense(license);
      setLicenseForm({
        license_number: license.license_number || "",
        issued_date: license.issued_date || "",
        expiry_date: license.expiry_date || "",
        issued_by: license.issued_by || "Cục Quản lý Khám chữa bệnh - Bộ Y tế",
        issuer_title: license.issuer_title || "Cục trưởng",
        scope_of_practice: license.scope_of_practice || "",
        notes: license.notes || ""
      });
    } else {
      setEditingLicense(null);
      setLicenseForm({
        license_number: "",
        issued_date: "",
        expiry_date: "",
        issued_by: "Cục Quản lý Khám chữa bệnh - Bộ Y tế",
        issuer_title: "Cục trưởng",
        scope_of_practice: "",
        notes: ""
      });
    }
    onLicenseModalOpen();
  };

  const handleSaveLicense = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    if (!licenseForm.license_number || !licenseForm.issued_date) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSavingLicense(true);
    try {
      const token = await user.getIdToken();
      const url = editingLicense
        ? `http://localhost:8080/api/licenses/my/${editingLicense.license_id}`
        : "http://localhost:8080/api/licenses/my";
      
      const response = await fetch(url, {
        method: editingLicense ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(licenseForm),
      });

      if (response.ok) {
        toast.success(editingLicense ? "Cập nhật giấy phép thành công!" : "Thêm giấy phép thành công!");
        await fetchLicenses(user);
        await fetchDoctorData(user); // Refresh active license
        onLicenseModalClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lưu giấy phép thất bại");
      }
    } catch (error) {
      console.error("License save error:", error);
      toast.error(error.message || "Không thể lưu giấy phép");
    } finally {
      setSavingLicense(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            {doctor.specialization || "Chưa có chuyên khoa"}
          </p>
          {doctor.experience_years > 0 && (
            <Chip size="sm" color="primary" variant="flat" className="mt-2">
              {doctor.experience_years} năm kinh nghiệm
            </Chip>
          )}
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
              <span className="text-gray-600">Trạng thái:</span>
              <span className="text-green-600 font-medium">Hoạt động</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {doctor.active_license && (
        <Card className="bg-teal-50 border-teal-100">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-teal-700" />
              <p className="text-xs font-semibold text-teal-900">Giấy phép hiện hành</p>
            </div>
            <p className="text-sm font-medium text-teal-900">{doctor.active_license.license_number}</p>
            <p className="text-xs text-teal-700 mt-1">
              Hết hạn: {formatDate(doctor.active_license.expiry_date) || "Vô thời hạn"}
            </p>
            {doctor.active_license.days_until_expiry !== null && doctor.active_license.days_until_expiry < 365 && (
              <Chip size="sm" color="warning" variant="flat" className="mt-2">
                <AlertCircle size={12} className="mr-1" />
                Còn {doctor.active_license.days_until_expiry} ngày
              </Chip>
            )}
          </CardBody>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-100">
        <CardBody className="p-4">
          <p className="text-xs font-semibold text-blue-900 mb-1">💡 Thông tin</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Email không thể thay đổi. Liên hệ quản trị viên nếu cần hỗ trợ.
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
              type="number"
              label="Số năm kinh nghiệm"
              placeholder="VD: 15"
              value={doctor.experience_years || 0}
              onValueChange={(v) => setDoctor({ ...doctor, experience_years: parseInt(v) || 0 })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Award className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
            />
          </div>

          <Select
            label="Chuyên khoa"
            placeholder={loadingSpecialities ? "Đang tải..." : "Chọn chuyên khoa"}
            selectedKeys={doctor.speciality_id ? [doctor.speciality_id.toString()] : []}
            onSelectionChange={(keys) => {
              const selectedId = Array.from(keys)[0];
              setDoctor({ ...doctor, speciality_id: selectedId ? parseInt(selectedId) : null });
            }}
            variant="bordered"
            labelPlacement="outside"
            startContent={<Stethoscope className="text-default-400" size={20} />}
            classNames={{
              trigger: "border-default-200 hover:border-teal-500 data-[focus=true]:border-teal-500"
            }}
            isLoading={loadingSpecialities}
          >
            {specialities.map((spec) => (
              <SelectItem key={spec.id.toString()} value={spec.id.toString()}>
                {spec.name}
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

      {/* License Management */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FileText size={24} className="text-purple-600" />
            Giấy phép hành nghề
          </h3>
          <Button
            size="sm"
            color="secondary"
            startContent={<Plus size={16} />}
            onPress={() => handleOpenLicenseModal()}
          >
            Thêm giấy phép
          </Button>
        </CardHeader>
        <Divider />
        <CardBody>
          {loadingLicenses ? (
            <p className="text-center text-gray-500">Đang tải...</p>
          ) : licenses.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Chưa có giấy phép hành nghề</p>
              <p className="text-sm text-gray-400 mt-1">Nhấn "Thêm giấy phép" để thêm mới</p>
            </div>
          ) : (
            <div className="space-y-3">
              {licenses.map((license) => (
                <Card key={license.license_id} className="border">
                  <CardBody className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-lg">{license.license_number}</p>
                          {license.is_active ? (
                            <Chip size="sm" color="success" variant="flat">Hiệu lực</Chip>
                          ) : (
                            <Chip size="sm" color="default" variant="flat">Không hoạt động</Chip>
                          )}
                          {license.is_expired && (
                            <Chip size="sm" color="danger" variant="flat">Đã hết hạn</Chip>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Ngày cấp:</strong> {formatDate(license.issued_date)}</p>
                          <p><strong>Ngày hết hạn:</strong> {formatDate(license.expiry_date) || "Vô thời hạn"}</p>
                          {license.issued_by && (
                            <p><strong>Nơi cấp:</strong> {license.issued_by}</p>
                          )}
                          {license.scope_of_practice && (
                            <p><strong>Phạm vi:</strong> {license.scope_of_practice}</p>
                          )}
                          {license.notes && (
                            <p className="text-gray-500 italic">{license.notes}</p>
                          )}
                          {license.days_until_expiry !== null && license.days_until_expiry > 0 && license.days_until_expiry < 365 && (
                            <p className="text-orange-600 font-medium flex items-center gap-1">
                              <AlertCircle size={14} />
                              Còn {license.days_until_expiry} ngày hết hạn
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => handleOpenLicenseModal(license)}
                      >
                        <Edit2 size={16} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
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
      
      {/* License Modal */}
      <Modal 
        isOpen={isLicenseModalOpen} 
        onClose={onLicenseModalClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText size={24} className="text-purple-600" />
              {editingLicense ? "Chỉnh sửa giấy phép" : "Thêm giấy phép mới"}
            </h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Số giấy phép *"
                placeholder="VD: 000001/BYT-GPHN"
                value={licenseForm.license_number}
                onValueChange={(v) => setLicenseForm({ ...licenseForm, license_number: v })}
                variant="bordered"
                labelPlacement="outside"
                isRequired
              />
              <Input
                type="date"
                label="Ngày cấp *"
                value={licenseForm.issued_date}
                onValueChange={(v) => setLicenseForm({ ...licenseForm, issued_date: v })}
                variant="bordered"
                labelPlacement="outside"
                isRequired
              />
            </div>

            <Input
              type="date"
              label="Ngày hết hạn"
              description="Để trống nếu vô thời hạn"
              value={licenseForm.expiry_date}
              onValueChange={(v) => setLicenseForm({ ...licenseForm, expiry_date: v })}
              variant="bordered"
              labelPlacement="outside"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nơi cấp"
                placeholder="VD: Cục Quản lý Khám chữa bệnh - Bộ Y tế"
                value={licenseForm.issued_by}
                onValueChange={(v) => setLicenseForm({ ...licenseForm, issued_by: v })}
                variant="bordered"
                labelPlacement="outside"
              />
              <Input
                label="Chức danh người cấp"
                placeholder="VD: Cục trưởng"
                value={licenseForm.issuer_title}
                onValueChange={(v) => setLicenseForm({ ...licenseForm, issuer_title: v })}
                variant="bordered"
                labelPlacement="outside"
              />
            </div>

            <Textarea
              label="Phạm vi hành nghề"
              placeholder="VD: Khám bệnh, chữa bệnh theo chuyên khoa Tim mạch"
              value={licenseForm.scope_of_practice}
              onValueChange={(v) => setLicenseForm({ ...licenseForm, scope_of_practice: v })}
              variant="bordered"
              labelPlacement="outside"
              minRows={2}
            />

            <Textarea
              label="Ghi chú"
              placeholder="VD: Cấp mới, Gia hạn lần 1..."
              value={licenseForm.notes}
              onValueChange={(v) => setLicenseForm({ ...licenseForm, notes: v })}
              variant="bordered"
              labelPlacement="outside"
              minRows={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onLicenseModalClose}>
              Hủy
            </Button>
            <Button 
              color="primary" 
              onPress={handleSaveLicense}
              isLoading={savingLicense}
            >
              {editingLicense ? "Cập nhật" : "Thêm mới"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DoctorFrame title="Hồ sơ bác sĩ">
        <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
      </DoctorFrame>
    </>
  );
}

