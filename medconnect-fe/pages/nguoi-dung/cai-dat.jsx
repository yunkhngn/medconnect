"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Save, Upload, User } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import ToastNotification from "@/components/ui/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { useAvatar } from "@/hooks/useAvatar";

import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
                  <LabeledInput label="Họ và tên" placeholder="Nhập họ và tên" value={patient.name} onChange={(v) => setPatient({ ...patient, name: v })} />
                  <LabeledInput type="email" label="Email" placeholder="example@email.com" value={patient.email} onChange={(v) => setPatient({ ...patient, email: v })} />
                  <LabeledInput type="tel" label="Số điện thoại" placeholder="0123456789" value={patient.phone} onChange={(v) => setPatient({ ...patient, phone: v })} />
                  <LabeledInput type="date" label="Ngày sinh" value={patient.dateOfBirth} onChange={(v) => setPatient({ ...patient, dateOfBirth: v })} inputProps={{ max: maxDob }} />
                  <LabeledSelect label="Giới tính" value={patient.gender} onChange={(v) => setPatient({ ...patient, gender: v })} options={[{ value: "", label: "Chọn giới tính" }, { value: "Nam", label: "Nam" }, { value: "Nữ", label: "Nữ" }, { value: "Khác", label: "Khác" }]} />
                  <LabeledSelect label="Nhóm máu" value={patient.bloodType} onChange={(v) => setPatient({ ...patient, bloodType: v })} options={[{ value: "", label: "Chọn nhóm máu" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "AB", label: "AB" }, { value: "O", label: "O" }]} />
                  {/* Mã BHYT & CCCD */}
                  <LabeledInput label="Mã BHYT" placeholder="Nhập mã BHYT" value={patient.socialInsurance} onChange={(v) => setPatient({ ...patient, socialInsurance: v })} />
                  <LabeledInput label="Căn cước công dân" placeholder="Nhập CCCD" value={patient.citizenship} onChange={(v) => setPatient({ ...patient, citizenship: v })} />
                </div>

                <LabeledInput label="Địa chỉ" placeholder="Nhập địa chỉ" value={patient.address} onChange={(v) => setPatient({ ...patient, address: v })} />
                
                <LabeledInput 
                  label="Dị ứng (nếu có)" 
                  placeholder="Ví dụ: Penicillin, hải sản, phấn hoa..." 
                  value={patient.allergies} 
                  onChange={(v) => setPatient({ ...patient, allergies: v })} 
                />

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ khẩn cấp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LabeledInput label="Tên người liên hệ" placeholder="Nhập tên người liên hệ" value={patient.emergencyContactName} onChange={(v) => setPatient({ ...patient, emergencyContactName: v })} />
                    <LabeledInput type="tel" label="Số điện thoại liên hệ" placeholder="0123456789" value={patient.emergencyContactPhone} onChange={(v) => setPatient({ ...patient, emergencyContactPhone: v })} />
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

/* ---------- Input helpers ---------- */
function LabeledInput({ label, value, onChange, type = "text", placeholder, inputProps }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        {...inputProps}
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
