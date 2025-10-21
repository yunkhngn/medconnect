"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, User } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

import { auth, db, storage } from "@/lib/firebase";
//import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PatientProfileWithFrame() {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    blood_type: "",
    allergies: "",
    avatar_url: "", // lưu link ảnh đại diện
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const maxDob = useMemo(() => new Date().toISOString().split("T")[0], []);

 

// // Fake data cho hiển thị UI không cần Firebase
// useEffect(() => {
//   // Giả lập dữ liệu người dùng để hiển thị giao diện
//   const mockPatient = {
//     full_name: "Nguyễn Văn A",
//     email: "nguyenvana@example.com",
//     phone: "0901234567",
//     date_of_birth: "2000-01-01",
//     gender: "Nam",
//     address: "123 Nguyễn Trãi, Hà Nội",
//     emergency_contact_name: "Trần Thị B",
//     emergency_contact_phone: "0987654321",
//     blood_type: "O",
//     allergies: "Không có",
//     avatar_url: "",
//   };

//   setPatient(mockPatient);
//   setUser({ uid: "test123" }); // user giả lập
//   setLoading(false);
// }, []);

useEffect(() => {
  const userId = 1; // hoặc gán ID thực tế của bệnh nhân đang đăng nhập
  fetch(`http://localhost:3000/api/patient/${userId}`)
    .then((res) => res.json())
    .then((data) => setPatient(data))
    .catch((err) => console.error("Error fetching patient:", err))
    .finally(() => setLoading(false));
}, []);



  // const handleSave = async () => {
  //   if (!user) return alert("Bạn chưa đăng nhập.");
  //   setSaving(true);
  //   try {
  //     await setDoc(
  //       doc(db, "patients", user.uid),
  //       {
  //         ...patient,
  //         user_id: user.uid,
  //         updated_at: serverTimestamp(),
  //       },
  //       { merge: true }
  //     );
  //     alert("Cập nhật thông tin thành công!");
  //   } catch (err) {
  //     console.error("Error saving profile:", err);
  //     alert("Có lỗi xảy ra khi lưu thông tin");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  
const handleSave = async () => {
  if (!user) return alert("Bạn chưa đăng nhập.");
  setSaving(true);
  try {
    const response = await fetch("http://localhost:3000/api/patient/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    });
    if (!response.ok) throw new Error("Lỗi khi lưu thông tin");
    alert("Cập nhật thông tin thành công!");
  } catch (err) {
    console.error("Error saving profile:", err);
    alert("Có lỗi xảy ra khi lưu thông tin");
  } finally {
    setSaving(false);
  }
};

  // Upload avatar lên Firebase Storage
  const handlePickAvatar = () => document.getElementById("avatar-input")?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setPatient((p) => ({ ...p, avatar_url: url }));
      // Lưu ngay url vào Firestore cho chắc
      await setDoc(
        doc(db, "patients", user.uid),
        { avatar_url: url, updated_at: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error("Upload avatar error:", err);
      alert("Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PatientFrame title="Hồ sơ bệnh nhân">
      <div className="w-full min-h-screen bg-gray-50">
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                {patient.avatar_url ? (
                  <img src={patient.avatar_url} alt="avatar" className="w-12 h-12 object-cover" />
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
                className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm"
                onClick={handlePickAvatar}
                role="button"
                title="Đổi ảnh đại diện"
              >
                {patient.avatar_url ? (
                  <img src={patient.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={28} />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">Ảnh đại diện</div>
                <div className="text-sm text-gray-500">
                  JPG/PNG ≤ 5MB. Ảnh vuông hiển thị đẹp nhất.
                </div>
                <button
                  onClick={handlePickAvatar}
                  className="mt-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm"
                  disabled={!user || uploading}
                >
                  {uploading ? "Đang tải..." : "Chọn ảnh"}
                </button>
              </div>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Loading skeleton */}
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
                  <LabeledInput
                    label="Họ và tên"
                    placeholder="Nhập họ và tên"
                    value={patient.full_name}
                    onChange={(v) => setPatient({ ...patient, full_name: v })}
                  />
                  <LabeledInput
                    type="email"
                    label="Email"
                    placeholder="example@email.com"
                    value={patient.email}
                    onChange={(v) => setPatient({ ...patient, email: v })}
                  />
                  <LabeledInput
                    type="tel"
                    label="Số điện thoại"
                    placeholder="0123456789"
                    value={patient.phone}
                    onChange={(v) => setPatient({ ...patient, phone: v })}
                  />
                  <LabeledInput
                    type="date"
                    label="Ngày sinh"
                    value={patient.date_of_birth}
                    onChange={(v) => setPatient({ ...patient, date_of_birth: v })}
                    inputProps={{ max: maxDob }}
                  />
                  <LabeledSelect
                    label="Giới tính"
                    value={patient.gender}
                    onChange={(v) => setPatient({ ...patient, gender: v })}
                    options={[
                      { value: "", label: "Chọn giới tính" },
                      { value: "Nam", label: "Nam" },
                      { value: "Nữ", label: "Nữ" },
                      { value: "Khác", label: "Khác" },
                    ]}
                  />
                  <LabeledSelect
                    label="Nhóm máu"
                    value={patient.blood_type}
                    onChange={(v) => setPatient({ ...patient, blood_type: v })}
                    options={[
                      { value: "", label: "Chọn nhóm máu" },
                      { value: "A", label: "A" },
                      { value: "B", label: "B" },
                      { value: "AB", label: "AB" },
                      { value: "O", label: "O" },
                    ]}
                  />
                </div>

                <LabeledInput
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ"
                  value={patient.address}
                  onChange={(v) => setPatient({ ...patient, address: v })}
                />

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ khẩn cấp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LabeledInput
                      label="Tên người liên hệ"
                      placeholder="Nhập tên người liên hệ"
                      value={patient.emergency_contact_name}
                      onChange={(v) =>
                        setPatient({ ...patient, emergency_contact_name: v })
                      }
                    />
                    <LabeledInput
                      type="tel"
                      label="Số điện thoại liên hệ"
                      placeholder="0123456789"
                      value={patient.emergency_contact_phone}
                      onChange={(v) =>
                        setPatient({ ...patient, emergency_contact_phone: v })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !user}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}

/* ---------- Input helpers (JSX thuần) ---------- */
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

function LabeledTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
  );
}
