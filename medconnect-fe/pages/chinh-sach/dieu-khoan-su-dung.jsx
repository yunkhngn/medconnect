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
      content: "Chào mừng bạn đến với MedConnect - nền tảng đặt lịch khám bệnh và tư vấn y tế trực tuyến. Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây, cũng như các quy định pháp luật Việt Nam hiện hành, đặc biệt là Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân."
    },
    {
      title: "2. Định nghĩa",
      content: "Dữ liệu cá nhân: Là thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình ảnh, âm thanh hoặc dạng tương tự trên môi trường điện tử gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể. Dữ liệu cá nhân nhạy cảm: Bao gồm thông tin sức khỏe, sinh trắc học, đời sống riêng tư, được bảo vệ đặc biệt theo Điều 4 Nghị định 13/2023/NĐ-CP."
    },
    {
      title: "3. Phạm vi dịch vụ",
      content: "MedConnect cung cấp các dịch vụ: (a) Đặt lịch khám bệnh trực tuyến và tại phòng khám; (b) Tư vấn y tế qua video call; (c) Quản lý hồ sơ bệnh án điện tử; (d) Thanh toán trực tuyến; (e) Đánh giá và phản hồi về dịch vụ. Chúng tôi đóng vai trò là Bên Kiểm soát dữ liệu cá nhân theo Điều 4, khoản 12 Nghị định 13/2023/NĐ-CP."
    },
    {
      title: "4. Quyền của người dùng (Theo Điều 9 Nghị định 13/2023/NĐ-CP)",
      content: "Bạn có các quyền sau: (1) Quyền được biết về việc xử lý dữ liệu cá nhân; (2) Quyền đồng ý hoặc không đồng ý cho xử lý dữ liệu; (3) Quyền truy cập dữ liệu cá nhân; (4) Quyền rút lại sự đồng ý; (5) Quyền xóa dữ liệu; (6) Quyền hạn chế xử lý dữ liệu; (7) Quyền yêu cầu cung cấp bản sao dữ liệu; (8) Quyền phản đối xử lý dữ liệu; (9) Quyền khiếu nại, tố cáo, khởi kiện; (10) Quyền yêu cầu bồi thường thiệt hại; (11) Quyền tự bảo vệ theo quy định pháp luật. Để thực hiện các quyền này, vui lòng liên hệ: privacy@medconnect.vn"
    },
    {
      title: "5. Nghĩa vụ của người dùng",
      content: "Người dùng có trách nhiệm: (a) Cung cấp thông tin chính xác, đầy đủ và cập nhật; (b) Bảo mật thông tin tài khoản và mật khẩu; (c) Tuân thủ các quy định pháp luật và quy tắc sử dụng; (d) Không sử dụng dịch vụ cho mục đích bất hợp pháp; (e) Chịu trách nhiệm về tính chính xác của dữ liệu cá nhân do mình cung cấp (Điều 42, Nghị định 13/2023/NĐ-CP); (f) Thông báo kịp thời cho MedConnect về các vi phạm liên quan đến dữ liệu cá nhân."
    },
    {
      title: "6. Thu thập và xử lý dữ liệu cá nhân",
      content: "Chúng tôi thu thập và xử lý các dữ liệu sau với sự đồng ý của bạn: (a) Dữ liệu cơ bản: Họ tên, email, số điện thoại, địa chỉ, ngày sinh, giới tính; (b) Dữ liệu nhạy cảm: Thông tin sức khỏe (triệu chứng, lịch sử bệnh, chẩn đoán, đơn thuốc), hình ảnh y tế, ảnh khuôn mặt, thông tin BHYT; (c) Dữ liệu kỹ thuật: Địa chỉ IP, cookie, lịch sử truy cập. Việc xử lý dữ liệu tuân thủ các điều kiện tại Điều 6, 7, 8 Nghị định 13/2023/NĐ-CP."
    },
    {
      title: "7. Mục đích xử lý dữ liệu",
      content: "Dữ liệu của bạn được sử dụng để: (a) Cung cấp và quản lý dịch vụ y tế; (b) Hỗ trợ bác sĩ trong chẩn đoán và điều trị; (c) Lưu trữ hồ sơ bệnh án điện tử; (d) Xử lý thanh toán và hóa đơn; (e) Gửi thông báo về lịch hẹn và kết quả khám; (f) Cải thiện chất lượng dịch vụ; (g) Tuân thủ nghĩa vụ pháp lý; (h) Phòng chống gian lận và bảo mật tài khoản. Mọi mục đích đều tuân thủ Điều 13 Nghị định 13/2023/NĐ-CP."
    },
    {
      title: "8. Chia sẻ dữ liệu với bên thứ ba",
      content: "Dữ liệu của bạn chỉ được chia sẻ trong các trường hợp sau: (a) Với bác sĩ và nhân viên y tế trực tiếp phục vụ điều trị của bạn; (b) Với đối tác thanh toán (đã ký thỏa thuận bảo mật); (c) Với cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp; (d) Với sự đồng ý rõ ràng của bạn cho các mục đích cụ thể. Chúng tôi KHÔNG bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục đích thương mại. Mọi chia sẻ đều tuân thủ Điều 16 Nghị định 13/2023/NĐ-CP."
    },
    {
      title: "9. Biện pháp bảo mật (Theo Điều 20 Nghị định 13/2023/NĐ-CP)",
      content: "MedConnect áp dụng các biện pháp bảo mật sau: (a) Mã hóa dữ liệu nhạy cảm khi truyền tải (SSL/TLS) và lưu trữ (AES-256); (b) Kiểm soát truy cập nghiêm ngặt với xác thực đa yếu tố; (c) Ghi log và giám sát mọi hoạt động xử lý dữ liệu; (d) Sao lưu dữ liệu định kỳ và có kế hoạch khôi phục thảm họa; (e) Đào tạo nhân viên về bảo vệ dữ liệu cá nhân; (f) Thực hiện đánh giá rủi ro và kiểm toán bảo mật định kỳ; (g) Phân quyền truy cập theo nguyên tắc tối thiểu cần thiết."
    },
    {
      title: "10. Thời gian lưu trữ dữ liệu",
      content: "Dữ liệu của bạn được lưu trữ: (a) Dữ liệu y tế: Theo quy định pháp luật về hồ sơ bệnh án (tối thiểu 15 năm hoặc theo quy định); (b) Dữ liệu tài khoản: Cho đến khi bạn yêu cầu xóa hoặc 2 năm sau lần đăng nhập cuối cùng; (c) Dữ liệu giao dịch: Theo quy định pháp luật về kế toán và thuế (tối thiểu 10 năm). Bạn có quyền yêu cầu xóa dữ liệu bất cứ lúc nào, trừ các trường hợp pháp luật quy định phải lưu trữ."
    },
    {
      title: "11. Thông báo vi phạm dữ liệu (Theo Điều 23 Nghị định 13/2023/NĐ-CP)",
      content: "Trong trường hợp phát hiện vi phạm an toàn dữ liệu cá nhân, chúng tôi cam kết: (a) Thông báo cho Bộ Công an trong vòng 72 giờ kể từ khi phát hiện; (b) Thông báo cho bạn ngay lập tức nếu vi phạm có thể gây rủi ro cao cho quyền và lợi ích hợp pháp của bạn; (c) Nội dung thông báo bao gồm: bản chất vi phạm, dữ liệu bị ảnh hưởng, hậu quả có thể xảy ra, biện pháp khắc phục đã và đang thực hiện; (d) Hợp tác với cơ quan chức năng trong việc điều tra và xử lý."
    },
    {
      title: "12. Chuyển dữ liệu ra nước ngoài",
      content: "Dữ liệu của bạn được lưu trữ tại Việt Nam. Trong trường hợp cần chuyển dữ liệu ra nước ngoài (ví dụ: sử dụng dịch vụ cloud), chúng tôi sẽ: (a) Xin phép Bộ Công an nếu là dữ liệu nhạy cảm; (b) Chỉ chuyển đến quốc gia có mức độ bảo vệ tương đương Việt Nam; (c) Ký kết thỏa thuận bảo mật với bên nhận; (d) Thông báo và xin đồng ý của bạn. Tuân thủ Điều 18 Nghị định 13/2023/NĐ-CP."
    },
    {
      title: "13. Quyền sở hữu trí tuệ",
      content: "Tất cả nội dung, thiết kế, logo, mã nguồn, thuật toán, giao diện và các tài liệu khác trên MedConnect đều thuộc quyền sở hữu trí tuệ của chúng tôi hoặc các đối tác được cấp phép. Nghiêm cấm mọi hành vi sao chép, sửa đổi, phân phối, truyền tải hoặc sử dụng trái phép mà không có sự đồng ý bằng văn bản."
    },
    {
      title: "14. Giới hạn trách nhiệm",
      content: "MedConnect không chịu trách nhiệm về: (a) Chất lượng chuyên môn và quyết định y khoa của bác sĩ; (b) Thiệt hại do lỗi thông tin không chính xác từ phía người dùng; (c) Gián đoạn dịch vụ do sự cố kỹ thuật bất khả kháng; (d) Thiệt hại do vi phạm an ninh từ phía người dùng (mật khẩu yếu, chia sẻ tài khoản). Tuy nhiên, chúng tôi cam kết bồi thường thiệt hại theo quy định tại Điều 38, khoản 6 Nghị định 13/2023/NĐ-CP nếu vi phạm phát sinh do lỗi của MedConnect."
    },
    {
      title: "15. Trách nhiệm của MedConnect (Theo Điều 38 Nghị định 13/2023/NĐ-CP)",
      content: "Với vai trò là Bên Kiểm soát dữ liệu, chúng tôi cam kết: (a) Thực hiện các biện pháp tổ chức và kỹ thuật để bảo vệ dữ liệu của bạn; (b) Ghi lại và lưu trữ nhật ký hệ thống về quá trình xử lý dữ liệu; (c) Lựa chọn Bên Xử lý dữ liệu có biện pháp bảo vệ phù hợp; (d) Bảo đảm các quyền của bạn theo Điều 9; (e) Chịu trách nhiệm trước bạn về thiệt hại do xử lý dữ liệu gây ra; (f) Phối hợp với Bộ Công an và cơ quan có thẩm quyền trong bảo vệ dữ liệu cá nhân."
    },
    {
      title: "16. Thay đổi điều khoản",
      content: "Chúng tôi có quyền thay đổi các điều khoản này để phù hợp với quy định pháp luật và nhu cầu vận hành. Mọi thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên website ít nhất 30 ngày trước khi có hiệu lực. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận điều khoản mới. Nếu không đồng ý, bạn có quyền ngừng sử dụng dịch vụ và yêu cầu xóa dữ liệu."
    },
    {
      title: "17. Cơ quan chuyên trách và khiếu nại (Theo Điều 29 Nghị định 13/2023/NĐ-CP)",
      content: "Nếu bạn có khiếu nại về việc xử lý dữ liệu cá nhân, bạn có quyền: (a) Liên hệ trực tiếp với MedConnect qua privacy@medconnect.vn; (b) Khiếu nại đến Cơ quan chuyên trách: Cục An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao - Bộ Công an; (c) Truy cập Cổng thông tin quốc gia về bảo vệ dữ liệu cá nhân để được hỗ trợ; (d) Khởi kiện ra tòa án theo quy định pháp luật."
    },
    {
      title: "18. Luật áp dụng và giải quyết tranh chấp",
      content: "Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam, đặc biệt là Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân. Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền tại Việt Nam."
    },
    {
      title: "19. Hiệu lực",
      content: "Điều khoản này có hiệu lực từ ngày 01/07/2023 (theo Điều 43 Nghị định 13/2023/NĐ-CP) và áp dụng cho tất cả người dùng MedConnect. Phiên bản cập nhật mới nhất: " + new Date().toLocaleDateString('vi-VN')
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
          <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 w-96 bg-purple-200/20 rounded-full blur-3xl"></div>
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
                  Tuân thủ Nghị định 13/2023/NĐ-CP | Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                </Chip>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Điều Khoản Sử Dụng
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
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
                        <span>Email hỗ trợ: support@medconnect.vn</span>
                      </li>
                      <li className="flex items-center space-x-3 text-base md:text-lg">
                        <span className="text-2xl">🔒</span>
                        <span>Email bảo vệ dữ liệu: privacy@medconnect.vn</span>
                      </li>
                      <li className="flex items-center space-x-3 text-base md:text-lg">
                        <span className="text-2xl">📞</span>
                        <span>Hotline: 1900-xxxx</span>
                      </li>
                      <li className="flex items-center space-x-3 text-base md:text-lg">
                        <span className="text-2xl">📍</span>
                        <span>Địa chỉ: [Địa chỉ văn phòng]</span>
                      </li>
                      <li className="flex items-start space-x-3 text-base md:text-lg">
                        <span className="text-2xl">🛡️</span>
                        <div>
                          <div className="font-semibold">Cơ quan chuyên trách bảo vệ dữ liệu cá nhân:</div>
                          <div className="text-gray-600 mt-1">Cục An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao - Bộ Công an</div>
                        </div>
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