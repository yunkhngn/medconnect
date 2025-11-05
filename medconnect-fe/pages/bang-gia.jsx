import React, { useState, useEffect } from 'react';
import { Check, Video, Hospital, Clock, Star, Shield, Award, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import ToastNotification from '@/components/ui/ToastNotification';

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
    'Tim mạch': '❤️',
    'Da liễu': '✨',
    'Nhi khoa': '👶',
    'Tai mũi họng': '👂',
    'Sản phụ khoa': '🤰',
    'Nội khoa': '🩺',
    'Mắt': '👁️',
    'Răng hàm mặt': '🦷',
    'Thần kinh': '🧠',
    'Chỉnh hình': '🦴'
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/specialties/dropdown');
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform data and add additional fields
        const transformedData = data.map((specialty, index) => ({
          id: specialty.id,
          name: specialty.name,
          icon: specialtyIcons[specialty.name] || '🩺',
          inPersonPrice: specialty.offlinePrice || 300000,
          onlinePrice: specialty.onlinePrice || 200000,
          duration: '30-45 phút',
          rating: (4.5 + Math.random() * 0.4).toFixed(1), // Random rating between 4.5-4.9
          doctors: Math.floor(Math.random() * 15) + 8, // Random 8-22 doctors
          popular: index < 3, // First 3 are popular
          features: getFeaturesBySpecialty(specialty.name)
        }));
        
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
    
    // Redirect to doctor search with specialty filter
    router.push(`/tim-bac-si?specialty=${encodeURIComponent(specialtyName)}`);
  };

  const filteredSpecializations = selectedType === 'all' 
    ? specializations 
    : specializations.filter(spec => 
        selectedType === 'popular' ? spec.popular : true
      );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bảng giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <ToastNotification toast={toast} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bảng Giá Dịch Vụ Khám Bệnh
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Chăm sóc sức khỏe chất lượng cao với mức giá minh bạch, hợp lý
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
              <div className="text-blue-600 mb-3">{benefit.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              selectedType === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tất cả chuyên khoa
          </button>
          <button
            onClick={() => setSelectedType('popular')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              selectedType === 'popular'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Phổ biến nhất
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSpecializations.map((spec) => (
            <div
              key={spec.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 relative"
            >
              {spec.popular && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                  PHỔ BIẾN
                </div>
              )}
              
              <div className="bg-gradient-to-br from-blue-500 to-green-400 p-6 text-white">
                <div className="text-5xl mb-3">{spec.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{spec.name}</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span>{spec.rating}</span>
                  </div>
                  <div>{spec.doctors} bác sĩ</div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{spec.duration}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* In-person consultation */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hospital className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-gray-900">Khám trực tiếp</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {spec.inPersonPrice.toLocaleString('vi-VN')}₫
                  </div>
                </div>

                {/* Online consultation */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Video className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-gray-900">Khám online</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {spec.onlinePrice.toLocaleString('vi-VN')}₫
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {spec.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => handleBooking(spec.name)}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:shadow-lg"
                >
                  Đặt lịch ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Chính sách thanh toán & Hoàn tiền</h2>
            <div className="max-w-3xl mx-auto space-y-3 text-blue-100">
              <p>✓ Thanh toán trước để xác nhận lịch hẹn</p>
              <p>✓ Hoàn tiền 100% nếu hủy trước 24 giờ</p>
              <p>✓ Không hoàn tiền nếu hủy trong vòng 24 giờ trước buổi khám</p>
              <p>✓ Hỗ trợ thanh toán qua VNPAY, MoMo, VietQR</p>
              <p className="text-sm mt-4">* Các thông tin y tế được bảo mật theo Nghị định 13/2023/NĐ-CP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bạn cần tư vấn thêm về dịch vụ?
          </h2>
          <p className="text-gray-600 mb-6">
            Liên hệ với chúng tôi để được hỗ trợ chi tiết
          </p>
          <button 
            onClick={() => router.push('/lien-he')}
            className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Liên hệ tư vấn
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;