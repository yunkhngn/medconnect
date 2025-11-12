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
} from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { useAddressData } from "@/hooks/useAddressData";

const API_BASE_URL = "http://localhost:8080";

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
      const response = await fetch(`${API_BASE_URL}/doctor/dashboard/all`);
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
    if (doctor.displayAddress) return doctor.displayAddress;
    const parts = [
      doctor.clinicAddress,
      doctor.ward_name,
      doctor.district_name,
      doctor.province_name,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (loading) {
    return (
      <Default title="Đang tải - MedConnect">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Đang tải thông tin bác sĩ...</p>
        </div>
      </Default>
    );
  }

  if (!doctor) {
    return (
      <Default title="Không tìm thấy - MedConnect">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600 font-medium">Không tìm thấy bác sĩ</p>
              <Button
                className="mt-4"
                onPress={() => router.push("/tim-kiem-bac-si")}
              >
                Quay lại danh sách
              </Button>
            </CardBody>
          </Card>
        </div>
      </Default>
    );
  }

  const address = formatAddress(doctor);

  return (
    <Default title={`${doctor.name} - MedConnect`}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="light"
            className="text-white mb-4"
            startContent={<ArrowLeft size={20} />}
            onPress={() => router.push("/tim-kiem-bac-si")}
          >
            Quay lại
          </Button>
          <div className="flex items-center gap-6">
            <Avatar
              src={
                doctor.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  doctor.name || "BS"
                )}&background=fff&color=0D9488&size=128`
              }
              className="w-32 h-32 border-4 border-white"
              showFallback
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">{doctor.name?.replace(/^BS\.?\s*/i, "").trim() || doctor.name}</h1>
              <Chip
                variant="flat"
                className="bg-white/20 text-white mb-2"
                size="lg"
              >
                {SPECIALTY_MAP[doctor.specialty] || doctor.specialty || "Đa khoa"}
              </Chip>
              {address && (
                <p className="text-teal-100 flex items-center gap-2 mt-2">
                  <MapPin size={18} />
                  {address}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Giới thiệu</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                <p className="text-gray-700 whitespace-pre-line">
                  {doctor.bio ||
                    "Bác sĩ tận tâm, giàu kinh nghiệm và được người bệnh tin tưởng."}
                </p>
              </CardBody>
            </Card>

            {/* Map */}
            {address && mapApiKey && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
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
                  />
                </CardBody>
              </Card>
            )}

            {/* Feedback */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Đánh giá từ bệnh nhân</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                {loadingFeedback ? (
                  <p className="text-gray-500">Đang tải đánh giá...</p>
                ) : feedbackSummary ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="text-yellow-500 fill-current" size={32} />
                        <span className="text-4xl font-bold">
                          {feedbackSummary.averageRating?.toFixed(1) || "—"}
                        </span>
                        <span className="text-gray-600">/ 5.0</span>
                      </div>
                      <p className="text-gray-600">
                        Dựa trên {feedbackSummary.totalFeedbacks || 0} đánh giá
                      </p>
                    </div>

                    {/* Recent Feedbacks */}
                    {recentFeedbacks && recentFeedbacks.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Đánh giá gần đây</h3>
                        {recentFeedbacks.map((feedback, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
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
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Thông tin nhanh</h3>
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

            {/* Action Buttons */}
            <Card>
              <CardBody className="space-y-3">
                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  onPress={() => router.push("/dang-nhap")}
                >
                  Đăng nhập để đặt lịch
                </Button>
                <Button
                  variant="bordered"
                  size="lg"
                  className="w-full"
                  onPress={() => router.push("/tim-kiem-bac-si")}
                >
                  Xem bác sĩ khác
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </Default>
  );
}

