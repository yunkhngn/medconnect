import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Input, Button, Textarea, Select, SelectItem, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Default } from "@/components/layouts/";
import { useRouter } from "next/router";
import Float from "@/components/ui/Float";
import SimpleCaptcha from "@/components/ui/SimpleCaptcha";
import AddressSelector from "@/components/ui/AddressSelector";
import { useAddressData } from "@/hooks/useAddressData";
import Image from "next/image";
import { DollarSign, Clock, Building, TrendingUp, Users, BookOpen, Plus, X, Upload, FileText } from "lucide-react";

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    SUBMIT_APPLICATION: '/doctor-applications',
    GET_SPECIALTIES: '/specialties/dropdown',
  },
};

export default function DoctorApplication() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    experience: "",
    education: "",
    certifications: [],
    bio: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    street: ""
  });

  // Store address names for display
  const [addressNames, setAddressNames] = useState({
    province: "",
    district: "",
    ward: ""
  });
  
  const [currentCertificate, setCurrentCertificate] = useState({
    certificateNumber: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    issuerPosition: "",
    scope: "",
    notes: "",
    imageFile: null,
    imagePreview: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [specialties, setSpecialties] = useState([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Use address data hook to get names
  const { provinces, districts, wards } = useAddressData();

  // Fetch specialties from backend
  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoadingSpecialties(true);
      try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_SPECIALTIES, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched specialties:", data);
          // Transform backend data to match frontend format
          const transformedData = data.map(item => ({
            value: item.id.toString(),
            label: item.name
          }));
          setSpecialties(transformedData);
        } else {
          console.error("Failed to fetch specialties, status:", response.status);
          showMessage("Đang sử dụng danh sách chuyên khoa mặc định", "warning");
        }
      } catch (error) {
        console.error("Error fetching specialties:", error);
      } finally {
        setIsLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProvinceChange = (code) => {
    setFormData(prev => ({ ...prev, provinceCode: code, districtCode: null, wardCode: null }));
    if (code) {
      const provinceName = provinces.find(p => String(p.code) === String(code))?.name || "";
      setAddressNames(prev => ({ ...prev, province: provinceName, district: "", ward: "" }));
    } else {
      setAddressNames(prev => ({ ...prev, province: "", district: "", ward: "" }));
    }
  };

  const handleDistrictChange = (code) => {
    setFormData(prev => ({ ...prev, districtCode: code, wardCode: null }));
    if (code) {
      const districtName = districts.find(d => String(d.code) === String(code))?.name || "";
      setAddressNames(prev => ({ ...prev, district: districtName, ward: "" }));
    } else {
      setAddressNames(prev => ({ ...prev, district: "", ward: "" }));
    }
  };

  const handleWardChange = (code) => {
    setFormData(prev => ({ ...prev, wardCode: code }));
    if (code) {
      const wardName = wards.find(w => String(w.code) === String(code))?.name || "";
      setAddressNames(prev => ({ ...prev, ward: wardName }));
    } else {
      setAddressNames(prev => ({ ...prev, ward: "" }));
    }
  };

  const handleStreetChange = (e) => {
    setFormData(prev => ({ ...prev, street: e.target.value }));
  };

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCertificate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showMessage("Vui lòng chọn file ảnh!", "error");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMessage("Kích thước file không được vượt quá 5MB!", "error");
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCurrentCertificate(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: previewUrl
      }));
    }
  };

  const handleAddCertificate = () => {
    // Validate required fields
    if (!currentCertificate.certificateNumber || !currentCertificate.issueDate) {
      showMessage("Vui lòng điền số giấy phép và ngày cấp!", "error");
      return;
    }

    if (!currentCertificate.imageFile) {
      showMessage("Vui lòng tải lên hình ảnh giấy phép!", "error");
      return;
    }

    // Add certificate to list
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { ...currentCertificate, id: Date.now() }]
    }));

    // Reset form
    setCurrentCertificate({
      certificateNumber: "",
      issueDate: "",
      expiryDate: "",
      issuingAuthority: "",
      issuerPosition: "",
      scope: "",
      notes: "",
      imageFile: null,
      imagePreview: null
    });

    onClose();
    showMessage("Đã thêm chứng chỉ thành công!", "success");
  };

  const handleRemoveCertificate = (id) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
    showMessage("Đã xóa chứng chỉ!", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.specialty) {
      showMessage("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
      return;
    }

    if (!isCaptchaVerified) {
      showMessage("Vui lòng xác nhận mã CAPTCHA!", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Convert image files to base64 for certifications
      const certificationsWithBase64 = await Promise.all(
        formData.certifications.map(async (cert) => {
          const certData = { ...cert };
          // Remove imageFile and imagePreview, add base64Image if available
          delete certData.imageFile;
          delete certData.imagePreview;
          
          // Convert imageFile to base64 if exists
          if (cert.imageFile) {
            try {
              const base64 = await fileToBase64(cert.imageFile);
              certData.base64Image = base64;
            } catch (error) {
              console.error("Failed to convert image to base64:", error);
            }
          }
          
          return certData;
        })
      );

      // Prepare JSON data for API (match backend DTO)
      const applicationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        specialtyId: parseInt(formData.specialty),  // Send as specialtyId (number)
        experience: parseInt(formData.experience) || 0,
        education: formData.education,
        certifications: JSON.stringify(certificationsWithBase64), // Convert to JSON string for backend
        bio: formData.bio,
        clinicAddress: [formData.street, addressNames.ward, addressNames.district, addressNames.province]
          .filter(Boolean)
          .join(", "),
        workingHours: "" // Remove this field from form
      };

      console.log("Submitting application data:", applicationData);
      
      const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SUBMIT_APPLICATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
        console.log("JSON response:", result);
      } else {
        const text = await response.text();
        console.error("Non-JSON response (status " + response.status + "):", text);
        
        // Show more specific error messages
        if (response.status === 404) {
          throw new Error("API endpoint không tồn tại. Vui lòng kiểm tra backend đang chạy.");
        } else if (response.status === 500) {
          throw new Error("Lỗi server: " + (text.substring(0, 100) || "Internal Server Error"));
        } else if (!response.ok) {
          throw new Error("Lỗi HTTP " + response.status + ": " + (text.substring(0, 100) || "Unknown error"));
        } else {
          throw new Error("Server trả về dữ liệu không hợp lệ (không phải JSON)");
        }
      }

      if (response.ok && result.success) {
        showMessage(
          result.data.note || "Đơn ứng tuyển đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.", 
          "success"
        );
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        throw new Error(result.message || "Gửi đơn thất bại");
      }
    } catch (error) {
      console.error("Submission error:", error);
      showMessage(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Default title="Ứng tuyển Bác sĩ - MedConnect">
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with blur */}
        <div className="absolute inset-0">
          <Image
            src="/assets/homepage/cover.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <Float>
              <div className="text-center mb-8 sm:mb-12">
                <Chip color="primary" variant="flat" className="mb-4 bg-white/90 backdrop-blur-sm">
                  Tuyển dụng Bác sĩ
                </Chip>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Đăng ký Trở thành Bác sĩ
                </h1>
                <p className="text-base sm:text-lg text-gray-700">
                  Tham gia đội ngũ bác sĩ chuyên nghiệp của MedConnect
                </p>
              </div>
            </Float>

            {/* Benefits */}
            <Float delay={0.1}>
              <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-cyan-50 to-blue-50/90 backdrop-blur-md border border-cyan-200/50 shadow-2xl">
                <CardBody className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    Quyền lợi khi tham gia MedConnect
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                     { icon: DollarSign, text: "Thu nhập hấp dẫn, cạnh tranh" },
                     { icon: Clock, text: "Linh hoạt thời gian làm việc" },
                     { icon: Building, text: "Hệ thống quản lý bệnh nhân hiện đại" },
                     { icon: TrendingUp, text: "Cơ hội phát triển nghề nghiệp" },
                     { icon: Users, text: "Đội ngũ hỗ trợ chuyên nghiệp" },
                     { icon: BookOpen, text: "Đào tạo và cập nhật kiến thức liên tục" }
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center text-gray-700 text-sm sm:text-base">
                        <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-cyan-600" />
                        <span>{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Float>

            {/* Application Form */}
            <Float delay={0.2}>
              <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex flex-col items-start p-4 sm:p-6 pb-0">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Thông tin ứng tuyển</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Vui lòng điền đầy đủ thông tin bên dưới</p>
                </CardHeader>
                <CardBody className="p-4 sm:p-6">
                  {message.text && (
                    <div
                      className={`p-3 rounded-lg mb-4 sm:mb-6 text-sm ${
                        message.type === "error"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : message.type === "warning"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : "bg-green-50 text-green-600 border border-green-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Personal Info */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Input
                          isRequired
                          label="Họ và tên"
                          name="fullName"
                          placeholder="Bác sĩ Nguyễn Văn A"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          size="sm"
                        />
                        <Input
                          isRequired
                          label="Email"
                          name="email"
                          type="email"
                          placeholder="bacsi@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          size="sm"
                        />
                        <Input
                          isRequired
                          label="Số điện thoại"
                          name="phone"
                          type="tel"
                          placeholder="0123456789"
                          value={formData.phone}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          size="sm"
                        />
                        <Select
                          isRequired
                          label="Chuyên khoa"
                          name="specialty"
                          placeholder={isLoadingSpecialties ? "Đang tải..." : "Chọn chuyên khoa"}
                          selectedKeys={formData.specialty ? new Set([formData.specialty]) : new Set([])}
                          onSelectionChange={(keys) => {
                            const selectedValue = Array.from(keys)[0];
                            setFormData(prev => ({ ...prev, specialty: selectedValue || "" }));
                          }}
                          labelPlacement="outside"
                          size="sm"
                          isDisabled={isLoadingSpecialties}
                        >
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty.value} value={specialty.value}>
                              {specialty.label}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <Divider className="bg-gray-200" />

                    {/* Professional Info */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Thông tin chuyên môn</h3>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <Input
                          label="Kinh nghiệm (năm)"
                          name="experience"
                          type="number"
                          placeholder="5"
                          value={formData.experience}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          size="sm"
                        />
                        <Input
                          label="Trình độ học vấn"
                          name="education"
                          placeholder="Bác sĩ Đại học Y Hà Nội"
                          value={formData.education}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          size="sm"
                        />
                        
                        {/* Certifications Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Chứng chỉ hành nghề</label>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              startContent={<Plus className="w-4 h-4" />}
                              onPress={onOpen}
                            >
                              Thêm giấy phép mới
                            </Button>
                          </div>
                          
                          {/* List of certificates */}
                          {formData.certifications.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Chưa có chứng chỉ nào</p>
                              <p className="text-xs text-gray-400 mt-1">Nhấn "Thêm giấy phép mới" để bắt đầu</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {formData.certifications.map((cert) => (
                                <Card key={cert.id} className="bg-gray-50 border border-gray-200">
                                  <CardBody className="p-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex gap-3 flex-1">
                                        {cert.imagePreview && (
                                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                                            <img 
                                              src={cert.imagePreview} 
                                              alt="Certificate" 
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-sm text-gray-900">
                                            Số GP: {cert.certificateNumber}
                                          </p>
                                          <p className="text-xs text-gray-600 mt-1">
                                            Ngày cấp: {cert.issueDate}
                                            {cert.expiryDate && ` • Hết hạn: ${cert.expiryDate}`}
                                          </p>
                                          {cert.issuingAuthority && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Nơi cấp: {cert.issuingAuthority}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                        onPress={() => handleRemoveCertificate(cert.id)}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardBody>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Textarea
                          label="Giới thiệu bản thân"
                          name="bio"
                          placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm làm việc..."
                          value={formData.bio}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          minRows={4}
                          size="sm"
                        />
                      </div>
                    </div>

                    <Divider className="bg-gray-200" />

                    {/* Work Info */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Thông tin công việc</h3>
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Địa chỉ phòng khám/Bệnh viện
                            </label>
                            <div className="space-y-3">
                              <AddressSelector
                                provinceCode={formData.provinceCode}
                                districtCode={formData.districtCode}
                                wardCode={formData.wardCode}
                                onProvinceChange={handleProvinceChange}
                                onDistrictChange={handleDistrictChange}
                                onWardChange={handleWardChange}
                                size="sm"
                                variant="flat"
                              />
                            </div>
                          </div>
                          <div>
                            <Input
                              label="Số nhà, đường"
                              name="street"
                              placeholder="Nhập số nhà, tên đường"
                              value={formData.street}
                              onChange={handleStreetChange}
                              labelPlacement="outside"
                              size="sm"
                              variant="flat"
                              classNames={{
                                input: 'text-gray-900',
                                inputWrapper: 'bg-gray-100 hover:bg-gray-200',
                                base: 'gap-1',
                                label: 'text-sm font-medium text-gray-700 pb-1',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Divider className="bg-gray-200" />

                    {/* CAPTCHA Verification */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Xác thực</h3>
                      <SimpleCaptcha onVerify={setIsCaptchaVerified} />
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                      <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        isLoading={isLoading}
                        isDisabled={!isCaptchaVerified}
                        className="flex-1"
                      >
                        {isLoading ? "Đang gửi..." : "Gửi đơn ứng tuyển"}
                      </Button>
                      <Button
                        type="button"
                        variant="light"
                        size="lg"
                        onPress={() => router.back()}
                        className="flex-1 sm:flex-none"
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </Float>

            {/* Process Info */}
            <Float delay={0.3}>
              <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    Quy trình tuyển dụng
                  </h3>
                  <div className="space-y-2 sm:space-y-3 mb-4">
                    {[
                     { step: "1", text: "Gửi đơn ứng tuyển" },
                     { step: "2", text: "Phỏng vấn trực tuyến" },
                     { step: "3", text: "Xác minh chứng chỉ hành nghề" },
                     { step: "4", text: "Đào tạo hệ thống" },
                     { step: "5", text: "Bắt đầu làm việc" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center text-gray-700 text-sm sm:text-base">
                        <div className="flex items-center justify-center w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold mr-3">
                          {item.step}
                        </div>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Thời gian xử lý: <strong>3-5 ngày làm việc</strong>
                  </p>
                </CardBody>
              </Card>
            </Float>
          </div>
        </div>
      </div>

      {/* Modal for Adding Certificate */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2 border-b">
            <FileText className="w-5 h-5 text-primary" />
            <span>Thêm giấy phép mới</span>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              {/* Certificate Number & Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Số giấy phép"
                  name="certificateNumber"
                  placeholder="VD: 000001/BYT-GPHN"
                  value={currentCertificate.certificateNumber}
                  onChange={handleCertificateInputChange}
                  labelPlacement="outside"
                  description="Định dạng: 6 số / BYT-GPHN"
                  size="sm"
                />
                <Input
                  isRequired
                  label="Ngày cấp"
                  name="issueDate"
                  type="date"
                  value={currentCertificate.issueDate}
                  onChange={handleCertificateInputChange}
                  labelPlacement="outside"
                  size="sm"
                />
              </div>

              {/* Expiry Date */}
              <Input
                label="Ngày hết hạn"
                name="expiryDate"
                type="date"
                value={currentCertificate.expiryDate}
                onChange={handleCertificateInputChange}
                labelPlacement="outside"
                description="Để trống nếu vô thời hạn"
                size="sm"
              />

              {/* Issuing Authority & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nơi cấp"
                  name="issuingAuthority"
                  placeholder="Cục Quản lý Khám chữa bệnh - Bộ Y Tế"
                  value={currentCertificate.issuingAuthority}
                  onChange={handleCertificateInputChange}
                  labelPlacement="outside"
                  size="sm"
                />
                <Input
                  label="Chức danh người cấp"
                  name="issuerPosition"
                  placeholder="Cục trưởng"
                  value={currentCertificate.issuerPosition}
                  onChange={handleCertificateInputChange}
                  labelPlacement="outside"
                  size="sm"
                />
              </div>

              {/* Scope */}
              <Textarea
                label="Phạm vi hành nghề"
                name="scope"
                placeholder="VD: Khám bệnh, chữa bệnh theo chuyên khoa Tim mạch"
                value={currentCertificate.scope}
                onChange={handleCertificateInputChange}
                labelPlacement="outside"
                minRows={2}
                size="sm"
              />

              {/* Notes */}
              <Textarea
                label="Ghi chú"
                name="notes"
                placeholder="VD: Cấp mới, Gia hạn lần 1..."
                value={currentCertificate.notes}
                onChange={handleCertificateInputChange}
                labelPlacement="outside"
                minRows={2}
                size="sm"
              />

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Minh chứng giấy phép (Hình ảnh) <span className="text-red-500">*</span>
                </label>
                
                {currentCertificate.imagePreview ? (
                  <div className="relative border-2 border-dashed border-primary rounded-lg p-4">
                    <img 
                      src={currentCertificate.imagePreview} 
                      alt="Certificate preview" 
                      className="w-full h-48 object-contain rounded-lg"
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      className="absolute top-2 right-2"
                      onPress={() => {
                        URL.revokeObjectURL(currentCertificate.imagePreview);
                        setCurrentCertificate(prev => ({
                          ...prev,
                          imageFile: null,
                          imagePreview: null
                        }));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="certificate-image"
                    />
                    <label htmlFor="certificate-image" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Nhấn để tải ảnh lên</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (tối đa 5MB)</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t">
            <Button 
              color="danger" 
              variant="flat" 
              onPress={onClose}
            >
              Hủy
            </Button>
            <Button 
              color="primary" 
              onPress={handleAddCertificate}
              startContent={<Plus className="w-4 h-4" />}
            >
              Thêm mới
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Default>
  );
}
