import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Input, Button, Textarea, Select, SelectItem, Chip, Divider } from "@heroui/react";
import { Default } from "@/components/layouts/";
import { useRouter } from "next/router";
import Float from "@/components/ui/Float";
import SimpleCaptcha from "@/components/ui/SimpleCaptcha";
import Image from "next/image";
import { DollarSign, Clock, Building, TrendingUp, Users, BookOpen } from "lucide-react";

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    SUBMIT_APPLICATION: '/doctor-applications',
    GET_SPECIALTIES: '/specialities',
  },
};

export default function DoctorApplication() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    experience: "",
    education: "",
    certifications: "",
    bio: "",
    clinicAddress: "",
    workingHours: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [specialties, setSpecialties] = useState([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Fetch specialties from backend
  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoadingSpecialties(true);
      try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_SPECIALTIES);
        if (response.ok) {
          const data = await response.json();
          // Transform backend data to match frontend format
          const transformedData = data.map(item => ({
            value: item.id.toString(),
            label: item.name
          }));
          setSpecialties(transformedData);
        } else {
          console.error("Failed to fetch specialties");
          // Fallback to empty array
          setSpecialties([]);
        }
      } catch (error) {
        console.error("Error fetching specialties:", error);
        // Fallback to empty array
        setSpecialties([]);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      // Prepare JSON data for API (match backend DTO)
      const applicationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        specialtyId: parseInt(formData.specialty),  // Send as specialtyId (number)
        experience: parseInt(formData.experience) || 0,
        education: formData.education,
        certifications: formData.certifications,
        bio: formData.bio,
        clinicAddress: formData.clinicAddress,
        workingHours: formData.workingHours
      };

      console.log("Submitting application data:", applicationData);
      
      const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SUBMIT_APPLICATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();

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
                          selectedKeys={formData.specialty ? [formData.specialty] : []}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
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
                        <Textarea
                          label="Chứng chỉ hành nghề"
                          name="certifications"
                          placeholder="Liệt kê các chứng chỉ, bằng cấp..."
                          value={formData.certifications}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          minRows={3}
                          size="sm"
                        />
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
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <Textarea
                          label="Địa chỉ phòng khám/Bệnh viện"
                          name="clinicAddress"
                          placeholder="Nhập địa chỉ nơi làm việc hiện tại (nếu có)"
                          value={formData.clinicAddress}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          minRows={2}
                          size="sm"
                        />
                        <Input
                          label="Thời gian làm việc mong muốn"
                          name="workingHours"
                          placeholder="VD: Thứ 2-6, 8h-17h"
                          value={formData.workingHours}
                          onChange={handleInputChange}
                          labelPlacement="outside"
                          size="sm"
                        />
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
    </Default>
  );
}
