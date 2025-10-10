import React, { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button, Textarea, Select, SelectItem, Chip, Divider } from "@heroui/react";
import { Default } from "@/components/layouts/";
import { useRouter } from "next/router";

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

  const specialties = [
    { value: "tim-mach", label: "Tim mạch" },
    { value: "noi-khoa", label: "Nội khoa" },
    { value: "ngoai-khoa", label: "Ngoại khoa" },
    { value: "nhi-khoa", label: "Nhi khoa" },
    { value: "san-phu-khoa", label: "Sản phụ khoa" },
    { value: "than-kinh", label: "Thần kinh" },
    { value: "da-lieu", label: "Da liễu" },
    { value: "mat", label: "Mắt" },
    { value: "tai-mui-hong", label: "Tai mũi họng" },
    { value: "khac", label: "Khác" }
  ];

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

    setIsLoading(true);

    try {
      // TODO: Call API to submit application
      const response = await fetch("/api/doctor-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showMessage("Đơn ứng tuyển đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.", "success");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        throw new Error("Gửi đơn thất bại");
      }
    } catch (error) {
      showMessage("Có lỗi xảy ra. Vui lòng thử lại sau.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Default title="Ứng tuyển Bác sĩ - MedConnect">
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Chip color="primary" variant="flat" className="mb-4">
              Tuyển dụng Bác sĩ
            </Chip>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Đăng ký Trở thành Bác sĩ
            </h1>
            <p className="text-lg text-gray-600">
              Tham gia đội ngũ bác sĩ chuyên nghiệp của MedConnect
            </p>
          </div>

          {/* Benefits */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quyền lợi khi tham gia MedConnect
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "💼 Thu nhập hấp dẫn, cạnh tranh",
                  "⏰ Linh hoạt thời gian làm việc",
                  "🏥 Hệ thống quản lý bệnh nhân hiện đại",
                  "📈 Cơ hội phát triển nghề nghiệp",
                  "🤝 Đội ngũ hỗ trợ chuyên nghiệp",
                  "💡 Đào tạo và cập nhật kiến thức liên tục"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="text-xl mr-2">{benefit.split(" ")[0]}</span>
                    <span>{benefit.substring(benefit.indexOf(" ") + 1)}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader className="flex flex-col items-start p-6 pb-0">
              <h2 className="text-2xl font-semibold text-gray-900">Thông tin ứng tuyển</h2>
              <p className="text-sm text-gray-600 mt-1">Vui lòng điền đầy đủ thông tin bên dưới</p>
            </CardHeader>
            <CardBody className="p-6">
              {message.text && (
                <div
                  className={`p-3 rounded-lg mb-6 text-sm ${
                    message.type === "error"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-green-50 text-green-600 border border-green-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      isRequired
                      label="Họ và tên"
                      name="fullName"
                      placeholder="Bác sĩ Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      labelPlacement="outside"
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
                    />
                    <Select
                      isRequired
                      label="Chuyên khoa"
                      name="specialty"
                      placeholder="Chọn chuyên khoa"
                      selectedKeys={formData.specialty ? [formData.specialty] : []}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                      labelPlacement="outside"
                    >
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.value} value={specialty.value}>
                          {specialty.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <Divider />

                {/* Professional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin chuyên môn</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Kinh nghiệm (năm)"
                      name="experience"
                      type="number"
                      placeholder="5"
                      value={formData.experience}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                    />
                    <Input
                      label="Trình độ học vấn"
                      name="education"
                      placeholder="Bác sĩ Đại học Y Hà Nội"
                      value={formData.education}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                    />
                    <Textarea
                      label="Chứng chỉ hành nghề"
                      name="certifications"
                      placeholder="Liệt kê các chứng chỉ, bằng cấp..."
                      value={formData.certifications}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                      minRows={3}
                    />
                    <Textarea
                      label="Giới thiệu bản thân"
                      name="bio"
                      placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm làm việc..."
                      value={formData.bio}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                      minRows={4}
                    />
                  </div>
                </div>

                <Divider />

                {/* Work Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin công việc</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Textarea
                      label="Địa chỉ phòng khám/Bệnh viện"
                      name="clinicAddress"
                      placeholder="Nhập địa chỉ nơi làm việc hiện tại (nếu có)"
                      value={formData.clinicAddress}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                      minRows={2}
                    />
                    <Input
                      label="Thời gian làm việc mong muốn"
                      name="workingHours"
                      placeholder="VD: Thứ 2-6, 8h-17h"
                      value={formData.workingHours}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Đang gửi..." : "Gửi đơn ứng tuyển"}
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    size="lg"
                    onPress={() => router.back()}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Additional Info */}
          <Card className="mt-8">
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quy trình tuyển dụng
              </h3>
              <div className="space-y-3">
                {[
                  "1️⃣ Gửi đơn ứng tuyển",
                  "2️⃣ Phỏng vấn trực tuyến",
                  "3️⃣ Xác minh chứng chỉ hành nghề",
                  "4️⃣ Đào tạo hệ thống",
                  "5️⃣ Bắt đầu làm việc"
                ].map((step, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="mr-3">{step}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Thời gian xử lý: <strong>3-5 ngày làm việc</strong>
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </Default>
  );
}
