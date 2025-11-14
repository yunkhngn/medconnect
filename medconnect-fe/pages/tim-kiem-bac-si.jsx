import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Default } from "@/components/layouts";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Chip,
  Input,
  Select,
  SelectItem,
  Pagination,
} from "@heroui/react";
import {
  Search,
  Star,
  Award,
  MapPin,
  User,
  Phone,
  Filter,
  ChevronRight,
  Loader2,
  Mail,
  GraduationCap,
  FileText,
  Clock,
  Users,
} from "lucide-react";
import { useAddressData } from "@/hooks/useAddressData";
import Float from "@/components/ui/Float";
import Image from "next/image";

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

export default function TimKiemBacSi() {
  const router = useRouter();
  const { provinces, getProvinceName } = useAddressData();

  // State
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 12;
  const [doctorRatings, setDoctorRatings] = useState({}); // { doctorId: averageRating }

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState(""); // "high", "low", ""

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/doctor/dashboard/all`);
      if (response.ok) {
        const data = await response.json();
        const doctorsList = Array.isArray(data) ? data : [];
        setDoctors(doctorsList);
        
        // Fetch ratings for all doctors
        const ratingsMap = {};
        await Promise.all(
          doctorsList.map(async (doctor) => {
            try {
              const ratingResponse = await fetch(
                `${API_BASE_URL}/api/feedback/doctor/${doctor.id}/summary`
              );
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                if (ratingData.success && ratingData.data?.averageRating) {
                  ratingsMap[doctor.id] = ratingData.data.averageRating;
                }
              }
            } catch (err) {
              // Ignore errors for individual ratings
            }
          })
        );
        setDoctorRatings(ratingsMap);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort doctors
  useEffect(() => {
    let filtered = [...doctors];

    // Search by name
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (SPECIALTY_MAP[doc.specialty] || doc.specialty || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specialty
    if (specialityFilter) {
      filtered = filtered.filter((doc) => {
        const key = (doc.specialty || doc.speciality_key || "")
          .toString()
          .toUpperCase();
        const name = (
          doc.speciality_name ||
          doc.specialityName ||
          doc.specialty ||
          ""
        ).toLowerCase();
        const specLabel = (SPECIALTY_MAP[specialityFilter] || "").toLowerCase();
        return (
          key === specialityFilter ||
          (specLabel && name.includes(specLabel))
        );
      });
    }

    // Filter by province
    if (provinceFilter) {
      const provinceName = getProvinceName(provinceFilter);
      filtered = filtered.filter((doc) => {
        const code = Number(doc.province_code ?? doc.provinceCode ?? NaN);
        const name = (doc.province_name || doc.provinceName || "").toLowerCase();
        return (
          (!Number.isNaN(code) && code === Number(provinceFilter)) ||
          (provinceName && name.includes(provinceName.toLowerCase()))
        );
      });
    }

    // Sort by rating
    if (ratingFilter === "high") {
      filtered.sort((a, b) => {
        const ratingA = doctorRatings[a.id] || a.rating || 0;
        const ratingB = doctorRatings[b.id] || b.rating || 0;
        return ratingB - ratingA;
      });
    } else if (ratingFilter === "low") {
      filtered.sort((a, b) => {
        const ratingA = doctorRatings[a.id] || a.rating || 0;
        const ratingB = doctorRatings[b.id] || b.rating || 0;
        return ratingA - ratingB;
      });
    }

    setFilteredDoctors(filtered);
    setPage(1); // Reset to first page when filters change
  }, [searchQuery, specialityFilter, provinceFilter, ratingFilter, doctors, doctorRatings, getProvinceName]);

  // Pagination
  const paginatedDoctors = filteredDoctors.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);

  // Generate slug - simple: just use doctor ID
  const generateSlug = (doctor) => {
    return doctor.id.toString();
  };

  const handleDoctorClick = (doctor) => {
    const slug = generateSlug(doctor);
    router.push(`/tim-kiem-bac-si/${slug}`);
  };

  if (loading) {
    return (
      <Default title="Tìm kiếm bác sĩ - MedConnect">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải danh sách bác sĩ...</p>
          </div>
        </div>
      </Default>
    );
  }

  return (
    <Default title="Tìm kiếm bác sĩ - MedConnect">
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
            {/* Header */}
            <Float variant="fadeInUp" delay={0.1}>
              <div className="text-center mb-12">
                <Chip color="primary" variant="flat" className="mb-4 bg-white/90 backdrop-blur-sm">
                  Tìm kiếm bác sĩ phù hợp với bạn
                </Chip>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Tìm kiếm Bác sĩ
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Tìm kiếm và xem thông tin chi tiết về các bác sĩ trong hệ thống
                </p>
              </div>
            </Float>
            {/* Filters */}
            <Float variant="fadeInUp" delay={0.2}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardBody className="p-6 md:p-8">
            <div className="space-y-4">
              {/* Search */}
              <Input
                placeholder="Tìm kiếm theo tên bác sĩ hoặc chuyên khoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="lg"
                variant="bordered"
                startContent={<Search className="text-default-400" size={20} />}
                classNames={{
                  inputWrapper: "focus-within:border-primary focus-within:ring-0",
                }}
              />

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Chuyên khoa"
                  placeholder="Tất cả chuyên khoa"
                  selectedKeys={specialityFilter ? [specialityFilter] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setSpecialityFilter(value || "");
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "focus-within:border-primary focus-within:ring-0",
                  }}
                >
                  <SelectItem key="" value="">
                    Tất cả chuyên khoa
                  </SelectItem>
                  {Object.entries(SPECIALTY_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Tỉnh/Thành phố"
                  placeholder="Tất cả tỉnh/thành"
                  selectedKeys={provinceFilter ? [provinceFilter] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setProvinceFilter(value || "");
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "focus-within:border-primary focus-within:ring-0",
                  }}
                >
                  <SelectItem key="" value="">
                    Tất cả tỉnh/thành
                  </SelectItem>
                  {provinces.map((p) => (
                    <SelectItem key={String(p.code)} value={String(p.code)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Sắp xếp theo đánh giá"
                  placeholder="Mặc định"
                  selectedKeys={ratingFilter ? [ratingFilter] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setRatingFilter(value || "");
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "focus-within:border-primary focus-within:ring-0",
                  }}
                >
                  <SelectItem key="" value="">
                    Mặc định
                  </SelectItem>
                  <SelectItem key="high" value="high">
                    Đánh giá cao → thấp
                  </SelectItem>
                  <SelectItem key="low" value="low">
                    Đánh giá thấp → cao
                  </SelectItem>
                </Select>
              </div>

              {/* Quick specialty chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {Object.entries(SPECIALTY_MAP).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSpecialityFilter((prev) => (prev === key ? "" : key))
                    }
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      specialityFilter === key
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white hover:bg-teal-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
            </Float>

            {/* Results Count */}
            <Float variant="fadeInUp" delay={0.4}>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-700 font-medium">
                  Tìm thấy <span className="font-bold text-blue-600">{filteredDoctors.length}</span> bác sĩ
                </p>
              </div>
            </Float>

            {/* Doctor Cards Grid */}
            {filteredDoctors.length === 0 ? (
              <Float variant="fadeInUp" delay={0.5}>
                <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                  <CardBody className="text-center py-12">
                    <p className="text-gray-700 font-medium text-lg">Không tìm thấy bác sĩ</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </CardBody>
                </Card>
              </Float>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {paginatedDoctors.map((doctor, index) => (
                    <Float key={doctor.id} variant="fadeInUp" delay={0.5 + index * 0.05}>
                      <Card
                        isPressable
                        onPress={() => handleDoctorClick(doctor)}
                        className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.01]"
                      >
                        <CardBody className="p-6">
                          <div className="flex items-start gap-5">
                            <Avatar
                              src={
                                doctor.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  doctor.name || "BS"
                                )}&background=0D9488&color=fff`
                              }
                              className="w-24 h-24 ring-2 ring-blue-100 flex-shrink-0"
                              showFallback
                            />
                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <p className="font-bold text-xl text-gray-900 truncate">
                                      {doctor.name?.replace(/^BS\.?\s*/i, "").trim() || doctor.name}
                                    </p>
                                    <Chip size="sm" variant="flat" color="primary" className="text-xs font-semibold">
                                      {SPECIALTY_MAP[doctor.specialty] || doctor.specialty || "Đa khoa"}
                                    </Chip>
                                  </div>
                                  {doctor.displayAddress && (
                                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                                      <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                                      <span className="line-clamp-1">{doctor.displayAddress}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Bio */}
                              {doctor.bio && (
                                <p className="text-sm text-gray-700 line-clamp-2 mb-4 leading-relaxed">
                                  {doctor.bio}
                                </p>
                              )}

                              {/* Stats Row 1 */}
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                                  <Star size={16} className="text-yellow-500 fill-current flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-gray-600">Đánh giá</p>
                                    <p className="font-bold text-sm text-gray-900">
                                      {doctorRatings[doctor.id] 
                                        ? doctorRatings[doctor.id].toFixed(1) 
                                        : doctor.rating || "—"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-teal-50 rounded-lg border border-teal-100">
                                  <Award size={16} className="text-teal-600 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-gray-600">Kinh nghiệm</p>
                                    <p className="font-bold text-sm text-gray-900">
                                      {doctor.experience_years || doctor.experienceYears || "—"} năm
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Stats Row 2 */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                {doctor.education_level && (
                                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                                    <GraduationCap size={16} className="text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs text-gray-600">Trình độ</p>
                                      <p className="font-semibold text-xs text-gray-900 truncate">
                                        {doctor.education_level}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {doctor.licenseId && (
                                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                                    <FileText size={16} className="text-green-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs text-gray-600">Chứng chỉ</p>
                                      <p className="font-semibold text-xs text-gray-900 truncate">
                                        #{doctor.licenseId}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {!doctor.education_level && !doctor.licenseId && (
                                  <>
                                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                                      <Users size={16} className="text-purple-600 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-xs text-gray-600">Bệnh nhân</p>
                                        <p className="font-bold text-sm text-gray-900">
                                          {doctorRatings[doctor.id] ? "50+" : "—"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
                                      <Clock size={16} className="text-orange-600 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-xs text-gray-600">Thời gian</p>
                                        <p className="font-semibold text-xs text-gray-900">
                                          30-45 phút
                                        </p>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Contact Info */}
                              {(doctor.phone || doctor.email) && (
                                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200">
                                  {doctor.phone && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Phone size={12} className="text-gray-500" />
                                      <span className="truncate">{doctor.phone}</span>
                                    </div>
                                  )}
                                  {doctor.email && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Mail size={12} className="text-gray-500" />
                                      <span className="truncate max-w-[150px]">{doctor.email}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Action Button */}
                              <Button
                                size="md"
                                color="primary"
                                variant="flat"
                                className="w-full font-semibold"
                                endContent={<ChevronRight size={18} />}
                              >
                                Xem chi tiết
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Float>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Float variant="fadeInUp" delay={0.8}>
                    <div className="flex justify-center">
                      <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl">
                        <CardBody className="p-4">
                          <Pagination
                            total={totalPages}
                            page={page}
                            onChange={setPage}
                            showControls
                            color="primary"
                          />
                        </CardBody>
                      </Card>
                    </div>
                  </Float>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Default>
  );
}

