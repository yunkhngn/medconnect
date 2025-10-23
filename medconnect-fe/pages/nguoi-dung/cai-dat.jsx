"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Save, Upload, User, Mail, Phone, MapPin, Heart, Calendar, Users, IdCard, Shield, Droplet, Lock, Key } from "lucide-react";
import { Input, Select, SelectItem } from "@heroui/react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import ToastNotification from "@/components/ui/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { useAvatar } from "@/hooks/useAvatar";
import BHYTInput from "@/components/ui/BHYTInput";
import { isValidBHYT } from "@/utils/bhytHelper";

import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function PatientProfileWithFrame() {
  const toast = useToast();
  const { getAvatarUrl, uploadAvatar, uploading } = useAvatar();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null); // Avatar URL riêng
  const [patient, setPatient] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    bloodType: "",
    allergies: "",
    socialInsurance: "", // mã BHYT
    citizenship: "", // căn cước công dân
    emr_url: "", // hồ sơ y tế điện tử
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingEmr, setUploadingEmr] = useState(false);

  // Security states
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const maxDob = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Listen to Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchPatientData(firebaseUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPatientData = async (firebaseUser) => {
    console.log("🔵 Fetching patient data for:", firebaseUser.uid);
    console.log("📧 Email:", firebaseUser.email);
    
    try {
      // Fetch patient profile từ Backend API
      console.log("📖 Fetching from backend API...");
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch("http://localhost:8080/api/patient/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Patient data loaded from backend:", data);
        
        // Backend đã trả về dateOfBirth dạng yyyy-MM-dd string rồi
        setPatient({ ...patient, ...data });
        
        // Get user's avatar from database
        const avatarResponse = await fetch("http://localhost:8080/api/avatar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          const finalAvatarUrl = getAvatarUrl(firebaseUser, avatarData.avatarUrl);
          setAvatarUrl(finalAvatarUrl);
        }
      } else if (response.status === 404) {
        // Patient chưa có trong DB - có thể là user mới
        console.log("ℹ️ Patient not found in database, using Firebase Auth data");
        setPatient({
          ...patient,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          phone: firebaseUser.phoneNumber || "",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (err) {
      console.error("❌ Error fetching patient:", err);
      console.error("❌ Error message:", err.message);
      
      // Fallback: Dùng thông tin từ Firebase Auth
      console.log("⚠️ Using fallback data from Firebase Auth");
      setPatient({
        ...patient,
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        phone: firebaseUser.phoneNumber || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.warning("Bạn chưa đăng nhập");
      return;
    }

    // Validate mã BHYT nếu có nhập
    if (patient.socialInsurance && patient.socialInsurance.length > 0) {
      if (!isValidBHYT(patient.socialInsurance)) {
        toast.error("Mã số BHYT không hợp lệ. Vui lòng kiểm tra lại!");
        return;
      }
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();
      
      console.log("💾 Saving patient data:", patient);
      
      const response = await fetch("http://localhost:8080/api/patient/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patient),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Patient data saved:", result);
      
      toast.success(result.message || "Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      toast.error(`Có lỗi xảy ra: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Upload avatar
  const handlePickAvatar = () => document.getElementById("avatar-input")?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      toast.success("Tải ảnh đại diện thành công!");
    } catch (err) {
      console.error("Upload avatar error:", err);
      toast.error(err.message || "Tải ảnh thất bại");
    }
  };

  // Upload hồ sơ y tế (EMR)
  const handlePickEmr = () => document.getElementById("emr-input")?.click();

  const handleEmrChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingEmr(true);
    try {
      const fileRef = ref(storage, `emr/${user.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setPatient((p) => ({ ...p, emr_url: url }));
      await setDoc(doc(db, "patients", user.uid), { emr_url: url, updated_at: serverTimestamp() }, { merge: true });
      toast.success("Tải hồ sơ y tế thành công!");
    } catch (err) {
      console.error("Upload EMR error:", err);
      toast.error("Tải hồ sơ y tế thất bại");
    } finally {
      setUploadingEmr(false);
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
      setSecurity(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

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
        <div className="w-full min-h-screen bg-gray-50">
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-12 h-12 object-cover" />
                ) : (
                  <User className="text-white" size={24} />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            </div>
            <p className="text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
          </div>

          {/* Avatar uploader */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm cursor-pointer hover:ring-teal-500 transition-all relative"
                onClick={handlePickAvatar}
                role="button"
                title="Đổi ảnh đại diện"
              >
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl} 
                    alt="avatar" 
                    fill
                    sizes="80px"
                    className="object-cover"
                    quality={90}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={28} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Ảnh đại diện</div>
                <div className="text-sm text-gray-500">
                  {user?.photoURL && !avatarUrl?.includes('cloudinary') 
                    ? "Đang dùng ảnh Gmail. Upload ảnh mới để thay đổi." 
                    : "JPG/PNG ≤ 5MB. Ảnh vuông hiển thị đẹp nhất."}
                </div>
                <button
                  onClick={handlePickAvatar}
                  className="mt-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!user || uploading}
                >
                  {uploading ? "Đang tải..." : "Chọn ảnh"}
                </button>
              </div>
              <input id="avatar-input" type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </div>
          </div>

          {/* Main Form */}
          {loading ? (
            <div className="animate-pulse space-y-4 max-w-3xl">
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Họ và tên" 
                    placeholder="Nhập họ và tên đầy đủ" 
                    value={patient.name || ""} 
                    onValueChange={(v) => setPatient({ ...patient, name: v })} 
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<User className="text-default-400" size={20} />}
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-default-200 hover:border-primary focus-within:!border-primary"
                    }}
                  />
                  <Input 
                    type="email" 
                    label="Email" 
                    placeholder="your.email@example.com" 
                    value={patient.email || ""} 
                    onValueChange={(v) => setPatient({ ...patient, email: v })} 
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<Mail className="text-default-400" size={20} />}
                    isReadOnly
                    description="Email không thể thay đổi"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-default-200 bg-gray-50",
                      description: "text-xs text-default-500"
                    }}
                  />
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
                      inputWrapper: "border-default-200 hover:border-primary focus-within:!border-primary"
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
                      inputWrapper: "border-default-200 hover:border-primary focus-within:!border-primary"
                    }}
                  />
                  <Select 
                    label="Giới tính" 
                    placeholder="Chọn giới tính"
                    selectedKeys={patient.gender ? [patient.gender] : []} 
                    onSelectionChange={(keys) => setPatient({ ...patient, gender: Array.from(keys)[0] || "" })} 
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<Users className="text-default-400" size={20} />}
                    classNames={{
                      trigger: "border-default-200 hover:border-primary data-[focus=true]:!border-primary"
                    }}
                  >
                    <SelectItem key="Nam" value="Nam">Nam</SelectItem>
                    <SelectItem key="Nữ" value="Nữ">Nữ</SelectItem>
                    <SelectItem key="Khác" value="Khác">Khác</SelectItem>
                  </Select>
                  <Select 
                    label="Nhóm máu" 
                    placeholder="Chọn nhóm máu"
                    selectedKeys={patient.bloodType ? [patient.bloodType] : []} 
                    onSelectionChange={(keys) => setPatient({ ...patient, bloodType: Array.from(keys)[0] || "" })} 
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<Droplet className="text-default-400" size={20} />}
                    classNames={{
                      trigger: "border-default-200 hover:border-primary data-[focus=true]:!border-primary"
                    }}
                  >
                    <SelectItem key="A" value="A">A</SelectItem>
                    <SelectItem key="B" value="B">B</SelectItem>
                    <SelectItem key="AB" value="AB">AB</SelectItem>
                    <SelectItem key="O" value="O">O</SelectItem>
                  </Select>
                </div>

                {/* BHYT: Số thẻ & Hết hạn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BHYTInput 
                    label="Mã số Bảo hiểm Y tế" 
                    placeholder="VD: HS 4 01 0120878811" 
                    value={patient.socialInsurance || ''} 
                    onChange={(v) => setPatient({ ...patient, socialInsurance: v })} 
                  />
                  <Input 
                    type="date"
                    label="BHYT hết hạn" 
                    placeholder="Chọn ngày hết hạn" 
                    value={patient.insuranceValidTo || ""} 
                    onValueChange={(v) => setPatient({ ...patient, insuranceValidTo: v })} 
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<Calendar className="text-default-400" size={20} />}
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-default-200 hover:border-primary focus-within:!border-primary"
                    }}
                  />
                </div>

                {/* CCCD */}
                <Input 
                  label="Căn cước công dân" 
                  placeholder="Nhập số CCCD/CMND" 
                  value={patient.citizenship || ""} 
                  onValueChange={(v) => setPatient({ ...patient, citizenship: v })} 
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<IdCard className="text-default-400" size={20} />}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-default-200 hover:border-primary focus-within:!border-primary"
                  }}
                />

                <Input 
                  label="Địa chỉ" 
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" 
                  value={patient.address || ""} 
                  onValueChange={(v) => setPatient({ ...patient, address: v })} 
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<MapPin className="text-default-400" size={20} />}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-default-200 hover:border-primary focus-within:!border-primary"
                  }}
                />
                
                <Input 
                  label="Dị ứng (nếu có)" 
                  placeholder="Ví dụ: Penicillin, hải sản, phấn hoa, bụi, lông thú..." 
                  value={patient.allergies || ""} 
                  onValueChange={(v) => setPatient({ ...patient, allergies: v })} 
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Heart className="text-default-400" size={20} />}
                  description="Thông tin này giúp bác sĩ tư vấn và điều trị an toàn hơn"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-default-200 hover:border-primary focus-within:!border-primary",
                    description: "text-xs text-default-500"
                  }}
                />

                {/* Security Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="text-red-500" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">Bảo mật tài khoản</h3>
                  </div>
                  <p className="text-sm text-default-500 mb-6">
                    Quản lý mật khẩu đăng nhập của bạn. Email không thể thay đổi.
                  </p>

                  {/* Change Password */}
                  <div className="p-5 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Key className="text-red-600" size={20} />
                      <h4 className="font-semibold text-gray-900">Đổi mật khẩu</h4>
                    </div>
                    <div className="space-y-4">
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
                          placeholder="Ít nhất 6 ký tự" 
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
                      <button
                        onClick={handleChangePassword}
                        disabled={changingPassword || !security.currentPassword || !security.newPassword || !security.confirmPassword}
                        className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Key size={18} />
                        {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                      </button>
                    </div>
                  </div>

                  {/* Email Info - Read Only */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="text-blue-600" size={20} />
                      <h4 className="font-semibold text-gray-900">Email đăng nhập</h4>
                    </div>
                    <p className="text-sm text-blue-800">
                      <strong>Email hiện tại:</strong> {user?.email || patient.email}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      ℹ️ Email không thể thay đổi vì đây là định danh chính của tài khoản
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-orange-500" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">Liên hệ khẩn cấp</h3>
                  </div>
                  <p className="text-sm text-default-500 mb-4">
                    Thông tin này sẽ được sử dụng để liên lạc trong trường hợp khẩn cấp
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Tên người liên hệ" 
                      placeholder="Họ và tên người thân" 
                      value={patient.emergencyContactName || ""} 
                      onValueChange={(v) => setPatient({ ...patient, emergencyContactName: v })} 
                      variant="bordered"
                      labelPlacement="outside"
                      startContent={<User className="text-default-400" size={20} />}
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-default-200 hover:border-orange-500 focus-within:!border-orange-500"
                      }}
                    />
                    <Input 
                      type="tel" 
                      label="Số điện thoại liên hệ" 
                      placeholder="0912 345 678" 
                      value={patient.emergencyContactPhone || ""} 
                      onValueChange={(v) => setPatient({ ...patient, emergencyContactPhone: v })} 
                      variant="bordered"
                      labelPlacement="outside"
                      startContent={<Phone className="text-default-400" size={20} />}
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-default-200 hover:border-orange-500 focus-within:!border-orange-500"
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end items-center gap-3 pt-2">
                  <button
                    onClick={handlePickEmr}
                    disabled={!user || uploadingEmr}
                    className="bg-gray-100 text-gray-800 px-5 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Upload size={20} />
                    {uploadingEmr ? "Đang tải..." : "Upload hồ sơ y tế"}
                  </button>
                  <input id="emr-input" type="file" hidden onChange={handleEmrChange} />
                  <button
                    onClick={handleSave}
                    disabled={saving || !user}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    {saving ? "Đang lưu..." : "Lưu thông tin"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </PatientFrame>
    </>
  );
}
