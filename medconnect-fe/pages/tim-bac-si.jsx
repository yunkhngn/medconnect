import React, { useState, useRef, useEffect } from 'react';
import { Default } from '@/components/layouts/';
import { Card, CardBody, CardHeader, Input, Button, Avatar, Chip, Select, SelectItem, Pagination, Divider } from '@heroui/react';
import Float from '@/components/ui/Float';
import Image from 'next/image';
import { useGemini } from '@/hooks/useGemini';
import DOMPurify from 'isomorphic-dompurify';
import mockDoctors from '@/lib/doctorProps';

const SearchDoctor = () => {
  // AI Chat states
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI của MedConnect. Hãy mô tả triệu chứng của bạn, tôi sẽ gợi ý các bác sĩ phù hợp.', timestamp: new Date() }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const messagesEndRef = useRef(null);
  const { sendMessage, loading } = useGemini();

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 9;

  // Tips rotation state
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Mock data
  const specialties = [
    { value: 'all', label: 'Tất cả chuyên khoa' },
    { value: 'tim-mach', label: 'Tim mạch' },
    { value: 'noi-khoa', label: 'Nội khoa' },
    { value: 'ngoai-khoa', label: 'Ngoại khoa' },
    { value: 'nhi-khoa', label: 'Nhi khoa' },
    { value: 'san-phu-khoa', label: 'Sản phụ khoa' },
    { value: 'than-kinh', label: 'Thần kinh' },
    { value: 'da-lieu', label: 'Da liễu' },
    { value: 'mat', label: 'Mắt' },
    { value: 'tai-mui-hong', label: 'Tai mũi họng' },
  ];

  const healthTips = [
    {
      icon: "🏃‍♂️",
      title: "Tập thể dục đều đặn",
      desc: "30 phút tập thể dục mỗi ngày giúp tăng cường sức khỏe tim mạch"
    },
    {
      icon: "🥗",
      title: "Ăn uống lành mạnh",
      desc: "Cân bằng dinh dưỡng với rau củ, trái cây và protein nạc"
    },
    {
      icon: "😴",
      title: "Ngủ đủ giấc",
      desc: "7-8 tiếng ngủ mỗi đêm giúp phục hồi sức khỏe tinh thần"
    },
    {
      icon: "🚭",
      title: "Tránh hút thuốc",
      desc: "Hút thuốc làm tăng nguy cơ mắc các bệnh về phổi và tim mạch"
    },
    {
      icon: "💧",
      title: "Uống đủ nước",
      desc: "2-3 lít nước mỗi ngày giúp thanh lọc cơ thể"
    }
  ];

  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedSpecialty]);

  // Auto-show recommended doctors after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (recommendedDoctors.length === 0) {
        const recommended = mockDoctors.sort(() => 0.5 - Math.random()).slice(0, 3);
        setRecommendedDoctors(recommended);
        setShowPlaceholder(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [recommendedDoctors.length]);

  // Auto-rotate health tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % healthTips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filterDoctors = () => {
    let filtered = mockDoctors;

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(d => d.specialtyValue === selectedSpecialty);
    }

    setFilteredDoctors(filtered);
    setPage(1);
  };

  const handleAIChat = async () => {
    if (!aiInput.trim()) return;

    const userMessage = { role: 'user', content: aiInput, timestamp: new Date() };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');

    try {
      const response = await sendMessage(aiInput);
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);

      // Mock: Sau khi AI trả lời, gợi ý 3 bác sĩ ngẫu nhiên
      const recommended = mockDoctors.sort(() => 0.5 - Math.random()).slice(0, 3);
      setRecommendedDoctors(recommended);
      setShowPlaceholder(false);
    } catch (err) {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: err.message || 'Xin lỗi, đã có lỗi xảy ra.',
        timestamp: new Date()
      }]);
    }
  };

  const formatMessage = (text) => {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    return DOMPurify.sanitize(formatted, {
      ALLOWED_TAGS: ['strong', 'em', 'br'],
      ALLOWED_ATTR: ['class'],
      KEEP_CONTENT: true,
    });
  };

  const paginatedDoctors = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDoctors.slice(start, end);
  }, [page, filteredDoctors]);

  const pages = Math.ceil(filteredDoctors.length / rowsPerPage);

  return (
    <Default title="Tìm Bác Sĩ - MedConnect">
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <Float>
              <div className="text-center mb-12">
                <Chip color="primary" variant="flat" className="mb-4 bg-white/90 backdrop-blur-sm">
                  AI tư vấn
                </Chip>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Tìm bác sĩ
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Tư vấn AI hoặc tìm kiếm bác sĩ theo chuyên khoa
                </p>
              </div>
            </Float>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 items-stretch">
              {/* AI Consultation Card */}
              <Float delay={0.1} className="xl:col-span-1">
                <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl h-full flex flex-col">
                  <CardHeader className="flex flex-col items-start p-6 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Tư vấn AI</h3>
                        <p className="text-xs text-gray-600">Mô tả triệu chứng của bạn</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="p-6 flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="min-h-[16rem] overflow-y-auto mb-4 space-y-3 flex-1">
                      {aiMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                              : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200'
                            }`}>
                            {msg.role === 'user' ? (
                              <p className="text-sm">{msg.content}</p>
                            ) : (
                              <div
                                className="text-sm prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-200">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 items-end mt-auto">
                      <Input
                        className="flex-1 w-full"
                        classNames={{ inputWrapper: "min-h-[48px]" }}
                        placeholder="Mô tả triệu chứng..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAIChat();
                          }
                        }}
                        disabled={loading}
                        size="md"
                        type="textarea"
                        minRows={1}
                        maxRows={4}
                      />
                      <Button
                        isIconOnly
                        size="md"
                        color="primary"
                        onClick={handleAIChat}
                        disabled={!aiInput.trim() || loading}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 h-12 w-12 mb-0"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Float>

              {/* Recommended Doctors Card */}
              <Float delay={0.2} className="xl:col-span-2 flex flex-col h-full">
                <Card className="bg-gradient-to-br from-blue-50/90 to-cyan-50/90 backdrop-blur-md border border-blue-200/50 shadow-2xl mb-6 flex-1">
                  <CardHeader className="p-6 pb-0">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-xl font-bold text-gray-900">Bác sĩ được gợi ý</h3>
                    </div>
                  </CardHeader>
                  <CardBody className="p-6">
                    {showPlaceholder ? (
                      <Float variant="fadeIn">
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <p className="text-gray-600 text-center">
                            AI đang phân tích và gợi ý bác sĩ phù hợp...
                          </p>
                          <div className="flex space-x-2 mt-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </Float>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {recommendedDoctors.map((doctor, idx) => (
                          <Float key={doctor.id} delay={0.3 + idx * 0.1}>
                            <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-shadow">
                              <CardBody className="p-4">
                                <div className="flex flex-col items-center text-center">
                                  <Avatar src={doctor.avatar} className="w-16 h-16 mb-3" />
                                  <h4 className="font-semibold text-gray-900 mb-1">{doctor.name}</h4>
                                  <Chip size="sm" variant="flat" color="primary" className="mb-2">{doctor.specialty}</Chip>
                                  <div className="flex items-center gap-1 mb-2">
                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-sm font-medium">{doctor.rating}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-3">{doctor.experience} năm kinh nghiệm</p>
                                  <Button size="sm" color="primary" fullWidth className="bg-gradient-to-r from-blue-500 to-cyan-600">
                                    Đặt lịch
                                  </Button>
                                </div>
                              </CardBody>
                            </Card>
                          </Float>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Health Tips Banner */}
                <Float delay={0.3}>
                  <Card className="bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-md border border-green-200/50 shadow-2xl">
                    <CardBody className="p-6">
                      <div className="relative max-w-3xl w-full mx-auto flex items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{healthTips[currentTipIndex].icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 text-center">
                          <h4 className="font-semibold text-gray-900 mb-1">{healthTips[currentTipIndex].title}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{healthTips[currentTipIndex].desc}</p>
                        </div>
                        <div className="absolute right-6 inset-y-0 flex items-center space-x-1">
                          {healthTips.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-colors ${idx === currentTipIndex ? 'bg-green-500' : 'bg-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Float>
              </Float>
            </div>

            {/* Top Doctors List */}
            <Float delay={0.3}>
              <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="p-6 pb-0">
                  <h3 className="text-2xl font-bold text-gray-900">Bác Sĩ Hàng Đầu</h3>
                </CardHeader>
                <CardBody className="p-6">
                  {/* Search & Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Float delay={0.4}>
                      <Input
                        placeholder="Tìm kiếm theo tên hoặc chuyên khoa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        startContent={
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        }
                      />
                    </Float>
                    <Float delay={0.5}>
                      <Select
                        placeholder="Chọn chuyên khoa"
                        selectedKeys={selectedSpecialty ? [selectedSpecialty] : []}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                      >
                        {specialties.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </Float>
                  </div>

                  {/* Doctors Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {paginatedDoctors.map((doctor, idx) => (
                      <Float key={doctor.id} delay={0.6 + idx * 0.05}>
                        <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                          <CardBody className="p-5">
                            <div className="flex items-start gap-4">
                              <Avatar src={doctor.avatar} className="w-16 h-16" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{doctor.name}</h4>
                                <Chip size="sm" variant="flat" color="primary" className="mb-2">{doctor.specialty}</Chip>
                                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="font-medium">{doctor.rating}</span>
                                  </div>
                                  <span>{doctor.experience} năm KN</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{doctor.patients}+ bệnh nhân</p>
                                <Button size="sm" color="primary" fullWidth className="bg-gradient-to-r from-blue-500 to-cyan-600">
                                  Đặt lịch khám
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </Float>
                    ))}
                  </div>

                  {/* Pagination */}
                  <Float delay={0.8}>
                    <div className="flex justify-center">
                      <Pagination
                        total={pages}
                        page={page}
                        onChange={setPage}
                        showControls
                        color="primary"
                      />
                    </div>
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

export default SearchDoctor;