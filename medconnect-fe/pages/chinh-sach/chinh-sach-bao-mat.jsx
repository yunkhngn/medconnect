import React from 'react';
import { Default } from '@/components/layouts';
import { Card, CardBody, CardHeader, Divider, Chip, Button } from '@heroui/react';
import { useRouter } from 'next/router';
import Float from '@/components/ui/Float';
import Image from 'next/image';
import { Shield, Lock, Eye, Share2, FileText, Calendar, Mail } from "lucide-react";

const ChinhSachBaoMat = () => {
  const router = useRouter();

  return (
    <Default title="Chính Sách Bảo Mật - MedConnect">
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
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Float>
              <Button 
                variant="light" 
                className="mb-6 bg-white/80 backdrop-blur-sm"
                onClick={() => router.back()}
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Quay lại
              </Button>
            </Float>

            {/* Header */}
            <Float variant="fadeInUp" delay={0.1}>
              <div className="text-center mb-12">
                <Chip color="success" variant="flat" className="mb-4 bg-white/90 backdrop-blur-sm">
                  Có hiệu lực từ: 01/01/2025
                </Chip>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  CHÍNH SÁCH BẢO MẬT DỮ LIỆU – MEDCONNECT
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  MedConnect cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn
                </p>
              </div>
            </Float>

            {/* Section 1: Mục đích thu thập */}
            <Float variant="fadeInUp" delay={0.2}>
              <Card className="mb-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <FileText className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold">1. Mục đích thu thập</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 md:p-8">
                  <p className="text-gray-700 mb-4 text-base md:text-lg">
                    MedConnect thu thập thông tin cá nhân để:
                  </p>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside text-base md:text-lg">
                    <li>Đăng ký và xác thực tài khoản người dùng.</li>
                    <li>Đặt lịch, tư vấn, lưu trữ hồ sơ y tế.</li>
                    <li>Cải thiện chất lượng dịch vụ và trải nghiệm người dùng.</li>
                  </ul>
                </CardBody>
              </Card>
            </Float>

            {/* Section 2: Phạm vi thu thập */}
            <Float variant="fadeInUp" delay={0.3}>
              <Card className="mb-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <Eye className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold">2. Phạm vi thu thập</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 md:p-8">
                  <p className="text-gray-700 mb-4 text-base md:text-lg">
                    Dữ liệu có thể bao gồm:
                  </p>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside text-base md:text-lg">
                    <li>
                      <strong>Thông tin cá nhân:</strong> Họ tên, ngày sinh, giới tính, số điện thoại, email.
                    </li>
                    <li>
                      <strong>Thông tin y tế:</strong> Triệu chứng, lịch sử khám, đơn thuốc, kết quả xét nghiệm.
                    </li>
                    <li>
                      <strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, trình duyệt, cookie, log truy cập.
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </Float>

            {/* Section 3: Phương thức thu thập */}
            <Float variant="fadeInUp" delay={0.4}>
              <Card className="mb-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <FileText className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold">3. Phương thức thu thập</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 md:p-8">
                  <ul className="space-y-2 text-gray-700 list-disc list-inside text-base md:text-lg">
                    <li>
                      Người dùng cung cấp trực tiếp khi đăng ký, đặt lịch hoặc tương tác với bác sĩ.
                    </li>
                    <li>
                      Hệ thống tự động ghi nhận qua công cụ theo dõi bảo mật (HTTPS, token, API log).
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </Float>

            {/* Section 4: Mục đích sử dụng */}
            <Float variant="fadeInUp" delay={0.5}>
              <Card className="mb-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <FileText className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold">4. Mục đích sử dụng</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 md:p-8">
                  <p className="text-gray-700 mb-4 text-base md:text-lg">
                    Dữ liệu được dùng cho:
                  </p>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside text-base md:text-lg">
                    <li>Quản lý hồ sơ bệnh nhân và bác sĩ.</li>
                    <li>Thông báo lịch hẹn, nhắc tái khám, gửi kết quả.</li>
                    <li>Phân tích thống kê, cải thiện thuật toán gợi ý.</li>
                    <li>Tuân thủ quy định pháp luật khi có yêu cầu từ cơ quan chức năng.</li>
                  </ul>
                </CardBody>
              </Card>
            </Float>

            {/* Section 5: Bảo mật và lưu trữ */}
            <Float variant="fadeInUp" delay={0.6}>
              <Card className="mb-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <Lock className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold">5. Bảo mật và lưu trữ</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 md:p-8">
                  <ul className="space-y-3 text-gray-700 list-disc list-inside text-base md:text-lg">
                    <li>
                      Dữ liệu được mã hóa khi truyền (SSL/TLS) và khi lưu trữ (AES-256).
                    </li>
                    <li>
                      Hệ thống dùng phân quyền và token JWT để xác thực truy cập.
                    </li>
                    <li>
                      Máy chủ đặt tại trung tâm dữ liệu đạt chuẩn ISO/IEC 27001.
                    </li>
                    <li>
                      <strong>Thời gian lưu trữ:</strong> Tối đa 10 năm kể từ lần sử dụng dịch vụ cuối.
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </Float>

            {/* Section 6: Quyền của người dùng */}
            <Float variant="fadeInUp" delay={0.7}>
              <Card className="mb-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <Shield className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold">6. Quyền của người dùng</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 md:p-8">
                  <p className="text-gray-700 mb-4 text-base md:text-lg">
                    Người dùng có quyền:
                  </p>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside mb-4 text-base md:text-lg">
                    <li>Truy cập, chỉnh sửa, xóa thông tin cá nhân.</li>
                    <li>Yêu cầu xuất dữ liệu hồ sơ y tế.</li>
                    <li>Rút lại sự đồng ý cho phép xử lý dữ liệu bất kỳ lúc nào.</li>
                  </ul>
                  <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm md:text-base text-gray-700 flex items-center gap-2">
                      <Mail className="text-teal-600" size={18} />
                      <span>
                        <strong>Liên hệ hỗ trợ:</strong>{" "}
                        <a
                          href="mailto:privacy@medconnect.vn"
                          className="text-teal-600 hover:underline"
                        >
                          privacy@medconnect.vn
                        </a>
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Float>

            {/* Section 7: Chia sẻ dữ liệu */}
            <Float variant="fadeInUp" delay={0.8}>
              <Card className="mb-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <Share2 className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold">7. Chia sẻ dữ liệu</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 md:p-8">
                  <p className="text-gray-700 mb-4 font-semibold text-base md:text-lg">
                    Chúng tôi không bán hoặc trao đổi dữ liệu cá nhân.
                  </p>
                  <p className="text-gray-700 mb-4 text-base md:text-lg">
                    Dữ liệu chỉ chia sẻ với:
                  </p>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside text-base md:text-lg">
                    <li>
                      Bác sĩ, cơ sở y tế có liên quan đến phiên khám.
                    </li>
                    <li>
                      Đơn vị cung cấp dịch vụ hạ tầng (email, thanh toán, lưu trữ) có ký thoả thuận bảo mật (NDA).
                    </li>
                    <li>
                      Cơ quan chức năng khi có yêu cầu hợp pháp.
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </Float>

            {/* Section 8: Cập nhật và hiệu lực */}
            <Float variant="fadeInUp" delay={0.9}>
              <Card className="mb-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <Calendar className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold">8. Cập nhật và hiệu lực</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6 md:p-8">
                  <p className="text-gray-700 mb-2 text-base md:text-lg">
                    Chính sách này có hiệu lực từ <strong>01/01/2025</strong>.
                  </p>
                  <p className="text-gray-700 text-base md:text-lg">
                    Mọi thay đổi sẽ được thông báo trước qua website hoặc ứng dụng MedConnect.
                  </p>
                </CardBody>
              </Card>
            </Float>

            {/* Contact Info */}
            <Float variant="fadeInUp" delay={1.0}>
              <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    Liên hệ về vấn đề bảo mật
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg mb-6">
                    Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua:
                  </p>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-center space-x-3 text-base md:text-lg">
                      <Mail className="text-teal-600" size={20} />
                      <span>
                        Email:{" "}
                        <a
                          href="mailto:privacy@medconnect.vn"
                          className="text-teal-600 hover:underline font-medium"
                        >
                          privacy@medconnect.vn
                        </a>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Float>
          </div>
        </div>
      </div>
    </Default>
  );
};

export default ChinhSachBaoMat;
