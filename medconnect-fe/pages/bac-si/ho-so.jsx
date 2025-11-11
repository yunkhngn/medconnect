"use client";

import { useEffect, useState } from "react";
import { Save, Upload, User, Mail, Phone, IdCard, Stethoscope, FileText, Calendar, AlertCircle, Plus, Edit2, Award, Building2, Briefcase, CheckCircle, Trash2, GraduationCap, MapPin, Eye, X, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";
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
import ConfirmModal from "@/components/ui/ConfirmModal";
import AddressSelector from "@/components/ui/AddressSelector";
import { useToast } from "@/hooks/useToast";
import { useAvatar } from "@/hooks/useAvatar";
import { useAddressData } from "@/hooks/useAddressData";
import { auth } from "@/lib/firebase";

export default function DoctorProfile() {
  const toast = useToast();
  const { getAvatarUrl, uploadAvatar, uploading } = useAvatar();
  const { getProvinceName, getDistrictName, getWardName } = useAddressData();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    speciality_id: null,
    experience_years: 0,
    education_level: "",
    bio: "",
    clinic_address: "",
    province_code: null,
    province_name: "",
    district_code: null,
    district_name: "",
    ward_code: null,
    ward_name: "",
    active_license: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({
    phone: "",
    experienceYears: "",
    educationLevel: "",
  });


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
    notes: "",
    proof_images: ""
  });
  const [savingLicense, setSavingLicense] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Delete License Modal
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [deletingLicense, setDeletingLicense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // PDF Viewer Modal
  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose } = useDisclosure();
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        console.log("[Specialities] Fetched data:", data);
        if (data.length > 0) {
          console.log("[Specialities] First item keys:", Object.keys(data[0]));
          console.log("[Specialities] First item:", data[0]);
        }
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

      // Fetch doctor profile
      const response = await fetch("http://localhost:8080/doctor/dashboard/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[Doctor Data] Raw response:", data);
        console.log("[Doctor Data] speciality_id:", data.speciality_id);
        console.log("[Doctor Data] active_license:", data.active_license);
        console.log("[Doctor Data] avatar:", data.avatar);

        setDoctor(prev => ({
          ...prev,
          name: data.name || prev.name || "",
          email: data.email || prev.email || "",
          phone: data.phone || prev.phone || "",
          specialization: data.specialization || prev.specialization || "",
          speciality_id: data.speciality_id || data.specialityId || prev.speciality_id || null,
          // Map experience_years - keep as number for calculations, but also store as string for input
          experienceYears: data.experience_years !== undefined && data.experience_years !== null ? String(data.experience_years) : (prev.experienceYears || ""),
          experience_years: data.experience_years !== undefined && data.experience_years !== null ? data.experience_years : (prev.experience_years || 0),
          // Map education_level
          educationLevel: data.education_level !== undefined && data.education_level !== null ? data.education_level : (prev.educationLevel || ""),
          education_level: data.education_level !== undefined && data.education_level !== null ? data.education_level : (prev.education_level || ""),
          // Map bio
          bio: data.bio !== undefined && data.bio !== null ? data.bio : (prev.bio || ""),
          // Map clinic address
          clinic_address: data.clinic_address !== undefined && data.clinic_address !== null ? data.clinic_address : (prev.clinic_address || ""),
          // Map address fields
          province_code: data.province_code !== undefined && data.province_code !== null ? data.province_code : (prev.province_code || null),
          province_name: data.province_name || prev.province_name || "",
          district_code: data.district_code !== undefined && data.district_code !== null ? data.district_code : (prev.district_code || null),
          district_name: data.district_name || prev.district_name || "",
          ward_code: data.ward_code !== undefined && data.ward_code !== null ? data.ward_code : (prev.ward_code || null),
          ward_name: data.ward_name || prev.ward_name || "",
          // Map active license
          active_license: data.active_license || prev.active_license || null
        }));

        // Fetch avatar from backend API
        try {
          const avatarResponse = await fetch(`http://localhost:8080/api/avatar`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (avatarResponse.ok) {
            const avatarData = await avatarResponse.json();
            console.log("[Avatar] Backend response:", avatarData);

            // Priority: DB custom avatar > Gmail photo > null
            const finalAvatarUrl = avatarData.avatarUrl || firebaseUser.photoURL || null;
            console.log("[Avatar] Final URL:", finalAvatarUrl);
            setAvatarUrl(finalAvatarUrl);
          } else {
            // Fallback to Gmail photo if API fails
            console.log("[Avatar] API failed, using Gmail photo:", firebaseUser.photoURL);
            setAvatarUrl(firebaseUser.photoURL || null);
          }
        } catch (avatarError) {
          console.error("[Avatar] Fetch error:", avatarError);
          setAvatarUrl(firebaseUser.photoURL || null);
        }
      } else {
        console.error("[Doctor Data] Response not OK:", response.status);
        throw new Error("Failed to fetch doctor data");
      }
    } catch (error) {
      console.error("Fetch doctor data error:", error);
      toast.error("Không thể tải thông tin bác sĩ");
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

    toast.loading("Đang tải ảnh lên...");
    try {
      console.log("[Avatar Upload] Starting upload...");
      const avatarUrl = await uploadAvatar(file);
      console.log("[Avatar Upload] Success, URL:", avatarUrl);
      setAvatarUrl(avatarUrl);
      toast.success("Cập nhật ảnh đại diện thành công!");
      // Refresh doctor data to get updated avatar from DB
      await fetchDoctorData(user);
    } catch (error) {
      console.error("[Avatar Upload] Error:", error);
      toast.error(error.message || "Tải ảnh đại diện thất bại");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    const phoneRegex = /^(0|\+84)[0-9]{9}$/;

    if (!doctor.phone) {
      setErrors(prev => ({ ...prev, phone: "Vui lòng nhập số điện thoại" }));
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    if (!phoneRegex.test(doctor.phone)) {
      setErrors(prev => ({ ...prev, phone: "Số điện thoại không hợp lệ (VD: 0912345678)" }));
      toast.error("Số điện thoại không hợp lệ");
      return;
    } else {
      setErrors(prev => ({ ...prev, phone: "" }));
    }

    // Validate số năm kinh nghiệm
    if (doctor.experienceYears === null || doctor.experienceYears === undefined || doctor.experienceYears === "") {
      setErrors(prev => ({ ...prev, experienceYears: "Vui lòng nhập số năm kinh nghiệm" }));
      toast.error("Vui lòng nhập số năm kinh nghiệm");
      return;
    }

    const years = Number(doctor.experienceYears);
    if (isNaN(years) || years < 0 || !Number.isInteger(years)) {
      setErrors(prev => ({ ...prev, experienceYears: "Số năm kinh nghiệm phải là số nguyên không âm" }));
      toast.error("Số năm kinh nghiệm phải là số nguyên không âm");
      return;
    } else {
      setErrors(prev => ({ ...prev, experienceYears: "" }));
    }

    // Validate trình độ học vấn
    if (!doctor.educationLevel || doctor.educationLevel.trim() === "") {
      setErrors(prev => ({ ...prev, educationLevel: "Vui lòng nhập trình độ học vấn" }));
      toast.error("Vui lòng nhập trình độ học vấn");
      return;
    } else {
      setErrors(prev => ({ ...prev, educationLevel: "" }));
    }


    setSaving(true);
    try {
      const token = await user.getIdToken();

      const payload = {
        phone: doctor.phone,
        speciality_id: doctor.speciality_id,
        experience_years: doctor.experienceYears ? Number(doctor.experienceYears) : (doctor.experience_years || 0),
        education_level: doctor.educationLevel || doctor.education_level || "",
        bio: doctor.bio || "",
        clinic_address: doctor.clinic_address || "",
        province_code: doctor.province_code,
        province_name: doctor.province_name,
        district_code: doctor.district_code,
        district_name: doctor.district_name,
        ward_code: doctor.ward_code,
        ward_name: doctor.ward_name
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
        await fetchDoctorData(user);
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

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:8080/api/licenses/upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const currentImages = licenseForm.proof_images ? JSON.parse(licenseForm.proof_images) : [];
        const newImages = [...currentImages, ...data.imageUrls];
        setLicenseForm({ ...licenseForm, proof_images: JSON.stringify(newImages) });
        toast.success(`Upload ${files.length} hình ảnh thành công!`);
      } else {
        throw new Error('Upload thất bại');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Không thể upload hình ảnh');
    } finally {
      setUploadingImages(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleOpenLicenseModal = (license = null) => {
    if (license) {
      setEditingLicense(license);
      setLicenseForm({
        license_number: license.licenseNumber || license.license_number || "",
        issued_date: license.issuedDate || license.issued_date || "",
        expiry_date: license.expiryDate || license.expiry_date || "",
        issued_by: license.issuedBy || license.issued_by || "Cục Quản lý Khám chữa bệnh - Bộ Y tế",
        issuer_title: license.issuerTitle || license.issuer_title || "Cục trưởng",
        scope_of_practice: license.scopeOfPractice || license.scope_of_practice || "",
        notes: license.notes || "",
        proof_images: license.proofImages || license.proof_images || ""
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
        notes: "",
        proof_images: ""
      });
    }
    setSelectedImageFiles([]); // Reset image file selection
    onLicenseModalOpen();
  };

  const validateLicenseNumber = (licenseNumber) => {
    // Format chuẩn Bộ Y Tế: XXXXXX/BYT-GPHN (6 số / BYT-GPHN)
    // VD: 000001/BYT-GPHN, 123456/BYT-GPHN
    const licenseRegex = /^\d{6}\/BYT-GPHN$/;
    return licenseRegex.test(licenseNumber.trim());
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

    // Validate license number format
    if (!validateLicenseNumber(licenseForm.license_number)) {
      toast.error("Số giấy phép không đúng định dạng! Định dạng chuẩn: XXXXXX/BYT-GPHN (VD: 000001/BYT-GPHN)");
      return;
    }

    // Validate images for new license
    if (!editingLicense && !licenseForm.proof_images) {
      toast.error("Vui lòng upload hình ảnh minh chứng giấy phép!");
      return;
    }

    setSavingLicense(true);
    try {
      const token = await user.getIdToken();
      const licenseId = editingLicense?.licenseId || editingLicense?.license_id;
      const url = editingLicense
        ? `http://localhost:8080/api/licenses/my/${licenseId}`
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
        await fetchDoctorData(user);
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

  const handleDeleteLicense = (license) => {
    // Kiểm tra số lượng license
    if (licenses.length <= 1) {
      toast.error("Không thể xóa! Bác sĩ phải có ít nhất 1 giấy phép hành nghề");
      return;
    }

    // Mở modal confirm
    setDeletingLicense(license);
    onDeleteModalOpen();
  };

  const confirmDeleteLicense = async () => {
    if (!user || !deletingLicense) return;

    setIsDeleting(true);
    try {
      const token = await user.getIdToken();
      const licenseId = deletingLicense.licenseId || deletingLicense.license_id;

      const response = await fetch(`http://localhost:8080/api/licenses/my/${licenseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Đã xóa giấy phép thành công!");
        onDeleteModalClose();
        setDeletingLicense(null);
        await fetchLicenses(user); // Refresh danh sách
        await fetchDoctorData(user); // Refresh active license
      } else {
        const error = await response.json();
        throw new Error(error.message || "Không thể xóa giấy phép");
      }
    } catch (error) {
      console.error("License delete error:", error);
      toast.error(error.message || "Không thể xóa giấy phép");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <DoctorFrame title="Hồ sơ bác sĩ">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </DoctorFrame>
    );
  }

  // Left Sidebar Panel
  const leftPanel = (
    <div className="space-y-4">
      {/* Avatar Card */}
      <Card className="shadow-md">
        <CardBody className="flex flex-col items-center p-6">
          <div className="relative group mb-4">
            <Avatar
              src={avatarUrl}
              className="w-32 h-32 text-large border-4 border-teal-500 shadow-lg"
              name={doctor.name}
            />
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Upload className="text-white" size={32} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800 text-center mb-1">{doctor.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{doctor.email}</p>
          <p className="text-sm text-teal-600 font-medium mb-3">
            {doctor.specialization || "Chưa có chuyên khoa"}
          </p>
          {doctor.experience_years > 0 && (
            <Chip size="sm" color="primary" variant="flat" className="mb-2 flex">
              <span>{doctor.experience_years} năm kinh nghiệm</span>
            </Chip>
          )}
        </CardBody>
      </Card>

      {/* Status Card */}
      <Card className="shadow-md bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Trạng thái:</span>
            <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle size={14} />}>
              Đang hoạt động
            </Chip>
          </div>
        </CardBody>
      </Card>

      {/* Active License Card */}
      {doctor.active_license && (
        <Card className="shadow-md">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-purple-700" />
              <p className="text-xs font-semibold text-purple-900">Giấy phép hiện hành</p>
            </div>
            <p className="text-sm font-medium text-purple-900">
              {doctor.active_license.license_number || doctor.active_license.licenseNumber}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Hết hạn: {formatDate(doctor.active_license.expiry_date || doctor.active_license.expiryDate) || "Vô thời hạn"}
            </p>
            {doctor.active_license.days_until_expiry !== null &&
              doctor.active_license.days_until_expiry < 365 &&
              doctor.active_license.days_until_expiry > 0 && (
                <Chip size="sm" color="warning" variant="flat" className="mt-2">
                  <AlertCircle size={12} className="mr-1" />
                  Còn {doctor.active_license.days_until_expiry} ngày
                </Chip>
              )}
          </CardBody>
        </Card>
      )}

      {/* Info Card */}
      <Card className="shadow-md bg-blue-50 border border-blue-200">
        <CardBody className="p-4">
          <p className="text-xs font-semibold text-blue-900 mb-1">💡 Thông tin</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Email không thể thay đổi. Liên hệ quản trị viên nếu cần hỗ trợ.
          </p>
        </CardBody>
      </Card>
    </div>
  );

  // Right Main Panel
  const rightPanel = (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <User size={24} className="text-teal-600" />
            Thông tin cá nhân
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Họ và tên"
              value={doctor.name || ""}
              variant="bordered"
              labelPlacement="outside"
              startContent={<User className="text-default-400" size={20} />}
              isReadOnly
              classNames={{
                input: "text-base",
                inputWrapper: "border-default-200 bg-gray-50"
              }}
            />
            <Input
              label="Email"
              value={doctor.email || ""}
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
            <Input
              type="tel"
              label="Số điện thoại"
              placeholder="VD: 0912345678"
              value={doctor.phone || ""}
              onValueChange={(v) => {
                setDoctor(prev => ({ ...prev, phone: v }));
                if (/^(0|\+84)[0-9]{9}$/.test(v)) {
                  setErrors(prev => ({ ...prev, phone: "" }));
                }
              }}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Phone className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: errors.phone
                  ? "border-red-500 focus-within:!border-red-500"
                  : "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
              isInvalid={!!errors.phone}
              errorMessage={errors.phone}
            />

            <Input
              type="number"
              label="Số năm kinh nghiệm"
              placeholder="VD: 5"
              value={doctor.experienceYears || ""}
              onValueChange={(v) => {
                setDoctor({ ...doctor, experienceYears: v });
                if (v === "" || (Number(v) >= 0 && Number.isInteger(Number(v)))) {
                  setErrors(prev => ({ ...prev, experienceYears: "" }));
                }
              }}
              variant="bordered"
              labelPlacement="outside"
              startContent={<Calendar className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
                inputWrapper: errors.experienceYears
                  ? "border-red-500 focus-within:!border-red-500"
                  : "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
              }}
              isInvalid={!!errors.experienceYears}
              errorMessage={errors.experienceYears}
            />

          </div>

          <Select
            label="Chuyên khoa"
            placeholder={loadingSpecialities ? "Đang tải..." : "Chọn chuyên khoa"}
            selectedKeys={doctor.speciality_id ? [String(doctor.speciality_id)] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              const id = selected ? parseInt(selected, 10) : null;
              console.log("[Select] Selected:", selected, "→ ID:", id);
              setDoctor(prev => ({ ...prev, speciality_id: id }));
            }}
            variant="bordered"
            labelPlacement="outside"
            startContent={<Stethoscope className="text-default-400" size={20} />}
            classNames={{
              trigger: "border-default-200 hover:border-teal-500 data-[focus=true]:border-teal-500"
            }}
            isLoading={loadingSpecialities}
            isDisabled={loadingSpecialities}
          >
            {specialities.map((spec) => (
              <SelectItem key={String(spec.id)} textValue={spec.name}>
                {spec.name}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Trình độ học vấn"
            placeholder="VD: Tiến sĩ Y khoa, Thạc sĩ, Bác sĩ chuyên khoa II..."
            value={doctor.educationLevel || ""}
            onValueChange={(v) => {
              setDoctor({ ...doctor, educationLevel: v });
              if (v.trim() !== "") {
                setErrors(prev => ({ ...prev, educationLevel: "" }));
              }
            }}
            variant="bordered"
            labelPlacement="outside"
            startContent={<User className="text-default-400" size={20} />}
            classNames={{
              input: "text-base",
              inputWrapper: errors.educationLevel
                ? "border-red-500 focus-within:!border-red-500"
                : "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
            isInvalid={!!errors.educationLevel}
            errorMessage={errors.educationLevel}
          />


          <Textarea
            label="Giới thiệu bản thân"
            placeholder="Giới thiệu ngắn gọn về bản thân, kinh nghiệm làm việc, chuyên môn..."
            value={doctor.bio || ""}
            onValueChange={(v) => setDoctor(prev => ({ ...prev, bio: v }))}
            variant="bordered"
            labelPlacement="outside"
            minRows={4}
            maxRows={6}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />

          {/* Address Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-default-700 mb-2">
              Địa chỉ phòng khám <span className="text-danger">*</span>
            </label>
            <AddressSelector
              provinceCode={doctor.province_code}
              districtCode={doctor.district_code}
              wardCode={doctor.ward_code}
              onProvinceChange={(code) => {
                setDoctor(prev => ({
                  ...prev,
                  province_code: code ? parseInt(code) : null,
                  province_name: code ? getProvinceName(code) : ""
                }));
              }}
              onDistrictChange={(code) => {
                setDoctor(prev => ({
                  ...prev,
                  district_code: code ? parseInt(code) : null,
                  district_name: code ? getDistrictName(code) : ""
                }));
              }}
              onWardChange={(code) => {
                setDoctor(prev => ({
                  ...prev,
                  ward_code: code ? parseInt(code) : null,
                  ward_name: code ? getWardName(code) : ""
                }));
              }}
              disabled={saving}
              required
            />
          </div>

          <Textarea
            label="Địa chỉ chi tiết"
            placeholder="Số nhà, tên đường... (VD: Số 123, Đường ABC)"
            value={doctor.clinic_address || ""}
            onValueChange={(v) => setDoctor(prev => ({ ...prev, clinic_address: v }))}
            variant="bordered"
            labelPlacement="outside"
            startContent={<MapPin className="text-default-400" size={20} />}
            minRows={2}
            maxRows={3}
            classNames={{
              input: "text-base",
              inputWrapper: "border-default-200 hover:border-teal-500 focus-within:!border-teal-500"
            }}
          />

          <div className="flex justify-end pt-4">
            <Button
              color="primary"
              size="lg"
              startContent={<Save size={20} />}
              onPress={handleSave}
              isLoading={saving}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold"
            >
              Lưu thay đổi
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* License Management Card */}
      <Card className="shadow-md">
        <CardHeader className="flex justify-between items-center bg-gradient-to-r from-teal-50 to-green-50">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FileText size={24} className="text-teal-600" />
            Giấy phép hành nghề
          </h3>
          <Button
            color="success"
            startContent={<Plus size={18} />}
            onPress={() => handleOpenLicenseModal()}
            className="font-semibold"
          >
            Thêm giấy phép
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="p-6">
          {loadingLicenses ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Chưa có giấy phép hành nghề</p>
              <p className="text-sm text-gray-400">Nhấn "Thêm giấy phép" để thêm mới</p>
            </div>
          ) : (
            <div className="space-y-4">
              {licenses.map((license) => {
                const licenseId = license.licenseId || license.license_id;
                const licenseNumber = license.licenseNumber || license.license_number;
                const issuedDate = license.issuedDate || license.issued_date;
                const expiryDate = license.expiryDate || license.expiry_date;
                const issuedBy = license.issuedBy || license.issued_by;
                const scopeOfPractice = license.scopeOfPractice || license.scope_of_practice;
                const isActive = license.isActive !== undefined ? license.isActive : license.is_active;
                const isExpired = license.isExpired !== undefined ? license.isExpired : license.is_expired;
                const daysUntilExpiry = license.daysUntilExpiry !== undefined ? license.daysUntilExpiry : license.days_until_expiry;
                const proofImages = license.proofImages || license.proof_images;

                return (
                  <div
                    key={licenseId}
                    className="relative bg-gradient-to-br from-white rounded-xl p-8 border-4 border-double border-teal-200 shadow-lg hover:shadow-xl transition-all"
                  >
                    {/* Status Badge - Top Left */}
                    <div className="absolute top-4 left-4">
                      <Chip
                        size="md"
                        color={isActive && !isExpired ? "success" : isExpired ? "danger" : "default"}
                        variant="shadow"
                        className="font-semibold"
                      >
                        {isExpired ? "Đã hết hạn" : isActive ? "Hiệu lực" : "Không hoạt động"}
                      </Chip>
                    </div>

                    {/* Action Buttons - Top Right */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {proofImages && (
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => {
                            try {
                              const images = JSON.parse(proofImages);
                              setSelectedImages(images);
                              setCurrentImageIndex(0);
                              onImageModalOpen();
                            } catch (error) {
                              console.error('Error parsing proof images:', error);
                              toast.error('Không thể hiển thị hình ảnh');
                            }
                          }}
                          className="text-blue-600 hover:bg-blue-100"
                          title="Xem minh chứng hình ảnh"
                        >
                          <Eye size={18} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleOpenLicenseModal(license)}
                        className="text-teal-600 hover:bg-teal-100"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleDeleteLicense(license)}
                        isDisabled={licenses.length <= 1}
                        className={licenses.length <= 1 ? "text-gray-400" : "text-red-600 hover:bg-red-100"}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6 mt-6">
                      <div className="flex justify-center mb-3">
                        <div className="bg-gradient-to-br from-teal-500 to-green-500 p-3 rounded-full">
                          <FileText size={32} className="text-white" />
                        </div>
                      </div>
                      <h4 className="text-sm uppercase tracking-wider text-gray-600 font-semibold mb-1">
                        Giấy phép hành nghề
                      </h4>
                      <p className="text-2xl font-bold text-teal-700 tracking-wide">
                        {licenseNumber}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent"></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent"></div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Ngày cấp</p>
                          <div className="flex items-center gap-2 text-gray-800">
                            <Calendar size={16} className="text-teal-500" />
                            <span className="font-medium">{formatDate(issuedDate)}</span>
                          </div>
                        </div>
                        {issuedBy && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Nơi cấp</p>
                            <div className="flex items-start gap-2 text-gray-800">
                              <Building2 size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
                              <span className="font-medium text-sm leading-tight">{issuedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Hết hạn</p>
                          <div className="flex items-center gap-2 text-gray-800">
                            <Calendar size={16} className="text-teal-500" />
                            <span className="font-medium">{formatDate(expiryDate) || "Vô thời hạn"}</span>
                          </div>
                        </div>
                        {scopeOfPractice && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Phạm vi</p>
                            <div className="flex items-start gap-2 text-gray-800">
                              <Briefcase size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
                              <span className="font-medium text-sm leading-tight">{scopeOfPractice}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Warnings */}
                    <div className="space-y-3">
                      {/* Expiry Warning */}
                      {daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry < 365 && (
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg p-3 flex items-center gap-3">
                          <div className="bg-orange-500 p-2 rounded-full">
                            <AlertCircle size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="text-orange-800 font-semibold text-sm">Sắp hết hạn</p>
                            <p className="text-orange-600 text-xs">Còn {daysUntilExpiry} ngày</p>
                          </div>
                        </div>
                      )}

                      {/* Last License Warning */}
                      {licenses.length === 1 && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-3 flex items-center gap-3">
                          <div className="bg-blue-500 p-2 rounded-full">
                            <CheckCircle size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="text-blue-800 font-semibold text-sm">Giấy phép duy nhất</p>
                            <p className="text-blue-600 text-xs">Không thể xóa giấy phép này</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Decorative Seal/Stamp */}
                    <div className="absolute bottom-6 right-6 opacity-10">
                      <div className="w-20 h-20 rounded-full border-4 border-teal-500 flex items-center justify-center">
                        <FileText size={40} className="text-teal-500" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  return (
    <DoctorFrame title="Hồ sơ bác sĩ">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />

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
                description="Định dạng: 6 số / BYT-GPHN"
                isInvalid={licenseForm.license_number && !validateLicenseNumber(licenseForm.license_number)}
                errorMessage={licenseForm.license_number && !validateLicenseNumber(licenseForm.license_number) ? "Số giấy phép không đúng định dạng" : ""}
                color={licenseForm.license_number && validateLicenseNumber(licenseForm.license_number) ? "success" : "default"}
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

            {/* Image Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minh chứng giấy phép (Hình ảnh) {!editingLicense && <span className="text-red-500">*</span>}
              </label>

              {licenseForm.proof_images ? (
                <div className="space-y-3">
                  {(() => {
                    try {
                      const images = JSON.parse(licenseForm.proof_images);
                      return images.map((imageUrl, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-center gap-3">
                            <img
                              src={imageUrl}
                              alt={`Minh chứng ${index + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <span className="text-sm text-gray-700">
                              Hình ảnh {index + 1}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              onPress={() => {
                                setSelectedImages(images);
                                setCurrentImageIndex(index);
                                onImageModalOpen();
                              }}
                              startContent={<Eye size={16} />}
                            >
                              Xem
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              color="danger"
                              onPress={() => {
                                const newImages = images.filter((_, i) => i !== index);
                                setLicenseForm({
                                  ...licenseForm,
                                  proof_images: newImages.length > 0 ? JSON.stringify(newImages) : ""
                                });
                              }}
                              startContent={<X size={16} />}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ));
                    } catch (error) {
                      return (
                        <div className="text-center text-red-500 text-sm">
                          Lỗi hiển thị hình ảnh
                        </div>
                      );
                    }
                  })()}

                  <div className="flex justify-center">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={16} className="mr-2" />
                      Thêm hình ảnh
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={24} className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click để upload hình ảnh</span>
                      </p>
                      <p className="text-xs text-gray-500">Có thể chọn nhiều hình ảnh</p>
                    </div>
                  </label>
                  {uploadingImages && (
                    <div className="mt-2 text-center">
                      <div className="inline-flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Đang upload hình ảnh...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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

      {/* Confirm Delete License Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={confirmDeleteLicense}
        variant="danger"
        title="Xóa giấy phép hành nghề"
        message="Bạn có chắc chắn muốn xóa giấy phép hành nghề này không? Thông tin giấy phép sẽ bị xóa vĩnh viễn khỏi hệ thống."
        itemName={deletingLicense ? (deletingLicense.licenseNumber || deletingLicense.license_number) : ""}
        confirmText="Xác nhận xóa"
        isLoading={isDeleting}
      />

      {/* Image Gallery Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={onImageModalClose}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Minh chứng giấy phép hành nghề</h3>
            <p className="text-sm text-gray-500">
              Hình ảnh {currentImageIndex + 1} / {selectedImages.length}
            </p>
          </ModalHeader>
          <ModalBody className="p-0">
            <div className="w-full h-[70vh] bg-gray-100">
              {selectedImages.length > 0 ? (
                <div className="w-full h-full flex flex-col">
                  {/* Image Display */}
                  <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                    <img
                      src={selectedImages[currentImageIndex]}
                      alt={`Minh chứng ${currentImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      onError={() => {
                        toast.error('Không thể tải hình ảnh');
                      }}
                    />
                  </div>

                  {/* Navigation */}
                  {selectedImages.length > 1 && (
                    <div className="flex items-center justify-between p-4 bg-white border-t">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                        isDisabled={currentImageIndex === 0}
                        startContent={<ArrowLeft size={16} />}
                      >
                        Trước
                      </Button>

                      <div className="flex gap-2">
                        {selectedImages.map((_, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant={index === currentImageIndex ? "solid" : "flat"}
                            color={index === currentImageIndex ? "primary" : "default"}
                            onPress={() => setCurrentImageIndex(index)}
                            className="w-8 h-8 min-w-8"
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setCurrentImageIndex(Math.min(selectedImages.length - 1, currentImageIndex + 1))}
                        isDisabled={currentImageIndex === selectedImages.length - 1}
                        endContent={<ArrowRight size={16} />}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-2 text-gray-400" />
                    <p>Không có hình ảnh để hiển thị</p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              variant="light"
              onPress={() => window.open(selectedImages[currentImageIndex], '_blank')}
              startContent={<ExternalLink size={16} />}
            >
              Mở trong tab mới
            </Button>
            <Button color="danger" variant="light" onPress={onImageModalClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DoctorFrame>
  );
}
