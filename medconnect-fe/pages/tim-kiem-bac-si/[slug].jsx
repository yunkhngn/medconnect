import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Default } from "@/components/layouts";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Star,
  Award,
  MapPin,
  User,
  Phone,
  Mail,
  GraduationCap,
  FileText,
  ArrowLeft,
  Navigation,
  Loader2,
} from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { useAddressData } from "@/hooks/useAddressData";
import Float from "@/components/ui/Float";
import Image from "next/image";

import { getBaseUrl } from "@/utils/api";

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

export default function DoctorDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { getProvinceName, getDistrictName, getWardName } = useAddressData();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [mapApiKey, setMapApiKey] = useState("");

  // Extract doctor ID from slug - simple: slug is just the ID
  useEffect(() => {
    if (slug) {
      // Slug is just the doctor ID
      const doctorId = slug.toString();
      if (doctorId && !isNaN(doctorId)) {
        fetchDoctorDetail(doctorId);
        fetchFeedback(doctorId);
      }
    }
  }, [slug]);

  // Get Geoapify API key
  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
      process.env.GEOAPIFY_API_KEY ||
      "";
    setMapApiKey(apiKey);
  }, []);

  const fetchDoctorDetail = async (doctorId) => {
    setLoading(true);
    try {
      const response = await fetch(`${getBaseUrl()}/doctor/dashboard/all`);
      if (response.ok) {
        const data = await response.json();
        const doctors = Array.isArray(data) ? data : [];
        const foundDoctor = doctors.find((d) => d.id.toString() === doctorId);
        if (foundDoctor) {
          setDoctor(foundDoctor);
        } else {
          // Try fetching from API endpoint if available
          try {
            const detailResponse = await fetch(
              `${API_BASE_URL}/api/doctors/${doctorId}`
            );
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              setDoctor(detailData);
            }
          } catch (e) {
            console.error("Error fetching doctor detail:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (doctorId) => {
    setLoadingFeedback(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/doctor/${doctorId}/summary`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFeedbackSummary(data.data);
          setRecentFeedbacks(data.data.recentFeedbacks || []);
        }
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const formatAddress = (doctor) => {
    if (!doctor) return "";
    let address = "";
    if (doctor.displayAddress) {
      address = doctor.displayAddress;
    } else {
    const parts = [
      doctor.clinicAddress,
      doctor.ward_name,
      doctor.district_name,
      doctor.province_name,
    ].filter(Boolean);
      address = parts.join(", ");
    }
    // Thêm "Vietnam" vào cuối nếu chưa có để geocoding chính xác hơn
    if (address && !address.toLowerCase().includes("vietnam") && !address.toLowerCase().includes("việt nam")) {
      address = `${address}, Vietnam`;
    }
    console.log("[DoctorDetail] Formatted address:", address, "from doctor:", {
      displayAddress: doctor.displayAddress,
      clinicAddress: doctor.clinicAddress,
      ward: doctor.ward_name,
      district: doctor.district_name,
      province: doctor.province_name,
    });
    return address;
  };

  if (loading) {
    return (
      <Default title="Đang tải - MedConnect">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin bác sĩ...</p>
          </div>
        </div>
      </Default>
    );
  }

  if (!doctor) {
    return (
      <Default title="Không tìm thấy - MedConnect">
        <div className="min-h-screen relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/assets/homepage/cover.jpg"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl"></div>
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
            <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardBody className="text-center py-12">
                <p className="text-gray-700 font-medium text-lg mb-4">Không tìm thấy bác sĩ</p>
              <Button
                  color="primary"
                onPress={() => router.push("/tim-kiem-bac-si")}
              >
                Quay lại danh sách
              </Button>
            </CardBody>
          </Card>
          </div>
        </div>
      </Default>
    );
  }

  const address = formatAddress(doctor);

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
          <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-blue-500/5"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Float variant="fadeInUp" delay={0.1}>
          <Button
            variant="light"
                className="mb-6 bg-white/80 backdrop-blur-sm"
            startContent={<ArrowLeft size={20} />}
            onPress={() => router.push("/tim-kiem-bac-si")}
          >
            Quay lại
          </Button>
            </Float>

            {/* Header Card */}
            <Float variant="fadeInUp" delay={0.2}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar
              src={
                doctor.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  doctor.name || "BS"
                        )}&background=0D9488&color=fff&size=128`
              }
                      className="w-32 h-32 ring-4 ring-blue-100"
              showFallback
            />
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        {doctor.name?.replace(/^BS\.?\s*/i, "").trim() || doctor.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
              <Chip
                variant="flat"
                          color="primary"
                size="lg"
                          className="font-semibold"
              >
                {SPECIALTY_MAP[doctor.specialty] || doctor.specialty || "Đa khoa"}
              </Chip>
                        {feedbackSummary?.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-500 fill-current" size={20} />
                            <span className="font-semibold text-lg">
                              {feedbackSummary.averageRating.toFixed(1)}
                            </span>
                            <span className="text-gray-600 text-sm">/ 5.0</span>
                          </div>
                        )}
                      </div>
              {address && (
                        <p className="text-gray-700 flex items-center gap-2">
                          <MapPin size={18} className="text-blue-600" />
                          <span>{address}</span>
                </p>
              )}
            </div>
          </div>
                </CardBody>
              </Card>
            </Float>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
                <Float variant="fadeInUp" delay={0.3}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                      <h2 className="text-xl font-semibold text-gray-900">Giới thiệu</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {doctor.bio ||
                    "Bác sĩ tận tâm, giàu kinh nghiệm và được người bệnh tin tưởng."}
                </p>
              </CardBody>
            </Card>
                </Float>

            {/* Map */}
            {address && mapApiKey && (
                  <Float variant="fadeInUp" delay={0.4}>
                    <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader>
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                    <MapPin className="text-teal-600" size={24} />
                    Vị trí phòng khám
                  </h2>
                </CardHeader>
                <Divider />
                <CardBody>
                  <RouteMap
                    originAddress=""
                    destinationAddress={address}
                    apiKey={mapApiKey}
                          doctorData={doctor}
                  />
                </CardBody>
              </Card>
                  </Float>
            )}

            {/* Feedback */}
                <Float variant="fadeInUp" delay={0.5}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                      <h2 className="text-xl font-semibold text-gray-900">Đánh giá từ bệnh nhân</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                {loadingFeedback ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-500">Đang tải đánh giá...</p>
                        </div>
                ) : feedbackSummary ? (
                  <div className="space-y-6">
                    {/* Summary */}
                          <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="text-yellow-500 fill-current" size={32} />
                              <span className="text-4xl font-bold text-gray-900">
                          {feedbackSummary.averageRating?.toFixed(1) || "—"}
                        </span>
                              <span className="text-gray-600 text-xl">/ 5.0</span>
                      </div>
                            <p className="text-gray-700 font-medium">
                        Dựa trên {feedbackSummary.totalFeedbacks || 0} đánh giá
                      </p>
                    </div>

                    {/* Recent Feedbacks */}
                    {recentFeedbacks && recentFeedbacks.length > 0 ? (
                      <div className="space-y-4">
                              <h3 className="font-semibold text-gray-900">Đánh giá gần đây</h3>
                        {recentFeedbacks.map((feedback, idx) => (
                          <div
                            key={idx}
                                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-5 h-5 ${
                                      star <= (feedback.rating || 0)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {feedback.createdAt && (
                                <span className="text-xs text-gray-500">
                                  {new Date(feedback.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              )}
                            </div>
                            {feedback.comment && (
                              <p className="text-gray-700">{feedback.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Chưa có đánh giá nào
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có đánh giá nào
                  </p>
                )}
              </CardBody>
            </Card>
                </Float>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
                <Float variant="fadeInUp" delay={0.3}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Thông tin nhanh</h3>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                    <p className="font-semibold">
                      {feedbackSummary?.averageRating?.toFixed(1) || doctor.rating || "—"} / 5.0
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Award className="text-teal-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kinh nghiệm</p>
                    <p className="font-semibold">
                      {doctor.experience_years || doctor.experienceYears || "—"} năm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trình độ</p>
                    <p className="font-semibold">
                      {doctor.education_level || "—"}
                    </p>
                  </div>
                </div>

                {doctor.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Điện thoại</p>
                      <p className="font-semibold">{doctor.phone}</p>
                    </div>
                  </div>
                )}

                {doctor.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Mail className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-sm truncate">
                        {doctor.email}
                      </p>
                    </div>
                  </div>
                )}

                {doctor.licenseId && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số chứng chỉ</p>
                      <p className="font-semibold">#{doctor.licenseId}</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
                </Float>

            {/* Action Buttons */}
                <Float variant="fadeInUp" delay={0.4}>
                  <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardBody className="space-y-3">
                <Button
                  color="primary"
                  size="lg"
                        className="w-full font-semibold"
                  onPress={() => router.push("/dang-nhap")}
                >
                  Đăng nhập để đặt lịch
                </Button>
                <Button
                  variant="bordered"
                  size="lg"
                        className="w-full font-semibold"
                  onPress={() => router.push("/tim-kiem-bac-si")}
                >
                  Xem bác sĩ khác
                </Button>
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
}

