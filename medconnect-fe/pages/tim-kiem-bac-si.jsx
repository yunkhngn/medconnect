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
} from "lucide-react";
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

  return (
    <Default title="Tìm kiếm bác sĩ - MedConnect">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">Tìm kiếm bác sĩ</h1>
            <p className="text-teal-100">
              Tìm kiếm và xem thông tin chi tiết về các bác sĩ trong hệ thống
            </p>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardBody className="p-6">
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

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold">{filteredDoctors.length}</span> bác sĩ
          </p>
        </div>

        {/* Doctor Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600 font-medium">Không tìm thấy bác sĩ</p>
              <p className="text-sm text-gray-500 mt-2">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {paginatedDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  isPressable
                  onPress={() => handleDoctorClick(doctor)}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardBody className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={
                          doctor.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            doctor.name || "BS"
                          )}&background=0D9488&color=fff`
                        }
                        className="w-16 h-16"
                        showFallback
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <p className="font-semibold text-base truncate">
                            {doctor.name?.replace(/^BS\.?\s*/i, "").trim() || doctor.name}
                          </p>
                          <Chip size="sm" variant="flat" color="primary">
                            {SPECIALTY_MAP[doctor.specialty] || doctor.specialty || "Đa khoa"}
                          </Chip>
                        </div>
                        {doctor.displayAddress && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                            <MapPin size={12} />
                            <span className="truncate">{doctor.displayAddress}</span>
                          </p>
                        )}
                        {doctor.bio && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2 mb-3">
                            {doctor.bio}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-current" />
                            <span className="font-medium">
                              {doctorRatings[doctor.id] 
                                ? doctorRatings[doctor.id].toFixed(1) 
                                : doctor.rating || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award size={14} className="text-teal-600" />
                            <span>
                              {doctor.experience_years || doctor.experienceYears || "—"} năm
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          className="mt-4 w-full"
                          endContent={<ChevronRight size={16} />}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </Default>
  );
}

