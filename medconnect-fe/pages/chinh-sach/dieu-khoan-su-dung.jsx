import React from 'react';
import { Default } from '@/components/layouts';
import { Card, CardBody, Divider, Chip, Button } from '@heroui/react';
import Link from 'next/link';

const TermsOfService = () => {
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
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
            <Button 
              variant="light" 
              className="mb-6"
              startContent={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              <Link href="/signup">Quay lại đăng ký</Link>
            </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <Chip color="primary" variant="flat" className="mb-4">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </Chip>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Điều Khoản Sử Dụng
            </h1>
            <p className="text-lg text-gray-600">
              Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ MedConnect
            </p>
          </div>

          {/* Content */}
          <Card className="mb-8">
            <CardBody className="p-8">
              <div className="prose prose-lg max-w-none">
                {sections.map((section, index) => (
                  <div key={index} className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                    {index < sections.length - 1 && (
                      <Divider className="my-6" />
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Liên hệ với chúng tôi
              </h3>
              <p className="text-gray-700">
                Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>📧 Email: support@medconnect.vn</li>
                <li>📞 Hotline: 1900-xxxx</li>
                <li>📍 Địa chỉ: [Địa chỉ văn phòng]</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </Default>
  );
};

export default TermsOfService;