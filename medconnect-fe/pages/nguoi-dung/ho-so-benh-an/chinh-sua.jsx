"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Select,
  SelectItem,
  Chip,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  Save,
  ArrowLeft,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  IdCard,
  Shield,
  Heart,
  Users as UsersIcon,
  Trash2,
  AlertTriangle,
  Briefcase,
  FileText,
  AlertCircle,
  Upload,
} from "lucide-react";
import { PatientFrame, Grid } from "@/components/layouts/";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import BHYTInput from "@/components/ui/BHYTInput";
import AddressSelector from "@/components/ui/AddressSelector";
import { useAddressData } from "@/hooks/useAddressData";

export default function EditEMRPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      privacy: true,
      telemedicine: true,
    },
  });

  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");
  const [idPhotoUrl, setIdPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState({});
  const { getProvinceName, getDistrictName, getWardName } = useAddressData();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập");
      router.push("/dang-nhap");
      return;
    }

    fetchEMR(user);
  }, [user, authLoading]);

  const fetchEMR = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("http://localhost:8080/api/medical-records/my-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.detail) {
          const parsed = typeof data.detail === "string" ? JSON.parse(data.detail) : data.detail;
          const pp = parsed.patient_profile || {};
          const mh = parsed.medical_history || {};
          const admin = parsed.administrative_info || {};

          setProfile({
            full_name: pp.full_name || "",
            dob: pp.date_of_birth || "",
            gender: pp.gender || "Nam",
            blood_type: pp.blood_type || "",
            address: typeof pp.address === "object" ? (pp.address.full || "") : (pp.address || ""),
            address_detail: typeof pp.address === "object" ? (pp.address.address_detail || "") : "",
            province_code: typeof pp.address === "object" ? (pp.address.province_code || null) : null,
            district_code: typeof pp.address === "object" ? (pp.address.district_code || null) : null,
            ward_code: typeof pp.address === "object" ? (pp.address.ward_code || null) : null,
            phone: pp.phone || "",
            email: pp.email || "",
            insurance_number: pp.insurance_number || "",
            insurance_valid_to: pp.insurance_valid_to || "",
            emergency_contact_name: pp.emergency_contact?.name || pp.emergency_contact_name || "",
            emergency_contact_phone: pp.emergency_contact?.phone || pp.emergency_contact_phone || "",
            emergency_contact_relationship: pp.emergency_contact?.relation || pp.emergency_contact_relationship || "",
            citizenship: pp.citizenship || "",
            occupation: pp.occupation || "",
            ethnicity: pp.ethnicity || "Kinh",
            foreign_national: pp.foreign_national || false,
            workplace: pp.workplace || "",
            patient_type: admin.patient_type || "BHYT",
            referral_source: admin.referral_source || "self",
            referral_diagnosis: admin.referral_diagnosis || "",
            allergies: mh.allergies ? mh.allergies.split(", ").filter((x) => x && x !== "Không") : [],
            chronic_conditions: mh.previous_conditions ? mh.previous_conditions.split(", ").filter((x) => x && x !== "Không") : [],
            medications: mh.current_medications ? mh.current_medications.split(", ").filter((x) => x && x !== "Không") : [],
            consents: parsed.consents || { privacy: true, telemedicine: true },
          });
          setIdPhotoUrl(pp.id_photo_url || "");
        }
      } else {
        toast.error("Không tìm thấy hồ sơ bệnh án");
        router.push("/nguoi-dung/ho-so-benh-an");
      }
    } catch (error) {
      console.error("Error fetching EMR:", error);
      toast.error("Lỗi tải hồ sơ bệnh án");
    } finally {
      setLoading(false);
    }
  };

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

        const response = await fetch("http://localhost:8080/api/medical-photo/upload", {
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

    // HSBA-02: Tên trống
    if (!profile.full_name || profile.full_name.trim().length === 0) {
      newErrors.full_name = "Vui lòng nhập họ và tên";
    } else if (profile.full_name.length > 100) {
      newErrors.full_name = "Tối đa 100 ký tự";
    }

    // HSBA-04: Ngày sinh tương lai
    if (!profile.dob) {
      newErrors.dob = "Vui lòng chọn ngày sinh";
    } else {
      const dob = new Date(profile.dob);
      const today = new Date(new Date().toISOString().split("T")[0]);
      if (dob > today) newErrors.dob = "Ngày sinh không hợp lệ";
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 12) newErrors.dob = "Tuổi phải ít nhất 12 tuổi";
    }

    // Giới tính bắt buộc
    if (!profile.gender) newErrors.gender = "Vui lòng chọn giới tính";

    // HSBA-08: Nhóm máu
    if (!profile.blood_type || profile.blood_type === "") {
      newErrors.blood_type = "Vui lòng chọn nhóm máu";
    }

    // HSBA-05: CCCD
    if (profile.citizenship && !/^\d{12}$/.test(profile.citizenship)) {
      newErrors.citizenship = "Căn cước công dân phải gồm 12 chữ số";
    }

    // HSBA-07: Email sai định dạng
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // HSBA-06: SĐT không hợp lệ
    if (profile.phone && !/^0\d{9}$/.test(profile.phone)) {
      newErrors.phone = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0";
    }

    // HSBA-09: BHYT quá hạn
    if (profile.insurance_number) {
      if (!/^[A-Z]{2}\d{13}$/i.test(profile.insurance_number)) {
        newErrors.insurance_number = "Mã BHYT không hợp lệ (2 chữ + 13 số)";
      }
      if (!profile.insurance_valid_to) {
        newErrors.insurance_valid_to = "Vui lòng nhập ngày hết hạn BHYT";
      } else {
        const validTo = new Date(profile.insurance_valid_to);
        const today = new Date(new Date().toISOString().split("T")[0]);
        if (validTo < today)
          newErrors.insurance_valid_to = "Ngày hết hạn phải từ hôm nay trở đi";
      }
    }

    // Liên hệ khẩn cấp
    if (profile.emergency_contact_phone && !/^0\d{9}$/.test(profile.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = "Số điện thoại liên hệ khẩn cấp không hợp lệ";
    }
    if (profile.emergency_contact_phone && !profile.emergency_contact_name?.trim()) {
      newErrors.emergency_contact_name = "Vui lòng nhập tên người liên hệ khẩn cấp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    // Validate trước khi lưu
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
          phone: profile.phone,
          email: profile.email,
          citizenship: profile.citizenship,
          insurance_number: profile.insurance_number,
          insurance_valid_to: profile.insurance_valid_to,
          id_photo_url: idPhotoUrl,
          emergency_contact: {
            name: profile.emergency_contact_name,
            phone: profile.emergency_contact_phone,
            relation: profile.emergency_contact_relationship,
          },
          occupation: profile.occupation,
          ethnicity: profile.ethnicity,
          foreign_national: profile.foreign_national,
          workplace: profile.workplace,
        },
        administrative_info: {
          patient_type: profile.patient_type,
          referral_source: profile.referral_source,
          referral_diagnosis: profile.referral_diagnosis,
        },
        medical_history: {
          allergies: profile.allergies.join(", ") || "Không",
          previous_conditions: profile.chronic_conditions.join(", ") || "Không",
          current_medications: profile.medications.join(", ") || "Không",
        },
        consents: profile.consents,
      };

      const response = await fetch("http://localhost:8080/api/medical-records/my-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          detail: JSON.stringify(emrData)
        }),
      });

      if (response.ok) {
        toast.success("Cập nhật hồ sơ bệnh án thành công!");
        setTimeout(() => router.push("/nguoi-dung/ho-so-benh-an"), 1500);
      } else {
        throw new Error("Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating EMR:", error);
      toast.error(error.message || "Không thể cập nhật hồ sơ bệnh án");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    setDeleting(true);
    try {
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:8080/api/medical-records/my-profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Xóa hồ sơ bệnh án thành công!");
        setTimeout(() => router.push("/nguoi-dung/ho-so-benh-an"), 1500);
      } else {
        throw new Error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Error deleting EMR:", error);
      toast.error(error.message || "Không thể xóa hồ sơ bệnh án");
    } finally {
      setDeleting(false);
      onOpenChange();
    }
  };

  if (loading) {
    return (
      <PatientFrame title="Chỉnh sửa hồ sơ bệnh án">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </PatientFrame>
    );
  }

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

  // Left Panel
  const leftPanel = (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6">
          <div className="flex items-start gap-3">
            <FileText className="text-teal-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Chỉnh sửa hồ sơ</h3>
              <p className="text-sm text-gray-600">Cập nhật thông tin hồ sơ bệnh án của bạn.</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-yellow-50 border-yellow-100">
        <CardBody className="p-4">
          <p className="text-xs font-semibold text-yellow-900 mb-2">⚠️ Lưu ý</p>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Kiểm tra kỹ thông tin trước khi lưu</li>
            <li>• Lịch sử khám bệnh không bị xóa</li>
            <li>• Chỉ cập nhật thông tin cơ bản</li>
          </ul>
        </CardBody>
      </Card>

      <Card className="border-red-200">
        <CardBody className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="text-red-600 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-sm text-red-900">Xóa hồ sơ</h4>
              <p className="text-xs text-red-700 mt-1">
                Hành động này không thể hoàn tác. Toàn bộ hồ sơ bệnh án sẽ bị xóa.
              </p>
            </div>
          </div>
          <Button fullWidth color="danger" variant="flat" startContent={<Trash2 size={18} />} onPress={onOpen}>
            Xóa hồ sơ bệnh án
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  // Right Panel - Same form as create but with update button
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
                <label htmlFor="id-photo-input-edit">
                  <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm">
                    <Upload size={16} />
                    {uploadingPhoto ? "Đang tải..." : idPhotoUrl ? "Thay ảnh" : "Tải ảnh lên"}
                  </div>
                </label>
                <input
                  id="id-photo-input-edit"
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
              selectedKeys={profile.blood_type ? [profile.blood_type] : []}
              onSelectionChange={(keys) => setProfile({ ...profile, blood_type: Array.from(keys)[0] })}
              variant="bordered"
              labelPlacement="outside"
              isInvalid={!!errors.blood_type}
            // heroui Select có thể không có errorMessage prop — nếu có thì thêm, nếu không, hiển thị lỗi bằng text nhỏ
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
              placeholder="0912 345 678"
              value={profile.phone}
              onValueChange={(v) => setProfile({ ...profile, phone: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Phone className="text-default-400" size={20} />}
              isInvalid={!!errors.phone}
              errorMessage={errors.phone}
            />
            <Input
              label="Địa chỉ chi tiết (tùy chọn)"
              value={profile.address_detail}
              onValueChange={(v) => setProfile({ ...profile, address_detail: v })}
              variant="bordered"
              labelPlacement="outside"
              startContent={<MapPin className="text-default-400" size={20} />}
            />
          </div>

          <AddressSelector
            provinceCode={profile.province_code}
            districtCode={profile.district_code}
            wardCode={profile.ward_code}
            onProvinceChange={(code) => setProfile(prev => ({ ...prev, province_code: code || null, district_code: null, ward_code: null }))}
            onDistrictChange={(code) => setProfile(prev => ({ ...prev, district_code: code || null, ward_code: null }))}
            onWardChange={(code) => setProfile(prev => ({ ...prev, ward_code: code || null }))}
            required={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nghề nghiệp"
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
              value={profile.workplace}
              onValueChange={(v) => setProfile({ ...profile, workplace: v })}
              variant="bordered"
              labelPlacement="outside"
            />
          </div>
        </CardBody>
      </Card>

      {/* Insurance & Emergency Contact */}
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
              value={profile.referral_diagnosis}
              onValueChange={(v) => setProfile({ ...profile, referral_diagnosis: v })}
              variant="bordered"
              labelPlacement="outside"
            />
          )}
        </CardBody>
      </Card>

      {/* Medical History */}
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
                <Chip key={index} onClose={() => handleRemoveItem("allergies", index)} variant="flat" color="danger">
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
                <Chip key={index} onClose={() => handleRemoveItem("medications", index)} variant="flat" color="primary">
                  {item}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="light" startContent={<ArrowLeft size={18} />} onPress={() => router.back()}>
          Quay lại
        </Button>
        <Button color="primary" startContent={<Save size={18} />} onPress={handleSubmit} isLoading={saving}>
          Cập nhật hồ sơ
        </Button>
      </div>
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-2 items-center text-red-600">
                <AlertTriangle size={24} />
                Xác nhận xóa hồ sơ
              </ModalHeader>
              <ModalBody>
                <p>Bạn có chắc chắn muốn xóa hồ sơ bệnh án này không?</p>
                <p className="text-red-600 font-semibold">Hành động này không thể hoàn tác!</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button color="danger" onPress={handleDelete} isLoading={deleting}>
                  Xóa hồ sơ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <PatientFrame title="Chỉnh sửa hồ sơ bệnh án">
        <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
      </PatientFrame>
    </>
  );
}
