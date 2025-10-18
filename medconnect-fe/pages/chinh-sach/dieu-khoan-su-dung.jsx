import React from 'react';
import { Default } from '@/components/layouts';
import { Card, CardBody, Divider, Chip, Button } from '@heroui/react';
import { useRouter } from 'next/router';
import Float from '@/components/ui/Float';
import Image from 'next/image';

const TermsOfService = () => {
  const router = useRouter();

  const sections = [
    {
      title: "1. Giới thiệu",
      content: "Chào mừng bạn đến với MedConnect. Bằng việc truy cập và sử dụng nền tảng của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây."
    },
    {
      title: "2. Dịch vụ",
      content: "MedConnect cung cấp nền tảng đặt lịch khám bệnh và tư vấn y tế trực tuyến. Chúng tôi kết nối bệnh nhân với các bác sĩ chuyên khoa."
    },
    {
      title: "3. Quyền và nghĩa vụ của người dùng",
      content: "Người dùng có trách nhiệm cung cấp thông tin chính xác, bảo mật tài khoản và tuân thủ các quy định khi sử dụng dịch vụ."
    },
    {
      title: "4. Quyền sở hữu trí tuệ",
      content: "Tất cả nội dung, thiết kế, logo và các tài liệu trên MedConnect đều thuộc quyền sở hữu của chúng tôi."
    },
    {
      title: "5. Giới hạn trách nhiệm",
      content: "MedConnect không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ của chúng tôi."
    },
    {
      title: "6. Thay đổi điều khoản",
      content: "Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các thay đổi."
    }
  ];

  return (
    <Default title="Điều Khoản Sử Dụng - MedConnect">
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
          <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
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
                <Chip color="primary" variant="flat" className="mb-4 bg-white/90 backdrop-blur-sm">
                  Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                </Chip>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Điều Khoản Sử Dụng
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ MedConnect
                </p>
              </div>
            </Float>

            {/* Content */}
            <Float variant="fadeInUp" delay={0.2}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none">
                    {sections.map((section, index) => (
                      <Float key={index} variant="fadeInUp" delay={0.3 + index * 0.1}>
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
            <Float variant="fadeInUp" delay={0.8}>
              <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <Float variant="fadeInUp">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                      Liên hệ với chúng tôi
                    </h3>
                  </Float>
                  <Float variant="fadeInUp" delay={0.1}>
                    <p className="text-gray-700 text-base md:text-lg mb-6">
                      Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua:
                    </p>
                  </Float>
                  <Float variant="fadeInUp" delay={0.2}>
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-center space-x-3 text-base md:text-lg">
                        <span className="text-2xl">📧</span>
                        <span>Email: support@medconnect.vn</span>
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

export default TermsOfService;