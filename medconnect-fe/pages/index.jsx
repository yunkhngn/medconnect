import { Default } from "../components/layouts/";
import Meta from "../components/layouts/Meta";
import { Card, CardBody, Button, Chip, Avatar, Skeleton } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import Float from "@/components/ui/Float";
import { useState, useEffect } from "react";
import { Stethoscope, Award, Star, Phone, Mail, GraduationCap, FileText, ChevronRight } from "lucide-react";

import { getBaseUrl, getApiUrl } from "@/utils/api";

const SPECIALTY_MAP = {
  TIM_MACH: "Tim mạch",
  NOI_KHOA: "Nội khoa",
  NHI_KHOA: "Nhi khoa",
  SAN_PHU_KHOA: "Sản phụ khoa",
  THAN_KINH: "Thần kinh",
  DA_LIEU: "Da liễu",
  MAT: "Mắt",
  TAI_MUI_HONG: "Tai mũi họng",
  NGOAI_KHOA: "Ngoại khoa",
  GENERAL: "Đa khoa",
};

export default function HomePage() {
  const router = useRouter();

  const features = [
  {
    title: "Tìm bác sĩ nhanh",
    description: "Lọc theo chuyên khoa, đánh giá và giờ làm việc để chọn người phù hợp."
  },
  {
    title: "Khám từ xa qua video",
    description: "Trao đổi trực tiếp với bác sĩ, gửi hình ảnh và mô tả triệu chứng ngay trên ứng dụng."
  },
  {
    title: "Theo dõi sức khỏe",
    description: "Xem lại đơn thuốc, kết quả khám và lịch sử tư vấn mọi lúc."
  }
];

 const services = [
  { title: "Tư vấn trực tuyến", desc: "Gặp bác sĩ mọi lúc, mọi nơi qua video call"},
  { title: "Đặt lịch khám", desc: "Chọn bác sĩ, khung giờ, được xác nhận ngay"},
  { title: "Theo dõi hồ sơ", desc: "Xem lại kê đơn, lịch sử khám trên ứng dụng"},
  { title: "Nhắc lịch & thông báo", desc: "Tự động nhắc tái khám, nhận kết quả"},
  { title: "Kết nối bác sĩ", desc: "Trò chuyện an toàn, bảo mật với chuyên gia"},
  { title: "Chăm sóc từ xa", desc: "Bác sĩ theo dõi và hướng dẫn điều trị tại nhà"}
];

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorRatings, setDoctorRatings] = useState({});
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Fetch testimonials from backend
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoadingTestimonials(true);
        const response = await fetch(`${getApiUrl()}/feedback/recent?limit=6`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data)) {
            // Map feedback data to testimonials format
            const mappedTestimonials = data.data.map((feedback) => ({
              id: feedback.feedbackId,
              name: feedback.patientName || "Bệnh nhân",
              quote: feedback.comment || "",
              role: "Patient",
              avatar: feedback.patientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.patientName || "Bệnh nhân")}&size=128&bold=true&rounded=true&background=random&color=ffffff`,
              rating: feedback.rating || 5,
            }));
            setTestimonials(mappedTestimonials);
          } else {
            // Fallback to empty array if no feedbacks
            setTestimonials([]);
          }
        } else {
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
      } finally {
        setLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Fetch real doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await fetch(`${getBaseUrl()}/doctor/dashboard/all`);
        if (response.ok) {
          const data = await response.json();
          const doctorsList = Array.isArray(data) ? data : [];
          
          // Filter active doctors and take first 3
          const activeDoctors = doctorsList
            .filter(doc => doc.status === 'ACTIVE' || !doc.status)
            .slice(0, 3)
            .map(doc => ({
              id: doc.id || doc.userId,
              name: doc.name || "Bác sĩ",
              specialty: doc.specialty || doc.specializationName || "Đa khoa",
              years: doc.experience_years || doc.experienceYears || 0,
              avatar: doc.avatarUrl || doc.avatar || "https://thumbs.dreamstime.com/b/d-avatar-doctor-portrait-medical-uniform-white-background-327426936.jpg",
              bio: doc.bio,
              rating: doc.rating || 0,
              phone: doc.phone,
              email: doc.email,
              educationLevel: doc.education_level || doc.educationLevel,
              licenseNumber: doc.licenseNumber || doc.license?.licenseNumber,
            }));
          
          setDoctors(activeDoctors);

          // Fetch ratings for doctors
          const ratingPromises = activeDoctors.map(async (doctor) => {
            try {
              const ratingResponse = await fetch(`${getApiUrl()}/feedback/doctor/${doctor.id}/summary`);
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                return {
                  doctorId: doctor.id,
                  rating: ratingData.averageRating || doctor.rating || 0,
                };
              }
            } catch (e) {
              console.error(`Error fetching rating for doctor ${doctor.id}:`, e);
            }
            return { doctorId: doctor.id, rating: doctor.rating || 0 };
          });

          const ratings = await Promise.all(ratingPromises);
          const ratingsMap = {};
          ratings.forEach((r) => {
            ratingsMap[r.doctorId] = r.rating;
          });
          setDoctorRatings(ratingsMap);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => (prevIndex + 3) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentTestimonialIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  return (
    <>
      <Meta
        title="MedConnect - Nền tảng khám bệnh trực tuyến"
        description="MedConnect - Nền tảng đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam. Kết nối bệnh nhân với bác sĩ chuyên nghiệp, khám bệnh từ xa qua video call, quản lý hồ sơ sức khỏe điện tử. Đặt lịch khám nhanh chóng, tiện lợi và an toàn."
        keywords="khám bệnh online, đặt lịch khám, bác sĩ trực tuyến, telemedicine, khám bệnh từ xa, hồ sơ sức khỏe, MedConnect, y tế số, chăm sóc sức khỏe"
        ogImage="/assets/homepage/cover.jpg"
      />
      <Default>
        {/* HERO - Background không cần Float */}
      <section className="relative overflow-hidden rounded-2xl mx-2 sm:mx-4 md:mx-6 mt-4 sm:mt-6 md:mt-1">
        {/* gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#f1e1ff] via-[#ffe6ea] to-[#e6f0ff]" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/60 blur-2xl" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 md:py-16 items-center">
          {/* Left copy */}
          <Float variant="fadeInUp">
            <div>
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-5">
                <span className="inline-flex h-5 sm:h-6 items-center rounded-full bg-white/70 px-2 sm:px-3">MedConnect</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                MedConnect
                <br />
                Platform
              </h1>
              <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-gray-700 max-w-xl">
                Hệ thống MedConnect cung cấp dịch vụ khám chữa bệnh từ xa tiện lợi và nhanh chóng.
              </p>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href="/tim-kiem-bac-si"
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center text-white bg-primary hover:bg-primary/90 text-sm sm:text-base md:text-lg"
                >
                  Tìm bác sĩ
                </Link>
                <Link href="/dang-ky"
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center text-primary hover:bg-gray-100 text-sm sm:text-base md:text-lg"
                >
                  Đăng ký miễn phí
                </Link>
              </div>

              {/* mini cards under CTA */}
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                <Float variant="scaleIn" delay={0.1}>
                  <Card className="w-full sm:w-52 bg-white/80 backdrop-blur">
                    <CardBody className="p-3 sm:p-4 flex items-center gap-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Bác sĩ online</p>
                        <p className="font-semibold text-sm sm:text-base">Nói chuyện với hơn 285 bác sĩ</p>
                         <p className="text-xs text-gray-500">Với nhiều năm kinh nghiệm trong lĩnh vực chăm sóc y khoa</p>
                      </div>
                    </CardBody>
                  </Card>
                </Float>

                <Float variant="scaleIn" delay={0.15}>
                  <Card className="w-full sm:w-52 bg-white/80 backdrop-blur">
                    <CardBody className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-gray-600">Người dùng</p>
                        <Chip size="sm" color="warning" variant="flat">+18%</Chip>
                      </div>
                      <p className="mt-2 text-xl sm:text-2xl font-bold">94.5<span className="text-sm sm:text-base align-top">/pt</span></p>
                      <p className="text-xs text-gray-500">↑ 2.7% từ tuần trước</p>
                    </CardBody>
                  </Card>
                </Float>
              </div>
            </div>
          </Float>

          {/* Right hero visual */}
          <div className="relative min-h-[300px] sm:min-h-[380px] md:min-h-[520px] mt-8 lg:mt-0" aria-busy={!heroLoaded}>
            {/* background circle */}
           

            {/* skeleton while hero image loads */}
            {!heroLoaded && (
              <div className="absolute inset-0">
                <Skeleton className="h-full w-full rounded-2xl" />
              </div>
            )}

            {/* hero image */}
            <Image
              src="/assets/homepage/cover.jpg"
              alt="Doctor hero"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover rounded-2xl transition-opacity duration-500 ${heroLoaded ? 'opacity-80' : 'opacity-0'}`}
              priority
              quality={80}
              onLoadingComplete={() => setHeroLoaded(true)}
            />

            {/* floating chips */}
            <Float variant="fadeInRight" delay={0.2}>
              <div className="absolute right-4 sm:right-6 top-4 sm:top-6 flex flex-wrap gap-1 sm:gap-2">
                <Chip variant="flat" color="secondary" size="sm">TeleMedicine</Chip>
                <Chip variant="flat" color="primary" size="sm">24/7</Chip>
                <Chip variant="flat" color="success" size="sm">Online</Chip>
              </div>
            </Float>
          </div>
        </div>
      </section>
      {/* FEATURE STRIP */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <Float variant="fadeInUp">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Tại sao chọn MedConnect?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Chúng tôi mang đến trải nghiệm chăm sóc sức khỏe hiện đại
              </p>
            </div>
          </Float>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((f, i) => (
              <Float key={i} variant="fadeInUp" delay={i * 0.05}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{f.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{f.description}</p>
                  </CardBody>
                </Card>
              </Float>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Float variant="fadeInUp">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Dịch vụ chăm sóc sức khỏe
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Đa dạng chuyên khoa phục vụ nhu cầu của bạn
              </p>
            </div>
          </Float>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((s, i) => (
              <Float key={i} variant="scaleIn" delay={i * 0.05}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-6">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{s.desc}</p>
                  </CardBody>
                </Card>
              </Float>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 bg-gradient-to-tr from-[#f1e1ff] via-[#ffe6ea] to-[#e6f0ff]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center text-gray-900">
            {[
              {k:"Bác sĩ",v:"100+"},
              {k:"Bệnh nhân",v:"1K+"},
              {k:"Lịch hẹn",v:"1K+"},
              {k:"Đánh giá",v:"4.9/5"}
            ].map((it, idx)=>(
              <Float key={idx} variant="scaleIn" delay={idx * 0.05}>
                <div>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">{it.v}</p>
                  <p className="text-sm sm:text-base text-gray-700">{it.k}</p>
                </div>
              </Float>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <Float variant="fadeInUp">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Đội ngũ bác sĩ chuyên nghiệp
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Các bác sĩ hàng đầu luôn sẵn sàng phục vụ bạn
              </p>
            </div>
          </Float>
          {loadingDoctors ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {[1, 2, 3].map((i) => (
              <Float key={i} variant="fadeInUp" delay={i * 0.05}>
                  <Card className="border-none shadow-sm">
                  <CardBody className="p-6 sm:p-8 lg:p-10 text-center">
                      <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 mx-auto mb-6 rounded-full" />
                      <Skeleton className="h-6 sm:h-7 lg:h-8 w-40 mx-auto mb-3" />
                      <Skeleton className="h-5 w-32 mx-auto mb-4" />
                      <Skeleton className="h-5 w-24 mx-auto mb-6" />
                      <Skeleton className="h-11 w-full rounded-lg" />
                  </CardBody>
                </Card>
              </Float>
            ))}
          </div>
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {doctors.map((d, i) => {
                const doctorSlug = d.id?.toString() || "";
                const specialtyLabel = SPECIALTY_MAP[d.specialty] || d.specialty || "Đa khoa";
                const rating = doctorRatings[d.id] || d.rating || 0;
                const doctorName = d.name?.replace(/^BS\.?\s*/i, "").trim() || d.name || "Bác sĩ";
                
                return (
                  <Float key={d.id || i} variant="fadeInUp" delay={i * 0.05}>
                    <Card 
                      className="border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] bg-white h-full flex flex-col"
                      isPressable
                      onPress={() => router.push(`/tim-kiem-bac-si/${doctorSlug}`)}
                    >
                      <CardBody className="p-6 sm:p-8 flex flex-col flex-1">
                        {/* Top Section: Avatar + Name + Specialty */}
                        <div className="flex items-start gap-4 mb-6">
                          {/* Avatar - Left side */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-blue-100">
                            <Avatar
                              src={d.avatar}
                              alt={doctorName}
                              className="w-full h-full object-cover"
                              imgProps={{
                                style: { objectFit: 'cover' }
                              }}
                              showFallback
                              fallback={
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                                  <Stethoscope className="text-blue-600" size={32} />
                                </div>
                              }
                            />
                          </div>
                          
                          {/* Name + Specialty - Right side */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-lg sm:text-xl text-gray-900 truncate">
                                {doctorName}
                              </h3>
                              <Chip 
                                size="sm" 
                                variant="flat" 
                                color="primary" 
                                className="text-xs font-semibold flex-shrink-0"
                              >
                                {specialtyLabel}
                              </Chip>
                            </div>
                            <p className="text-sm text-gray-600">
                              Tôi là {doctorName.split(' ').pop() || doctorName}
                            </p>
                          </div>
                        </div>
                        
                        {/* Metrics Grid - 2x2 */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {/* Rating */}
                          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                            <Star size={18} className="text-yellow-500 fill-current flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600">Đánh giá</p>
                              <p className="font-bold text-sm text-gray-900">
                                {rating > 0 ? rating.toFixed(1) : "—"}
                              </p>
                            </div>
                          </div>
                          
                          {/* Experience */}
                          <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-100">
                            <Award size={18} className="text-teal-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600">Kinh nghiệm</p>
                              <p className="font-bold text-sm text-gray-900">
                                {d.years > 0 ? `${d.years} năm` : "—"}
                              </p>
                            </div>
                          </div>
                          
                          {/* Education */}
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <GraduationCap size={18} className="text-blue-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600">Trình độ</p>
                              <p className="font-semibold text-xs text-gray-900 truncate">
                                {d.educationLevel || "—"}
                              </p>
                            </div>
                          </div>
                          
                          {/* Certificates */}
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                            <FileText size={18} className="text-green-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600">Chứng chỉ</p>
                              <p className="font-semibold text-xs text-gray-900 truncate">
                                {d.licenseNumber ? `#${d.licenseNumber}` : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Contact Information */}
                        {(d.phone || d.email) && (
                          <div className="space-y-2 mb-6 pb-4 border-b border-gray-200">
                            {d.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={16} className="text-gray-500 flex-shrink-0" />
                                <span className="truncate">{d.phone}</span>
                              </div>
                            )}
                            {d.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail size={16} className="text-gray-500 flex-shrink-0" />
                                <span className="truncate">{d.email}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Button - Bottom */}
                        <div className="mt-auto pt-2">
                          <Button 
                            size="md" 
                            color="primary" 
                            variant="flat" 
                            fullWidth 
                            className="font-semibold"
                            endContent={<ChevronRight size={18} />}
                            onPress={() => router.push(`/tim-kiem-bac-si/${doctorSlug}`)}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </Float>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Chưa có bác sĩ nào</p>
            </div>
          )}
          <Float variant="fadeInUp" delay={0.3}>
            <div className="text-center mt-6 sm:mt-8">
              <Link href="/tim-bac-si"
              className="px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center text-primary hover:bg-gray-100 text-sm sm:text-base md:text-lg"
              >
                Xem tất cả bác sĩ
              </Link>
            </div>
          </Float>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Float variant="fadeInUp">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Bệnh nhân nói gì về chúng tôi
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                {testimonials.length > 0 
                  ? `Hơn ${testimonials.length} bệnh nhân đã tin tưởng sử dụng dịch vụ`
                  : "Hơn 1,000 bệnh nhân đã tin tưởng sử dụng dịch vụ"}
              </p>
            </div>
          </Float>
          <div className="relative">
            {loadingTestimonials ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardBody className="p-4 sm:p-6">
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : testimonials.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {getVisibleTestimonials().map((t, i) => (
                    <Float key={`${currentTestimonialIndex}-${i}`} variant="fadeInLeft" delay={i * 0.1}>
                      <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
                        <CardBody className="p-4 sm:p-6">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={14}
                                className={idx < (t.rating || 5) ? "text-yellow-400 fill-current" : "text-gray-300"}
                              />
                            ))}
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4">"{t.quote}"</p>
                          <div className="flex items-center gap-3">
                            <Avatar src={t.avatar} size="sm" showFallback />
                            <div>
                              <p className="font-medium text-gray-900 text-sm sm:text-base">{t.name}</p>
                              <p className="text-xs text-gray-500">{t.role}</p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Float>
                  ))}
                </div>
                
                {/* Carousel Indicators */}
                {testimonials.length > 3 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: Math.ceil(testimonials.length / 3) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentTestimonialIndex(i * 3)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          Math.floor(currentTestimonialIndex / 3) === i
                            ? 'bg-primary scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to testimonial set ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Chưa có đánh giá nào</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-4 sm:px-6 md:px-10 lg:px-16 py-16 sm:py-20">
        {/* pastel gradient backdrop + blurred shapes (matches hero) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#f1e1ff] via-[#ffe6ea] to-[#e6f0ff] opacity-60" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/60 blur-2xl" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />

        <Float variant="fadeInUp">
          <div className="relative max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white/70 backdrop-blur-lg shadow-lg border border-white/30 overflow-hidden">
              <div className="p-6 sm:p-8 md:p-10">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                    Sẵn sàng chăm sóc sức khỏe tốt hơn?
                  </h2>
                  <p className="mt-3 text-gray-700 text-sm sm:text-base md:text-lg max-w-xl">
                    Đặt lịch nhanh, tư vấn chuyên môn và nhận chăm sóc liên tục từ đội ngũ bác sĩ của chúng tôi.
                  </p>
                  <p className="mt-4 text-xs sm:text-sm text-gray-500">
                    Không phí ẩn — Hỗ trợ mọi lúc, mọi nơi.
                  </p>
                   <Link href="/dang-ky" 
                   className="mt-4 sm:mt-6 inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center text-white bg-primary hover:bg-primary/90 text-sm sm:text-base md:text-lg">
                    Đăng ký ngay
                   </Link>
                </div>
              </div>
            </div>
          </div>
        </Float>
      </section>
    </Default>
    </>
  );
}