"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Input,
  Textarea,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Select,
  SelectItem,
  Chip,
  Checkbox,
} from "@heroui/react";
import {
  Save,
  ArrowLeft,
  Plus,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  IdCard,
  Shield,
  Heart,
  Pill,
  Users as UsersIcon,
  AlertCircle,
  Briefcase,
  FileText,
  Upload,
} from "lucide-react";
import { PatientFrame, Grid } from "@/components/layouts/";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import BHYTInput from "@/components/ui/BHYTInput";
import AddressSelector from "@/components/ui/AddressSelector";
import { getApiUrl } from "@/utils/api";
import { useAddressData } from "@/hooks/useAddressData";

export default function CreateEMRPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    dob: "",
    gender: "Nam",
    blood_type: "",
    address: "",
    address_detail: "",
    province_code: null,
    district_code: null,
    ward_code: null,
    phone: "",
    email: "",
    insurance_number: "",
    insurance_valid_to: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    citizenship: "",
    occupation: "",
    ethnicity: "Kinh",
    foreign_national: false,
    workplace: "",
    patient_type: "BHYT",
    referral_source: "self",
    referral_diagnosis: "",
    allergies: [],
    chronic_conditions: [],
    medications: [],
    consents: {
      privacy: false,
      telemedicine: false,
    },
  });
  const [errors, setErrors] = useState({});


  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");
  const [idPhotoUrl, setIdPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { getProvinceName, getDistrictName, getWardName } = useAddressData();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Vui lòng đăng nhập");
      router.push("/dang-nhap");
      return;
    }

    const loadPatientProfile = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${getApiUrl()}/patient/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const patientData = await response.json();
          setProfile((prev) => ({
            ...prev,
            full_name: patientData.name || "",
            dob: patientData.dateOfBirth || "",
            gender: patientData.gender || "Nam",
            blood_type: patientData.bloodType || "",
            address: patientData.address || "",
            address_detail: "",
            province_code: null,
            district_code: null,
            ward_code: null,
            phone: patientData.phone || "",
            email: patientData.email || "",
            insurance_number: patientData.socialInsurance || "",
            insurance_valid_to: patientData.insuranceValidTo || "",
            emergency_contact_name: patientData.emergencyContactName || "",
            emergency_contact_phone: patientData.emergencyContactPhone || "",
            emergency_contact_relationship: patientData.emergencyContactRelationship || "",
            citizenship: patientData.citizenship || "",
          }));
        }
      } catch (error) {
        console.error("Error loading patient profile:", error);
      }
    };

    loadPatientProfile();
  }, [user, authLoading]);

  const handleAddItem = (type) => {
    let input, value;
    switch (type) {
      case "allergy":
        input = allergyInput;
        value = "allergies";
        setAllergyInput("");
        break;
      case "condition":
        input = conditionInput;
        value = "chronic_conditions";
        setConditionInput("");
        break;
      case "medication":
        input = medicationInput;
        value = "medications";
        setMedicationInput("");
        break;
    }

    if (input.trim()) {
      setProfile((prev) => ({
        ...prev,
        [value]: [...prev[value], input.trim()],
      }));
    }
  };

  const handleRemoveItem = (type, index) => {
    setProfile((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  // Upload ID Photo with 3:4 ratio validation
  const handleIdPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate aspect ratio 3:4
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const aspectRatio = img.width / img.height;
      const expectedRatio = 3 / 4;
      const tolerance = 0.05; // 5% tolerance

      if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        toast.error("Ảnh phải có tỷ lệ 3:4 (ví dụ: 300x400, 600x800)");
        URL.revokeObjectURL(img.src);
        return;
      }

      URL.revokeObjectURL(img.src);

      // Upload to Cloudinary
      setUploadingPhoto(true);
      try {
        const token = await user.getIdToken();
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${getApiUrl()}/medical-photo/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setIdPhotoUrl(data.photoUrl);
          toast.success("Tải ảnh thẻ thành công!");
        } else {
          const errorText = await response.text();
          console.error("Upload failed:", response.status, errorText);
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error.message || "Không thể tải ảnh lên");
      } finally {
        setUploadingPhoto(false);
      }
    };
  };

  const validateForm = () => {
    const newErrors = {};

    // Họ tên
    if (!profile.full_name || profile.full_name.trim().length < 2) {
      newErrors.full_name = "Vui lòng nhập họ và tên hợp lệ";
    } else if (profile.full_name.length > 100) {
      newErrors.full_name = "Tối đa 100 ký tự";
    }

    // Ngày sinh
    if (!profile.dob) {
      newErrors.dob = "Vui lòng chọn ngày sinh";
    } else {
      const dob = new Date(profile.dob);
      const today = new Date(new Date().toISOString().split("T")[0]);
      if (dob > today) newErrors.dob = "Ngày sinh không hợp lệ";
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 12) newErrors.dob = "Tuổi phải ít nhất 12 tuổi";
    }

    // Giới tính
    if (!profile.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    // Nhóm máu (HSBA-08) - Cho phép "Chưa xác định" (empty string)
    // Không cần validation vì có thể chọn "Chưa xác định"

    // CCCD (HSBA-05)
    if (profile.citizenship) {
      if (!/^\d{12}$/.test(profile.citizenship)) {
        newErrors.citizenship = "Căn cước công dân phải gồm 12 chữ số";
      }
    }

    // Email (HSBA-07)
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Số điện thoại (HSBA-06) - Cho phép nhập có khoảng trắng, dấu gạch ngang
    if (profile.phone) {
      // Loại bỏ khoảng trắng, dấu gạch ngang, dấu ngoặc đơn
      const cleanedPhone = profile.phone.replace(/[\s\-\(\)]/g, '');
      if (!/^0\d{9}$/.test(cleanedPhone)) {
        newErrors.phone = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0";
      }
    }

    // BHYT format + hết hạn (HSBA-09) - Không bắt buộc, chỉ validate nếu có nhập
    if (profile.insurance_number && profile.insurance_number.trim()) {
      if (!/^[A-Z]{2}\d{13}$/i.test(profile.insurance_number.trim())) {
        newErrors.insurance_number = "Mã BHYT không hợp lệ (gồm 2 chữ + 13 số)";
      }
      // Nếu có mã BHYT thì mới yêu cầu ngày hết hạn
      if (profile.insurance_number.trim() && !profile.insurance_valid_to) {
        newErrors.insurance_valid_to = "Vui lòng nhập ngày hết hạn BHYT";
      } else if (profile.insurance_valid_to) {
        const today = new Date(new Date().toISOString().split("T")[0]);
        const validTo = new Date(profile.insurance_valid_to);
        if (validTo < today)
          newErrors.insurance_valid_to = "Ngày hết hạn phải từ hôm nay trở đi";
      }
    }

    // Liên hệ khẩn cấp
    if (profile.emergency_contact_phone) {
      // Loại bỏ khoảng trắng, dấu gạch ngang, dấu ngoặc đơn
      const cleanedPhone = profile.emergency_contact_phone.replace(/[\s\-\(\)]/g, '');
      if (!/^0\d{9}$/.test(cleanedPhone)) {
        newErrors.emergency_contact_phone =
          "Số điện thoại liên hệ khẩn cấp không hợp lệ";
      }
      if (!profile.emergency_contact_name?.trim()) {
        newErrors.emergency_contact_name =
          "Vui lòng nhập tên người liên hệ khẩn cấp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại các trường bị lỗi");
      return;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();

      const province_name = profile.province_code ? getProvinceName(profile.province_code) : "";
      const district_name = profile.district_code ? getDistrictName(profile.district_code) : "";
      const ward_name = profile.ward_code ? getWardName(profile.ward_code) : "";
      const parts = [profile.address_detail, ward_name, district_name, province_name]
        .map(v => (v || '').trim())
        .filter(v => !!v);
      const fullAddress = parts.join(', ');

      const emrData = {
        patient_profile: {
          full_name: profile.full_name,
          date_of_birth: profile.dob,
          gender: profile.gender,
          blood_type: profile.blood_type,
          address: {
            province_code: profile.province_code,
            district_code: profile.district_code,
            ward_code: profile.ward_code,
            province_name,
            district_name,
            ward_name,
            address_detail: profile.address_detail,
            full: fullAddress || profile.address || "",
          },
          phone: profile.phone ? profile.phone.replace(/[\s\-\(\)]/g, '') : profile.phone,
          email: profile.email,
          citizenship: profile.citizenship,
          insurance_number: profile.insurance_number,
          insurance_valid_to: profile.insurance_valid_to,
          id_photo_url: idPhotoUrl,
          emergency_contact: {
            name: profile.emergency_contact_name,
            phone: profile.emergency_contact_phone ? profile.emergency_contact_phone.replace(/[\s\-\(\)]/g, '') : profile.emergency_contact_phone,
            relation: profile.emergency_contact_relationship,
          },
          occupation: profile.occupation,
          ethnicity: profile.ethnicity,
          foreign_national: profile.foreign_national,
          workplace: profile.workplace,
        },
        administrative_info: {
          admission_date: new Date().toISOString().split("T")[0],
          admission_time: new Date().toTimeString().split(" ")[0],
          patient_type: profile.patient_type,
          referral_source: profile.referral_source,
          referral_diagnosis: profile.referral_diagnosis,
        },
        medical_history: {
          allergies: profile.allergies.join(", ") || "Không",
          previous_conditions: profile.chronic_conditions.join(", ") || "Không",
          current_medications: profile.medications.join(", ") || "Không",
          surgeries: "",
          family_history: "",
        },
        consents: profile.consents,
        medical_records: [],
      };

      const response = await fetch(`${getApiUrl()}/medical-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          detail: JSON.stringify(emrData)
        }),
      });

      if (response.ok) {
        toast.success("Tạo hồ sơ bệnh án thành công!");
        setTimeout(() => router.push("/nguoi-dung/ho-so-benh-an"), 1500);
      } else {
        throw new Error("Tạo hồ sơ thất bại");
      }
    } catch (error) {
      console.error("Error creating EMR:", error);
      toast.error(error.message || "Không thể tạo hồ sơ bệnh án");
    } finally {
      setSaving(false);
    }
  };

  const genderOptions = [
    { key: "Nam", label: "Nam" },
    { key: "Nữ", label: "Nữ" },
    { key: "Khác", label: "Khác" },
  ];

  const bloodTypeOptions = [
    { key: "", label: "Chưa xác định" },
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
    { key: "O-", label: "O-" },
  ];

  const patientTypeOptions = [
    { key: "BHYT", label: "BHYT" },
    { key: "Thu phí", label: "Thu phí" },
    { key: "Miễn", label: "Miễn phí" },
    { key: "Khác", label: "Khác" },
  ];

  const referralOptions = [
    { key: "self", label: "Tự đến" },
    { key: "medical", label: "Từ cơ sở y tế khác" },
  ];

  // Left Panel - Guidelines
  const leftPanel = (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6">
          <div className="flex items-start gap-3">
            <FileText className="text-teal-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tạo hồ sơ bệnh án</h3>
              <p className="text-sm text-gray-600">
                Điền đầy đủ thông tin để tạo hồ sơ bệnh án điện tử của bạn.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-blue-50 border-blue-100">
        <CardBody className="p-4">
          <p className="text-xs font-semibold text-blue-900 mb-2">💡 Hướng dẫn</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Các trường có dấu (*) là bắt buộc</li>
            <li>• Thông tin cơ bản đã được điền tự động</li>
            <li>• Vui lòng kiểm tra và bổ sung thông tin</li>
            <li>• Khai báo đầy đủ tiền sử bệnh và dị ứng</li>
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4">
          <h4 className="font-semibold text-sm mb-2">Tiến trình</h4>
          <div className="space-y-2 text-xs">
            <div
              className={`flex items-center gap-2 cursor-pointer transition-colors ${currentStep >= 1 ? "text-teal-600" : "text-gray-400"
                }`}
              onClick={() => setCurrentStep(1)}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-teal-600 text-white" : "bg-gray-200"
                }`}>
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span>Thông tin cơ bản</span>
            </div>
            <div
              className={`flex items-center gap-2 cursor-pointer transition-colors ${currentStep >= 2 ? "text-teal-600" : "text-gray-400"
                }`}
              onClick={() => setCurrentStep(2)}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-teal-600 text-white" : "bg-gray-200"
                }`}>
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span>Bảo hiểm & Liên hệ</span>
            </div>
            <div
              className={`flex items-center gap-2 cursor-pointer transition-colors ${currentStep >= 3 ? "text-teal-600" : "text-gray-400"
                }`}
              onClick={() => setCurrentStep(3)}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-teal-600 text-white" : "bg-gray-200"
                }`}>
                {currentStep > 3 ? "✓" : "3"}
              </div>
              <span>Tiền sử y tế</span>
            </div>
            <div
              className={`flex items-center gap-2 cursor-pointer transition-colors ${currentStep >= 4 ? "text-teal-600" : "text-gray-400"
                }`}
              onClick={() => setCurrentStep(4)}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${currentStep >= 4 ? "bg-teal-600 text-white" : "bg-gray-200"
                }`}>
                {currentStep > 4 ? "✓" : "4"}
              </div>
              <span>Xác nhận & Tạo</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Right Panel - Form
  const rightPanel = (
    <div className="space-y-6">
      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <User size={24} className="text-teal-600" />
                Thông tin cơ bản *
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              {/* ID Photo Upload */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {idPhotoUrl ? (
                      <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-teal-500">
                        <img src={idPhotoUrl} alt="ID Photo" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
                        <IdCard className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Ảnh thẻ (3:4)</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Tải lên ảnh thẻ với tỷ lệ 3:4 (VD: 300x400px, 600x800px)
                    </p>
                    <label htmlFor="id-photo-input">
                      <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm">
                        <Upload size={16} />
                        {uploadingPhoto ? "Đang tải..." : idPhotoUrl ? "Thay ảnh" : "Tải ảnh lên"}
                      </div>
                    </label>
                    <input
                      id="id-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleIdPhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Họ và tên *"
                  placeholder="Nguyễn Văn A"
                  value={profile.full_name}
                  onValueChange={(v) => setProfile({ ...profile, full_name: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<User className="text-default-400" size={20} />}
                  isRequired
                  isInvalid={!!errors.full_name}
                  errorMessage={errors.full_name}
                />
                <Input
                  type="date"
                  label="Ngày sinh *"
                  value={profile.dob}
                  onValueChange={(v) => setProfile({ ...profile, dob: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Calendar className="text-default-400" size={20} />}
                  isRequired
                  isInvalid={!!errors.dob}
                  errorMessage={errors.dob}
                />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Giới tính *"
                  selectedKeys={[profile.gender]}
                  onSelectionChange={(keys) => setProfile({ ...profile, gender: Array.from(keys)[0] })}
                  variant="bordered"
                  labelPlacement="outside"
                  isRequired
                >
                  {genderOptions.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Nhóm máu"
                  placeholder="Chọn nhóm máu"
                  selectedKeys={profile.blood_type !== undefined && profile.blood_type !== null ? [profile.blood_type] : [""]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    setProfile({ ...profile, blood_type: selected || "" });
                  }}
                  variant="bordered"
                  labelPlacement="outside"
                  isInvalid={!!errors.blood_type}
                >
                  {bloodTypeOptions.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>
                {errors.blood_type && <p className="mt-1 text-sm text-red-600">{errors.blood_type}</p>}

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CCCD"
                  placeholder="001234567890"
                  value={profile.citizenship}
                  onValueChange={(v) => setProfile({ ...profile, citizenship: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<IdCard className="text-default-400" size={20} />}
                  isInvalid={!!errors.citizenship}
                  errorMessage={errors.citizenship}
                />

                <Input
                  type="email"
                  label="Email"
                  value={profile.email}
                  onValueChange={(v) => setProfile({ ...profile, email: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Mail className="text-default-400" size={20} />}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Số điện thoại"
                  placeholder="0376971168 hoặc 0912 345 678"
                  value={profile.phone}
                  onValueChange={(v) => {
                    // Chỉ cho phép số, khoảng trắng, dấu gạch ngang, dấu ngoặc đơn
                    const cleaned = v.replace(/[^\d\s\-\(\)]/g, '');
                    setProfile({ ...profile, phone: cleaned });
                  }}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Phone className="text-default-400" size={20} />}
                  isInvalid={!!errors.phone}
                  errorMessage={errors.phone}
                />

                <Input
                  label="Địa chỉ chi tiết (tùy chọn)"
                  placeholder="Số nhà, tên đường, tòa nhà..."
                  value={profile.address_detail}
                  onValueChange={(v) => setProfile({ ...profile, address_detail: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<MapPin className="text-default-400" size={20} />}
                />
              </div>

              {/* Province/District/Ward */}
              <AddressSelector
                provinceCode={profile.province_code}
                districtCode={profile.district_code}
                wardCode={profile.ward_code}
                onProvinceChange={(code) => setProfile(prev => ({ ...prev, province_code: code || null, district_code: null, ward_code: null }))}
                onDistrictChange={(code) => setProfile(prev => ({ ...prev, district_code: code || null, ward_code: null }))}
                onWardChange={(code) => setProfile(prev => ({ ...prev, ward_code: code || null }))}
                required={false}
                isInvalid={!!errors.address}
                errorMessage={errors.address}
              />


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nghề nghiệp"
                  placeholder="VD: Giáo viên"
                  value={profile.occupation}
                  onValueChange={(v) => setProfile({ ...profile, occupation: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Briefcase className="text-default-400" size={20} />}
                />
                <Input
                  label="Dân tộc"
                  value={profile.ethnicity}
                  onValueChange={(v) => setProfile({ ...profile, ethnicity: v })}
                  variant="bordered"
                  labelPlacement="outside"
                />
                <Input
                  label="Nơi làm việc"
                  placeholder="Công ty/Cơ quan"
                  value={profile.workplace}
                  onValueChange={(v) => setProfile({ ...profile, workplace: v })}
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>
            </CardBody>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="light"
              startContent={<ArrowLeft size={18} />}
              onPress={() => router.back()}
            >
              Quay lại
            </Button>
            <Button
              color="primary"
              onPress={() => setCurrentStep(2)}
            >
              Tiếp theo
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Insurance & Emergency Contact */}
      {currentStep === 2 && (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Shield size={24} className="text-blue-600" />
                Bảo hiểm & Liên hệ khẩn cấp
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <BHYTInput
                value={profile.insurance_number}
                onChange={(v) => setProfile({ ...profile, insurance_number: v })}
              />

              <Input
                type="date"
                label="BHYT hết hạn"
                value={profile.insurance_valid_to}
                onValueChange={(v) => setProfile({ ...profile, insurance_valid_to: v })}
                variant="bordered"
                labelPlacement="outside"
                description="Ngày hết hạn thẻ BHYT"
                isInvalid={!!errors.insurance_valid_to}
                errorMessage={errors.insurance_valid_to}
              />


              <Divider className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Người liên hệ khẩn cấp"
                  placeholder="Nguyễn Văn B"
                  value={profile.emergency_contact_name}
                  onValueChange={(v) => setProfile({ ...profile, emergency_contact_name: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<User className="text-default-400" size={20} />}
                />
                <Input
                  type="tel"
                  label="Số điện thoại"
                  placeholder="0912 345 678"
                  value={profile.emergency_contact_phone}
                  onValueChange={(v) => setProfile({ ...profile, emergency_contact_phone: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Phone className="text-default-400" size={20} />}
                  isInvalid={!!errors.emergency_contact_phone}
                  errorMessage={errors.emergency_contact_phone}
                />

                <Input
                  label="Quan hệ"
                  placeholder="VD: Vợ/Chồng, Con"
                  value={profile.emergency_contact_relationship}
                  onValueChange={(v) => setProfile({ ...profile, emergency_contact_relationship: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<UsersIcon className="text-default-400" size={20} />}
                />
              </div>

              <Divider className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Đối tượng"
                  selectedKeys={[profile.patient_type]}
                  onSelectionChange={(keys) => setProfile({ ...profile, patient_type: Array.from(keys)[0] })}
                  variant="bordered"
                  labelPlacement="outside"
                >
                  {patientTypeOptions.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Nguồn giới thiệu"
                  selectedKeys={[profile.referral_source]}
                  onSelectionChange={(keys) => setProfile({ ...profile, referral_source: Array.from(keys)[0] })}
                  variant="bordered"
                  labelPlacement="outside"
                >
                  {referralOptions.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>
              </div>

              {profile.referral_source === "medical" && (
                <Input
                  label="Chẩn đoán nơi giới thiệu"
                  placeholder="Chẩn đoán từ cơ sở y tế trước"
                  value={profile.referral_diagnosis}
                  onValueChange={(v) => setProfile({ ...profile, referral_diagnosis: v })}
                  variant="bordered"
                  labelPlacement="outside"
                />
              )}
            </CardBody>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="light"
              startContent={<ArrowLeft size={18} />}
              onPress={() => setCurrentStep(1)}
            >
              Quay lại
            </Button>
            <Button
              color="primary"
              onPress={() => setCurrentStep(3)}
            >
              Tiếp theo
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Medical History */}
      {currentStep === 3 && (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Heart size={24} className="text-red-600" />
                Tiền sử y tế
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              {/* Allergies */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dị ứng</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="VD: Penicillin, Tôm, Sữa..."
                    value={allergyInput}
                    onValueChange={setAllergyInput}
                    onKeyPress={(e) => e.key === "Enter" && handleAddItem("allergy")}
                    variant="bordered"
                  />
                  <Button color="primary" onPress={() => handleAddItem("allergy")} isIconOnly>
                    <Plus size={18} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((item, index) => (
                    <Chip
                      key={index}
                      onClose={() => handleRemoveItem("allergies", index)}
                      variant="flat"
                      color="danger"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <label className="text-sm font-medium mb-2 block">Bệnh mạn tính</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="VD: Tiểu đường, Cao huyết áp..."
                    value={conditionInput}
                    onValueChange={setConditionInput}
                    onKeyPress={(e) => e.key === "Enter" && handleAddItem("condition")}
                    variant="bordered"
                  />
                  <Button color="primary" onPress={() => handleAddItem("condition")} isIconOnly>
                    <Plus size={18} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.chronic_conditions.map((item, index) => (
                    <Chip
                      key={index}
                      onClose={() => handleRemoveItem("chronic_conditions", index)}
                      variant="flat"
                      color="warning"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <label className="text-sm font-medium mb-2 block">Thuốc đang dùng</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="VD: Aspirin 100mg hàng ngày..."
                    value={medicationInput}
                    onValueChange={setMedicationInput}
                    onKeyPress={(e) => e.key === "Enter" && handleAddItem("medication")}
                    variant="bordered"
                  />
                  <Button color="primary" onPress={() => handleAddItem("medication")} isIconOnly>
                    <Plus size={18} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.medications.map((item, index) => (
                    <Chip
                      key={index}
                      onClose={() => handleRemoveItem("medications", index)}
                      variant="flat"
                      color="primary"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="light"
              startContent={<ArrowLeft size={18} />}
              onPress={() => setCurrentStep(2)}
            >
              Quay lại
            </Button>
            <Button
              color="primary"
              onPress={() => setCurrentStep(4)}
            >
              Tiếp theo
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Consents & Submit */}
      {currentStep === 4 && (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle size={24} className="text-orange-600" />
                Đồng ý & Cam kết
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Checkbox
                isSelected={profile.consents.privacy}
                onValueChange={(v) =>
                  setProfile({ ...profile, consents: { ...profile.consents, privacy: v } })
                }
              >
                <span className="text-sm">
                  Tôi đồng ý cho phép MedConnect lưu trữ và sử dụng thông tin y tế của tôi theo{" "}
                  <a href="#" className="text-blue-600 underline">
                    chính sách bảo mật
                  </a>
                </span>
              </Checkbox>

              <Checkbox
                isSelected={profile.consents.telemedicine}
                onValueChange={(v) =>
                  setProfile({ ...profile, consents: { ...profile.consents, telemedicine: v } })
                }
              >
                <span className="text-sm">
                  Tôi đồng ý tham gia dịch vụ khám bệnh từ xa (telemedicine) khi cần thiết
                </span>
              </Checkbox>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin trước khi tạo hồ sơ. Một số thông tin
                  không thể chỉnh sửa sau khi tạo.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="light"
              startContent={<ArrowLeft size={18} />}
              onPress={() => setCurrentStep(3)}
            >
              Quay lại
            </Button>
            <Button
              color="primary"
              startContent={<Save size={18} />}
              onPress={handleSubmit}
              isLoading={saving}
            >
              Tạo hồ sơ bệnh án
            </Button>
          </div>
        </>
      )}
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
      <PatientFrame title="Tạo hồ sơ bệnh án mới">
        <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
      </PatientFrame>
    </>
  );
}
