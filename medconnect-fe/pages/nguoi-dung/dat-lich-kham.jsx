import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card, CardBody, CardHeader, Button, Avatar, Chip, Input, Select, SelectItem, Divider, RadioGroup, Radio, Textarea
} from "@heroui/react";
import { Calendar, Clock, User, Stethoscope, Video, MapPin, ChevronRight, Check, AlertCircle, Filter, Star, Award, Users as UsersIcon } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

const SLOT_TIMES = {
  SLOT_1: "07:30 - 08:00",
  SLOT_2: "08:15 - 08:45",
  SLOT_3: "09:00 - 09:30",
  SLOT_4: "09:45 - 10:15",
  SLOT_5: "10:30 - 11:00",
  SLOT_6: "11:15 - 11:45",
  SLOT_7: "13:00 - 13:30",
  SLOT_8: "13:45 - 14:15",
  SLOT_9: "14:30 - 15:00",
  SLOT_10: "15:15 - 15:45",
  SLOT_11: "16:00 - 16:30",
  SLOT_12: "16:45 - 17:15"
};

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
  GENERAL: "Đa khoa"
};

export default function DatLichKham() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  // Booking flow steps
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [previewDoctor, setPreviewDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [appointmentType, setAppointmentType] = useState("ONLINE");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Filter doctors
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Filters
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState({ code: "", name: "" });
  const [districtFilter, setDistrictFilter] = useState({ code: "", name: "" });
  const [wardFilter, setWardFilter] = useState({ code: "", name: "" });

  // Weekly calendar state
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay(); // 0..6 (Sun..Sat)
    const diff = (day === 0 ? -6 : 1) - day; // start Monday
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0,0,0,0);
    return monday;
  });
  const [weeklyAvailable, setWeeklyAvailable] = useState({}); // { 'YYYY-MM-DD': [slotIds] }

  // Fetch doctors from backend
  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt lịch khám");
      router.push("/dang-nhap");
    }
  }, [user, authLoading]);

  // Filter doctors based on search query
  useEffect(() => {
    let filtered = doctors;
    // Text search
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (SPECIALTY_MAP[doc.specialty] || doc.specialty).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Speciality filter
    if (specialityFilter) {
      filtered = filtered.filter(doc => (doc.specialty || "").toString() === specialityFilter);
    }
    // Address filters (match by name if available)
    if (provinceFilter.name) {
      filtered = filtered.filter(doc => (doc.province_name || doc.provinceName || "").includes(provinceFilter.name));
    }
    if (districtFilter.name) {
      filtered = filtered.filter(doc => (doc.district_name || doc.districtName || "").includes(districtFilter.name));
    }
    if (wardFilter.name) {
      filtered = filtered.filter(doc => (doc.ward_name || doc.wardName || "").includes(wardFilter.name));
    }
      setFilteredDoctors(filtered);
  }, [searchQuery, doctors, specialityFilter, provinceFilter, districtFilter, wardFilter]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response = await fetch("http://localhost:8080/doctor/dashboard/all");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched doctors:", data.length, "doctors");
        setDoctors(data);
        setFilteredDoctors(data);
    } else {
        console.error("Failed to fetch doctors:", response.status, response.statusText);
        toast.error("Không thể tải danh sách bác sĩ");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  // Fetch weekly availability when doctor or week changes
  useEffect(() => {
    const loadWeek = async () => {
      if (!selectedDoctor) return;
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d.toISOString().split('T')[0];
      });
      const results = {};
      try {
        const promises = dates.map(async (dateStr) => {
          const resp = await fetch(`http://localhost:8080/api/appointments/doctor/${selectedDoctor.id}/available-slots?date=${dateStr}`);
          if (resp.ok) {
            const data = await resp.json();
            results[dateStr] = data.availableSlots || [];
          } else {
            results[dateStr] = [];
          }
        });
        await Promise.all(promises);
        setWeeklyAvailable(results);
      } catch (e) {
        setWeeklyAvailable({});
      }
    };
    loadWeek();
  }, [selectedDoctor, weekStart]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/appointments/doctor/${selectedDoctor.id}/available-slots?date=${selectedDate}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(`Available slots for ${selectedDate}:`, data.availableSlots);
        setAvailableSlots(data.availableSlots || []);
      } else {
        toast.error("Không thể tải lịch trống");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Lỗi kết nối server");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handlePreviewDoctor = (doctor) => {
    setPreviewDoctor(doctor);
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(2);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(""); // Reset slot when date changes
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      toast.error("Vui lòng chọn khung giờ");
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: selectedDate,
          slot: selectedSlot,
          type: appointmentType,
          reason: reason || null
        })
      });

      if (response.ok) {
        const appointment = await response.json();
        toast.success("Đặt lịch thành công! Chuyển đến trang thanh toán...");
        setTimeout(() => {
          router.push(`/thanh-toan/${appointment.appointmentId}`);
        }, 1500);
      } else {
        const error = await response.json();
        toast.error(error.error || "Đặt lịch thất bại");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const leftChildren = (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Calendar className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Quy trình đặt lịch</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-teal-100' : 'bg-gray-100'}`}>
              {currentStep > 1 ? <Check size={18} /> : <span className="text-sm font-semibold">1</span>}
            </div>
            <span className="font-medium">Chọn bác sĩ</span>
          </div>
          <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-teal-100' : 'bg-gray-100'}`}>
              {currentStep > 2 ? <Check size={18} /> : <span className="text-sm font-semibold">2</span>}
            </div>
            <span className="font-medium">Chọn ngày & giờ</span>
          </div>
          <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-teal-100' : 'bg-gray-100'}`}>
              <span className="text-sm font-semibold">3</span>
            </div>
            <span className="font-medium">Xác nhận</span>
          </div>
        </CardBody>
      </Card>

      {/* Selected Doctor Info */}
      {selectedDoctor && (
        <Card className="border-2 border-teal-500">
          <CardHeader className="flex gap-3">
            <User className="text-teal-600" size={24} />
            <h3 className="text-lg font-semibold">Bác sĩ đã chọn</h3>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar 
                src={selectedDoctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=0D9488&color=fff`} 
                size="lg" 
              />
              <div>
                <p className="font-semibold">{selectedDoctor.name}</p>
                <p className="text-sm text-gray-600">{SPECIALTY_MAP[selectedDoctor.specialty] || selectedDoctor.specialty}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="light"
              color="primary"
              onClick={() => {
                setSelectedDoctor(null);
                setCurrentStep(1);
              }}
            >
              Chọn bác sĩ khác
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Booking Summary */}
      {currentStep >= 2 && (
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardHeader>
            <h3 className="text-lg font-semibold">Tóm tắt lịch hẹn</h3>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-3 text-sm">
            {selectedDate && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-teal-600" />
                <span>Ngày: <strong>{new Date(selectedDate).toLocaleDateString("vi-VN")}</strong></span>
              </div>
            )}
            {selectedSlot && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-teal-600" />
                <span>Giờ: <strong>{SLOT_TIMES[selectedSlot]}</strong></span>
              </div>
            )}
            {appointmentType && (
              <div className="flex items-center gap-2">
                {appointmentType === "ONLINE" ? <Video size={16} className="text-teal-600" /> : <MapPin size={16} className="text-teal-600" />}
                <span>Hình thức: <strong>{appointmentType === "ONLINE" ? "Khám online" : "Khám tại phòng khám"}</strong></span>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      {/* Step 1: Select Doctor */}
      {currentStep === 1 && (
        <Card>
          <CardHeader className="flex gap-3">
            <Stethoscope className="text-teal-600" size={24} />
            <h3 className="text-lg font-semibold">Chọn bác sĩ</h3>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-5">
            {previewDoctor && (
              <Card shadow="sm" className="border rounded-2xl overflow-hidden">
                <CardBody className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                    <Avatar
                      src={previewDoctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(previewDoctor.name)}&background=0D9488&color=fff`}
                      className="w-24 h-24"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl font-bold leading-tight truncate">{previewDoctor.name}</h3>
                        <Chip variant="flat" color="primary" size="md">{SPECIALTY_MAP[previewDoctor.specialty] || previewDoctor.specialty}</Chip>
                      </div>
                      <p className="text-gray-600 mt-2">
                        {previewDoctor.bio || "Bác sĩ giàu kinh nghiệm, tận tâm với bệnh nhân."}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-2xl font-semibold">{previewDoctor.rating || "4.8"}</p>
                          <p className="text-xs text-gray-500">Đánh giá</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-2xl font-semibold">{previewDoctor.experience_years || previewDoctor.experienceYears || "10"}</p>
                          <p className="text-xs text-gray-500">Năm KN</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-2xl font-semibold">{previewDoctor.patients_served || previewDoctor.patientsServed || "500+"}</p>
                          <p className="text-xs text-gray-500">Bệnh nhân</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-2xl font-semibold">24/7</p>
                          <p className="text-xs text-gray-500">Hỗ trợ</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-gray-500">Điện thoại</p>
                          <p className="font-medium">{previewDoctor.phone || "+84 000 000 000"}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium">{previewDoctor.email || "doctor@medconnect.vn"}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-gray-500">Địa chỉ</p>
                          <p className="font-medium truncate">{previewDoctor.clinic_address || previewDoctor.clinicAddress || previewDoctor.province_name || "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-5">
                        <Button variant="light" onPress={() => setPreviewDoctor(null)}>Đóng</Button>
                        <Button color="primary" onPress={() => handleSelectDoctor(previewDoctor)}>Xem lịch & đặt</Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50/60 p-3 rounded-xl border">
            <Input
              placeholder="Tìm bác sĩ theo tên hoặc chuyên khoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<User size={18} className="text-gray-400" />}
            />
              <Select
                label="Chuyên khoa"
                placeholder="Tất cả"
                selectedKeys={specialityFilter ? [specialityFilter] : []}
                onSelectionChange={(keys) => {
                  const k = Array.from(keys)[0];
                  setSpecialityFilter(k || "");
                }}
              >
                {Object.entries(SPECIALTY_MAP).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </Select>
              <Input
                label="Tỉnh/Thành"
                placeholder="Nhập tên tỉnh"
                value={provinceFilter.name}
                onChange={(e) => setProvinceFilter({ code: "", name: e.target.value })}
              />
              <Input
                label="Quận/Huyện"
                placeholder="Nhập tên quận"
                value={districtFilter.name}
                onChange={(e) => setDistrictFilter({ code: "", name: e.target.value })}
              />
              <Input
                label="Phường/Xã"
                placeholder="Nhập tên phường"
                value={wardFilter.name}
                onChange={(e) => setWardFilter({ code: "", name: e.target.value })}
              />
            </div>

            {loadingDoctors ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-4">Đang tải danh sách bác sĩ...</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <AlertCircle className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-600 font-medium">Không tìm thấy bác sĩ</p>
                <p className="text-sm text-gray-500">Thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[620px] overflow-y-auto pr-1">
              {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} shadow="sm" className="border hover:shadow-lg hover:border-teal-500 transition-all cursor-pointer rounded-xl" isPressable onPress={() => handlePreviewDoctor(doctor)}>
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                        <Avatar 
                          src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0D9488&color=fff`} 
                          size="lg" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{doctor.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Chip size="sm" variant="flat" color="primary">{SPECIALTY_MAP[doctor.specialty] || doctor.specialty}</Chip>
                            {doctor.province_name && (
                              <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={14} />{doctor.province_name}</span>
                            )}
                          </div>
                          {doctor.licenseId && (
                            <p className="text-xs text-gray-500 mt-1">CCHN: {doctor.licenseId}</p>
                          )}
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Step 2: Select Date & Time */}
      {currentStep === 2 && (
        <Card>
          <CardHeader className="flex gap-3">
            <Calendar className="text-teal-600" size={24} />
            <h3 className="text-lg font-semibold">Chọn ngày & giờ khám</h3>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {/* Weekly Calendar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" onPress={() => {
                    const prev = new Date(weekStart);
                    prev.setDate(prev.getDate() - 7);
                    setWeekStart(prev);
                  }}>
                    Tuần trước
                  </Button>
                  <Button size="sm" variant="flat" onPress={() => {
                    const now = new Date();
                    const day = now.getDay();
                    const diff = (day === 0 ? -6 : 1) - day;
                    const monday = new Date(now);
                    monday.setDate(now.getDate() + diff);
                    monday.setHours(0,0,0,0);
                    setWeekStart(monday);
                  }}>
                    Tuần hiện tại
                  </Button>
                  <Button size="sm" variant="flat" onPress={() => {
                    const next = new Date(weekStart);
                    next.setDate(next.getDate() + 7);
                    setWeekStart(next);
                  }}>
                    Tuần sau
                  </Button>
                </div>
            </div>

              <div className="overflow-auto border rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left w-32">Khung giờ</th>
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(weekStart);
                        d.setDate(weekStart.getDate() + i);
                        const label = d.toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit' });
                        const key = d.toISOString().split('T')[0];
                        return (<th key={key} className="p-2 text-left">{label}</th>);
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(SLOT_TIMES).map((slotKey) => (
                      <tr key={slotKey} className="border-t">
                        <td className="p-2 font-medium text-gray-700">{SLOT_TIMES[slotKey]}</td>
                        {Array.from({ length: 7 }, (_, i) => {
                          const d = new Date(weekStart);
                          d.setDate(weekStart.getDate() + i);
                          const dateStr = d.toISOString().split('T')[0];
                          const available = (weeklyAvailable[dateStr] || []).includes(slotKey);
                          const isPast = d < new Date();
                          const selectable = available && !isPast;
                          const isSelected = selectedDate === dateStr && selectedSlot === slotKey;
                          return (
                            <td key={dateStr+slotKey} className={`p-1`}>
                              <button
                                onClick={() => {
                                  if (!selectable) return;
                                  handleDateChange(dateStr);
                                  setSelectedSlot(slotKey);
                                }}
                                className={`w-full h-9 rounded-lg border transition-all 
                                  ${isSelected ? 'bg-teal-600 text-white border-teal-600' : ''}
                                  ${!isSelected && selectable ? 'hover:border-teal-400 hover:bg-teal-50 border-gray-200' : ''}
                                  ${!selectable ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : ''}
                                `}
                                disabled={!selectable}
                              >
                                {selectable ? 'Đặt' : '—'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-teal-600"></span>Đã chọn</div>
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-teal-50 border border-teal-300"></span>Có thể đặt</div>
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-gray-100 border"></span>Không khả dụng</div>
              </div>
            </div>

            {/* Slot Selection note */}
            {selectedDate && selectedSlot && (
              <div className="text-xs text-gray-500">Đã chọn: {new Date(selectedDate).toLocaleDateString('vi-VN')} - {SLOT_TIMES[selectedSlot]}</div>
            )}

            {/* Appointment Type */}
            {selectedSlot && (
              <div>
                <label className="block text-sm font-medium mb-2">Hình thức khám</label>
                <RadioGroup value={appointmentType} onValueChange={setAppointmentType}>
                  <Radio value="ONLINE">
                    <div className="flex items-center gap-2">
                      <Video size={18} />
                      <div>
                        <p className="font-medium">Khám online</p>
                        <p className="text-xs text-gray-500">Gặp bác sĩ qua video call</p>
                      </div>
                    </div>
                  </Radio>
                  <Radio value="OFFLINE">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <div>
                        <p className="font-medium">Khám tại phòng khám</p>
                        <p className="text-xs text-gray-500">Đến trực tiếp phòng khám</p>
                      </div>
                    </div>
                  </Radio>
                </RadioGroup>
              </div>
            )}

            {/* Reason (Optional) */}
            {selectedSlot && (
              <div>
                <label className="block text-sm font-medium mb-2">Lý do khám (tùy chọn)</label>
                <Textarea
                  placeholder="Mô tả triệu chứng hoặc lý do bạn muốn khám..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minRows={3}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="bordered"
                onClick={() => setCurrentStep(1)}
                fullWidth
              >
                Quay lại
              </Button>
              <Button
                color="primary"
                onClick={() => selectedSlot && setCurrentStep(3)}
                isDisabled={!selectedSlot}
                fullWidth
              >
                Tiếp tục
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {currentStep === 3 && (
        <Card>
          <CardHeader className="flex gap-3">
            <Check className="text-teal-600" size={24} />
            <h3 className="text-lg font-semibold">Xác nhận lịch hẹn</h3>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar 
                  src={selectedDoctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=0D9488&color=fff`} 
                  size="lg" 
                />
                <div>
                  <p className="font-semibold">{selectedDoctor.name}</p>
                  <p className="text-sm text-gray-600">{SPECIALTY_MAP[selectedDoctor.specialty] || selectedDoctor.specialty}</p>
                </div>
              </div>
              <Divider />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày khám:</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giờ khám:</span>
                  <span className="font-medium">{SLOT_TIMES[selectedSlot]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hình thức:</span>
                  <span className="font-medium">{appointmentType === "ONLINE" ? "Khám online" : "Khám tại phòng khám"}</span>
                </div>
                {reason && (
                  <>
                    <Divider />
                    <div>
                      <span className="text-gray-600">Lý do khám:</span>
                      <p className="mt-1">{reason}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>Lưu ý:</strong> Lịch hẹn sẽ ở trạng thái "Chờ xác nhận" và cần được bác sĩ phê duyệt.
                Bạn sẽ nhận được thông báo khi lịch hẹn được xác nhận.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="bordered"
                onClick={() => setCurrentStep(2)}
                fullWidth
              >
                Quay lại
              </Button>
              <Button
                color="primary"
                onClick={handleConfirmBooking}
                isLoading={loading}
                fullWidth
              >
                Xác nhận đặt lịch
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PatientFrame>
    );
  }

  return (
    <PatientFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />
    </PatientFrame>
  );
}

