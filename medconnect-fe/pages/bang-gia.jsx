import React, { useState, useEffect } from 'react';
import { Default } from '@/components/layouts';
import { Card, CardBody, Divider, Chip, Button } from '@heroui/react';
import { 
  Check, Video, Hospital, Clock, Star, Shield, Award, Loader2,
  Heart, Sparkles, Baby, Ear, Users, Stethoscope, Eye, 
  Tooth, Brain, Bone, Activity
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import ToastNotification from '@/components/ui/ToastNotification';
import Float from '@/components/ui/Float';
import Image from 'next/image';
import { getApiUrl } from "@/utils/api";

const PricingPage = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Bác sĩ được xác thực',
      desc: 'Tất cả bác sĩ đều có chứng chỉ hành nghề hợp lệ'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Đặt lịch linh hoạt',
      desc: 'Chọn thời gian phù hợp với lịch trình của bạn'
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Video call chất lượng cao',
      desc: 'Kết nối ổn định, bảo mật tuyệt đối'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Đơn thuốc điện tử',
      desc: 'Nhận đơn thuốc và tóm tắt khám bệnh ngay sau buổi khám'
    }
  ];

  // Icon mapping for specialties
  const specialtyIcons = {
    'Tim mạch': Heart,
    'Da liễu': Sparkles,
    'Nhi khoa': Baby,
    'Tai mũi họng': Ear,
    'Sản phụ khoa': Users,
    'Nội khoa': Stethoscope,
    'Mắt': Eye,
    'Răng hàm mặt': Tooth,
    'Thần kinh': Brain,
    'Chỉnh hình': Bone
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/specialties/dropdown`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform data and add additional fields
        const transformedData = data.map((specialty, index) => {
          const IconComponent = specialtyIcons[specialty.name] || Stethoscope;
          return {
            id: specialty.id,
            name: specialty.name,
            IconComponent: IconComponent,
            inPersonPrice: specialty.offlinePrice ?? null,
            onlinePrice: specialty.onlinePrice ?? null,
            duration: '30-45 phút',
            rating: (4.5 + Math.random() * 0.4).toFixed(1),
            doctors: Math.floor(Math.random() * 15) + 8,
            popular: index < 3,
            features: getFeaturesBySpecialty(specialty.name)
          };
        });
        
        setSpecializations(transformedData);
      } else {
        toast.error('Không thể tải dữ liệu bảng giá');
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const getFeaturesBySpecialty = (specialtyName) => {
    const features = {
      'Tim mạch': [
        'Khám tổng quát tim mạch',
        'Đo huyết áp, nhịp tim',
        'Tư vấn chế độ dinh dưỡng',
        'Đơn thuốc điện tử'
      ],
      'Da liễu': [
        'Khám các bệnh về da',
        'Tư vấn điều trị mụn, nám',
        'Hướng dẫn chăm sóc da',
        'Đơn thuốc điện tử'
      ],
      'Nhi khoa': [
        'Khám sức khỏe trẻ em',
        'Tư vấn dinh dưỡng cho trẻ',
        'Theo dõi phát triển',
        'Tư vấn tiêm chủng'
      ],
      'Tai mũi họng': [
        'Khám các bệnh TMH',
        'Nội soi tai - mũi - họng',
        'Tư vấn điều trị',
        'Đơn thuốc điện tử'
      ],
      'Sản phụ khoa': [
        'Khám sản phụ khoa',
        'Tư vấn thai kỳ',
        'Siêu âm thai (tại phòng khám)',
        'Tư vấn kế hoạch hóa gia đình'
      ],
      'Nội khoa': [
        'Khám bệnh nội khoa tổng quát',
        'Tư vấn điều trị bệnh mãn tính',
        'Theo dõi sức khỏe định kỳ',
        'Đơn thuốc điện tử'
      ]
    };
    
    return features[specialtyName] || [
      'Khám bệnh chuyên khoa',
      'Tư vấn điều trị',
      'Theo dõi sức khỏe',
      'Đơn thuốc điện tử'
    ];
  };

  const handleBooking = (specialtyName) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt lịch khám');
      router.push('/dang-nhap');
      return;
    }
    
    router.push(`/tim-bac-si?specialty=${encodeURIComponent(specialtyName)}`);
  };

  const filteredSpecializations = selectedType === 'all' 
    ? specializations 
    : specializations.filter(spec => 
        selectedType === 'popular' ? spec.popular : true
      );

  if (loading) {
    return (
      <Default title="Bảng Giá - MedConnect">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải bảng giá...</p>
          </div>
        </div>
      </Default>
    );
  }

  return (
    <Default title="Bảng Giá - MedConnect">
      <div className="min-h-screen relative overflow-hidden">
        <ToastNotification toast={toast} />
        
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
          <div className="absolute inset-0 bg-blue-500/5"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
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
                  Giá cả minh bạch, công khai
                </Chip>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Bảng Giá Dịch Vụ Khám Bệnh
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Chăm sóc sức khỏe chất lượng cao với mức giá minh bạch, hợp lý
                </p>
              </div>
            </Float>

            {/* Benefits Section */}
            <Float variant="fadeInUp" delay={0.2}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    Lợi ích khi sử dụng dịch vụ
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => (
                      <Float key={index} variant="fadeInUp" delay={0.3 + index * 0.1}>
                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow border border-gray-100">
                          <div className="text-blue-600 mb-3 flex justify-center">{benefit.icon}</div>
                          <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                          <p className="text-sm text-gray-600">{benefit.desc}</p>
                        </div>
                      </Float>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Float>

            {/* Pricing Table */}
            <Float variant="fadeInUp" delay={0.6}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Chuyên khoa</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Giá online</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Giá offline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredSpecializations.map((spec, index) => (
                          <tr 
                            key={spec.id} 
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <spec.IconComponent className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-900">{spec.name}</span>
                                    {spec.popular && (
                                      <Chip size="sm" color="warning" variant="flat" className="text-xs">
                                        Phổ biến
                                      </Chip>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                    <div className="flex items-center">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                      <span>{spec.rating}</span>
                                    </div>
                                    <span>{spec.doctors} bác sĩ</span>
                                    <div className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      <span>{spec.duration}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {spec.onlinePrice !== null ? (
                                <div>
                                  <div className="flex items-center justify-center space-x-2 mb-1">
                                    <Video className="w-4 h-4 text-green-600" />
                                    <span className="text-lg font-bold text-green-600">
                                      {spec.onlinePrice.toLocaleString('vi-VN')}₫
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {spec.inPersonPrice !== null ? (
                                <div>
                                  <div className="flex items-center justify-center space-x-2 mb-1">
                                    <Hospital className="w-4 h-4 text-blue-600" />
                                    <span className="text-lg font-bold text-blue-600">
                                      {spec.inPersonPrice.toLocaleString('vi-VN')}₫
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Float>

            {/* Payment Policy */}
            <Float variant="fadeInUp" delay={1.2}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    Chính sách thanh toán & Hoàn tiền
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Thanh toán trước để xác nhận lịch hẹn</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Hoàn tiền 100% nếu hủy trước 24 giờ</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Không hoàn tiền nếu hủy trong vòng 24 giờ trước buổi khám</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Hỗ trợ thanh toán qua VNPAY, MoMo, VietQR</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-4 italic">
                      * Các thông tin y tế được bảo mật theo Nghị định 13/2023/NĐ-CP
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Float>

            {/* Contact Info */}
            <Float variant="fadeInUp" delay={1.3}>
              <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-8 md:p-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    Bạn cần tư vấn thêm về dịch vụ?
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg mb-6 text-center">
                    Liên hệ với chúng tôi để được hỗ trợ chi tiết
                  </p>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => router.push('/dang-nhap')}
                      color="primary"
                      size="lg"
                    >
                      Liên hệ tư vấn
                    </Button>
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

export default PricingPage;
