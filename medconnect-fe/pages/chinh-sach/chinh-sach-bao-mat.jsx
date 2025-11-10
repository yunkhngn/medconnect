import React from 'react';
import { Default } from '@/components/layouts';
import { Card, CardBody, Divider, Chip, Button } from '@heroui/react';
import { useRouter } from 'next/router';
import Float from '@/components/ui/Float';
import Image from 'next/image';

const PrivacyPolicy = () => {
  const router = useRouter();

  const sections = [
    {
      title: "1. Thu thập thông tin",
      content: "Chúng tôi thu thập thông tin cá nhân như tên, email, số điện thoại và thông tin sức khỏe khi bạn đăng ký và sử dụng dịch vụ của chúng tôi."
    },
    {
      title: "2. Mục đích sử dụng thông tin",
      content: "Thông tin của bạn được sử dụng để cung cấp dịch vụ y tế, liên lạc và cải thiện trải nghiệm người dùng."
    },
    {
      title: "3. Bảo mật thông tin",
      content: "Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin cá nhân và y tế của bạn khỏi truy cập trái phép."
    },
    {
      title: "4. Chia sẻ thông tin",
      content: "Thông tin của bạn chỉ được chia sẻ với bác sĩ và các bên liên quan trực tiếp đến dịch vụ y tế. Chúng tôi không bán thông tin cá nhân cho bên thứ ba."
    },
    {
      title: "5. Quyền của người dùng",
      content: "Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất cứ lúc nào thông qua tài khoản của bạn."
    },
    {
      title: "6. Cookie và công nghệ theo dõi",
      content: "Chúng tôi sử dụng cookie để cải thiện trải nghiệm người dùng và phân tích hoạt động trên nền tảng."
    },
    {
      title: "7. Thay đổi chính sách",
      content: "Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo trước cho người dùng."
    }
  ];

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
                  Có hiệu lực từ: {new Date().toLocaleDateString('vi-VN')}
                </Chip>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Chính Sách Bảo Mật
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  MedConnect cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn
                </p>
              </div>
            </Float>

            {/* Important Notice */}
            <Float variant="fadeInUp" delay={0.2}>
              <Card className="mb-8 bg-green-50/90 backdrop-blur-md border border-green-200/50 shadow-2xl">
                <CardBody className="p-6">
                  <Float variant="fadeInUp">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                          Cam kết bảo mật thông tin y tế
                        </h3>
                        <p className="text-green-800">
                          Thông tin sức khỏe của bạn được mã hóa và bảo vệ theo tiêu chuẩn quốc tế về bảo mật dữ liệu y tế.
                        </p>
                      </div>
                    </div>
                  </Float>
                </CardBody>
              </Card>
            </Float>

            {/* Content */}
            <Float variant="fadeInUp" delay={0.3}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none">
                    {sections.map((section, index) => (
                      <Float key={index} variant="fadeInUp" delay={0.4 + index * 0.1}>
                        <div className="mb-8">
                          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {section.title}
                          </h2>
                          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                            {section.content}
                          </p>
                          {index < sections.length - 1 && (
                            <Divider className="my-8 bg-gray-200" />
                          )}
                        </div>
                      </Float>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Float>

            {/* Contact Info */}
            <Float variant="fadeInUp" delay={0.9}>
              <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <Float variant="fadeInUp">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                      Liên hệ về vấn đề bảo mật
                    </h3>
                  </Float>
                  <Float variant="fadeInUp" delay={0.1}>
                    <p className="text-gray-700 text-base md:text-lg mb-6">
                      Nếu bạn có bất kỳ thắc mắc nào về chính sách bảo mật, vui lòng liên hệ với chúng tôi qua:
                    </p>
                  </Float>
                  <Float variant="fadeInUp" delay={0.2}>
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-center space-x-3 text-base md:text-lg">
                        <span className="text-2xl">📧</span>
                        <span>Email: privacy@medconnect.vn</span>
                      </li>
                      <li className="flex items-center space-x-3 text-base md:text-lg">
                        <span className="text-2xl">📞</span>
                        <span>Hotline: 1900-xxxx</span>
                      </li>
                      <li className="flex items-center space-x-3 text-base md:text-lg">
                        <span className="text-2xl">📍</span>
                        <span>Địa chỉ: [Địa chỉ văn phòng]</span>
                      </li>
                    </ul>
                  </Float>
                </CardBody>
              </Card>
            </Float>
          </div>
        </div>
      </div>
    </Default>
  );
};

export default PrivacyPolicy;