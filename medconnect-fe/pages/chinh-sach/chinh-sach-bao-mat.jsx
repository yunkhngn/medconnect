import React from 'react';
import { Default } from '@/components/layouts';
import { Card, CardBody, Divider, Chip, Button } from '@heroui/react';
import Link from 'next/link';

const PrivacyPolicy = () => {
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
            <Chip color="success" variant="flat" className="mb-4">
              Có hiệu lực từ: {new Date().toLocaleDateString('vi-VN')}
            </Chip>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Chính Sách Bảo Mật
            </h1>
            <p className="text-lg text-gray-600">
              MedConnect cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn
            </p>
          </div>

          {/* Important Notice */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardBody className="p-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Cam kết bảo mật thông tin y tế
                  </h3>
                  <p className="text-blue-800">
                    Thông tin sức khỏe của bạn được mã hóa và bảo vệ theo tiêu chuẩn quốc tế về bảo mật dữ liệu y tế.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

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
                Liên hệ về vấn đề bảo mật
              </h3>
              <p className="text-gray-700">
                Nếu bạn có bất kỳ thắc mắc nào về chính sách bảo mật, vui lòng liên hệ:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>📧 Email: privacy@medconnect.vn</li>
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

export default PrivacyPolicy;