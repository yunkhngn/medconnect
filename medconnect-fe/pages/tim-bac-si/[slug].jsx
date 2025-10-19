import React, { useState, useEffect } from 'react';
import { Default } from '@/components/layouts/';
import { Card, CardBody, CardHeader, Button, Chip, Avatar, Divider, Badge } from '@heroui/react';
import { useRouter } from 'next/router';
import Float from '@/components/ui/Float';
import Image from 'next/image';
import mockDoctors from '@/lib/doctorProps';

const DoctorDetail = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      // Parse ID from slug (format: bs-id-name)
      const slugParts = slug.split('-');
      const id = slugParts[1]; // Skip 'bs' prefix
      
      // Find doctor by ID
      const foundDoctor = mockDoctors.find(d => d.id.toString() === id);
      
      if (foundDoctor) {
        setDoctor(foundDoctor);
      } else {
        // Fallback to first doctor if not found
        setDoctor(mockDoctors[0]);
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading || !doctor) {
    return (
      <Default title="Đang tải...">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin bác sĩ...</p>
          </div>
        </div>
      </Default>
    );
  }

  return (
    <Default title={`${doctor.name} - MedConnect`}>
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
          <div className="absolute inset-0 bg-white/70 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
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

            {/* Doctor Header */}
            <Float variant="fadeInUp" delay={0.1}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                    {/* Avatar */}
                    <Float variant="scaleIn">
                      <div className="relative">
                        <Avatar 
                          src={doctor.avatar} 
                          className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-blue-100 shadow-2xl" 
                        />
                        <Badge 
                          color="success" 
                          content="✓" 
                          size="lg" 
                          className="absolute -bottom-2 -right-2"
                        />
                      </div>
                    </Float>

                    {/* Info */}
                    <div className="flex-1 text-center lg:text-left">
                      <Float variant="fadeInUp" delay={0.2}>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            {doctor.name}
                          </h1>
                          <Chip size="lg" variant="flat" color="primary" className="bg-blue-100 text-blue-800">
                            {doctor.specialty}
                          </Chip>
                        </div>
                      </Float>

                      <Float variant="fadeInUp" delay={0.3}>
                        <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                          {doctor.description}
                        </p>
                      </Float>

                      <Float variant="fadeInUp" delay={0.4}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-semibold text-lg">{doctor.rating}</span>
                            </div>
                            <p className="text-sm text-gray-600">Đánh giá</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-lg">{doctor.experience}</p>
                            <p className="text-sm text-gray-600">Năm KN</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-lg">{doctor.patients}+</p>
                            <p className="text-sm text-gray-600">Bệnh nhân</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-lg">24/7</p>
                            <p className="text-sm text-gray-600">Hỗ trợ</p>
                          </div>
                        </div>
                      </Float>

                      <Float variant="fadeInUp" delay={0.5}>
                        <Button 
                          size="lg" 
                          color="primary" 
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold px-8 py-3"
                        >
                          Đặt lịch khám ngay
                        </Button>
                      </Float>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Float>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                <Float variant="fadeInUp" delay={0.6}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                    <CardHeader>
                      <h3 className="text-2xl font-bold text-gray-900">Giới thiệu</h3>
                    </CardHeader>
                    <CardBody>
                      <p className="text-gray-700 leading-relaxed">
                        Bác sĩ {doctor.name} là một chuyên gia hàng đầu trong lĩnh vực {doctor.specialty.toLowerCase()} 
                        với hơn {doctor.experience} năm kinh nghiệm. Bác sĩ đã giúp đỡ hàng trăm bệnh nhân 
                        vượt qua các vấn đề sức khỏe phức tạp và luôn cập nhật những phương pháp điều trị tiên tiến nhất.
                      </p>
                      <Divider className="my-6" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Chuyên môn</h4>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Chẩn đoán và điều trị {doctor.specialty.toLowerCase()}
                            </li>
                            <li className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Tư vấn sức khỏe toàn diện
                            </li>
                            <li className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Theo dõi và chăm sóc sau điều trị
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Ngôn ngữ</h4>
                          <div className="flex flex-wrap gap-2">
                            <Chip size="sm" variant="flat" color="primary">Tiếng Việt</Chip>
                            <Chip size="sm" variant="flat" color="secondary">Tiếng Anh</Chip>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Float>

                {/* Education & Certifications */}
                <Float variant="fadeInUp" delay={0.7}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                    <CardHeader>
                      <h3 className="text-2xl font-bold text-gray-900">Học vấn & Chứng chỉ</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{doctor.education}</h4>
                            <p className="text-gray-600">Bằng tốt nghiệp Đại học Y</p>
                          </div>
                        </div>
                        {doctor.certifications.map((cert, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{cert}</h4>
                              <p className="text-gray-600">Chứng chỉ chuyên môn</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </Float>

                {/* Reviews */}
                <Float variant="fadeInUp" delay={0.8}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                    <CardHeader>
                      <h3 className="text-2xl font-bold text-gray-900">Đánh giá từ bệnh nhân</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-6">
                        {[
                          {
                            name: "Nguyễn Thị A",
                            rating: 5,
                            comment: "Bác sĩ rất tận tình và chuyên nghiệp. Tôi rất hài lòng với cách điều trị.",
                            date: "2024-01-15"
                          },
                          {
                            name: "Trần Văn B", 
                            rating: 5,
                            comment: "Giải thích rất rõ ràng về tình trạng bệnh và phương pháp điều trị.",
                            date: "2024-01-10"
                          },
                          {
                            name: "Lê Thị C",
                            rating: 4,
                            comment: "Thời gian chờ không quá lâu, bác sĩ thăm khám kỹ lưỡng.",
                            date: "2024-01-05"
                          }
                        ].map((review, index) => (
                          <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar size="sm" />
                              <div>
                                <p className="font-medium text-gray-900">{review.name}</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[...Array(review.rating)].map((_, i) => (
                                      <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </Float>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Schedule */}
                <Float variant="fadeInRight" delay={0.6}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-gray-900">Lịch làm việc</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {[
                          { day: "Thứ 2", time: "08:00 - 17:00", available: true },
                          { day: "Thứ 3", time: "08:00 - 17:00", available: true },
                          { day: "Thứ 4", time: "08:00 - 17:00", available: true },
                          { day: "Thứ 5", time: "08:00 - 17:00", available: true },
                          { day: "Thứ 6", time: "08:00 - 15:00", available: true },
                          { day: "Thứ 7", time: "08:00 - 12:00", available: false },
                          { day: "Chủ nhật", time: "Nghỉ", available: false }
                        ].map((schedule, index) => (
                          <div key={index} className="flex justify-between items-center py-2">
                            <span className="font-medium text-gray-900">{schedule.day}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${schedule.available ? 'text-gray-700' : 'text-gray-500'}`}>
                                {schedule.time}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${schedule.available ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Divider className="my-4" />
                      <Button 
                        fullWidth 
                        color="primary" 
                        className="bg-gradient-to-r from-blue-500 to-cyan-600"
                      >
                        Đặt lịch ngay
                      </Button>
                    </CardBody>
                  </Card>
                </Float>

                {/* Contact Info */}
                <Float variant="fadeInRight" delay={0.7}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-gray-900">Thông tin liên hệ</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Điện thoại</p>
                            <p className="font-medium text-gray-900">+84 123 456 789</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">bacsi@medconnect.vn</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Địa chỉ</p>
                            <p className="font-medium text-gray-900">123 Đường ABC, Quận XYZ</p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Float>

                {/* Quick Actions */}
                <Float variant="fadeInRight" delay={0.8}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-gray-900">Hành động nhanh</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        <Button 
                          fullWidth 
                          variant="bordered" 
                          className="justify-start"
                          startContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          }
                        >
                          Nhắn tin
                        </Button>
                        <Button 
                          fullWidth 
                          variant="bordered" 
                          className="justify-start"
                          startContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          }
                        >
                          Gọi điện
                        </Button>
                        <Button 
                          fullWidth 
                          variant="bordered" 
                          className="justify-start"
                          startContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          }
                        >
                          Chia sẻ
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Float>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
};

export default DoctorDetail;
