import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card, CardBody, CardHeader, Button, Avatar, Chip, Input, Select, SelectItem, Divider, RadioGroup, Radio, Textarea
} from "@heroui/react";
import { Calendar, Clock, User, Stethoscope, Video, MapPin, ChevronRight, Check, AlertCircle, Filter, Star, Award, Users as UsersIcon, Phone, MessageSquare } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import RouteMap from "@/components/ui/RouteMap";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import { useAddressData } from "@/hooks/useAddressData";

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

// Map speciality key → default ID used in seed data (if BE returns numeric ids)
const SPECIALTY_KEY_TO_ID = {
  TIM_MACH: 1,
  NOI_KHOA: 2,
  NHI_KHOA: 3,
  DA_LIEU: 4,
  TAI_MUI_HONG: 5,
  MAT: 6,
  NGOAI_KHOA: 10, // example mapping; adjust if BE uses different ids
  SAN_PHU_KHOA: 9,
  THAN_KINH: 8,
  GENERAL: 0,
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
  const [doctorFeedbackSummary, setDoctorFeedbackSummary] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Filter doctors
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Filters
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [provinceCode, setProvinceCode] = useState(null);
  const [districtCode, setDistrictCode] = useState(null);
  const [wardCode, setWardCode] = useState(null);
  const { provinces, getProvinceName, getDistrictName, getWardName } = useAddressData();

  // Weekly calendar state
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay(); // 0..6 (Sun..Sat)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(d);
    monday.setDate(diff);
    monday.setHours(0,0,0,0);
    return monday;
  });
  const [weeklyAvailable, setWeeklyAvailable] = useState({}); // { 'YYYY-MM-DD': [slotIds] }
  const [consultationFee, setConsultationFee] = useState(0);

  // Calculate consultation fee based on selected doctor and appointment type
  const calculateFee = (doctor, type) => {
    if (!doctor) return 0;

    if (type === "ONLINE") {
      return doctor.onlinePrice || 200000; // Default online price
    } else {
      return doctor.offlinePrice || 300000; // Default offline price
    }
  };

  // Update fee when doctor or appointment type changes
  useEffect(() => {
    if (selectedDoctor) {
      const fee = calculateFee(selectedDoctor, appointmentType);
      setConsultationFee(fee);
    }
  }, [selectedDoctor, appointmentType]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  // Map (Geoapify) for preview doctor
  const [mapUrl, setMapUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [routeUrl, setRouteUrl] = useState("");
  const [originAddr, setOriginAddr] = useState("");
  const [destAddr, setDestAddr] = useState("");
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapError, setMapError] = useState(false);

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

  // Filter doctors based on search query and filters
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
      const specLabel = (SPECIALTY_MAP[specialityFilter] || "").toLowerCase();
      const specId = SPECIALTY_KEY_TO_ID[specialityFilter];
      filtered = filtered.filter(doc => {
        const key = (doc.specialty || doc.speciality || doc.speciality_key || "").toString().toUpperCase();
        const id = Number(doc.speciality_id ?? doc.specialityId ?? doc.specialtyId ?? NaN);
        const name = (doc.speciality_name || doc.specialityName || doc.specialtyName || doc.specialty || "").toLowerCase();
        return (
          (key && key === specialityFilter) ||
          (!Number.isNaN(id) && specId != null && id === Number(specId)) ||
          (specLabel && name.includes(specLabel))
        );
      });
    }
    // Address filters (prefer code if backend provides it)
    if (provinceCode) {
      const pName = getProvinceName(provinceCode);
      filtered = filtered.filter(doc => {
        const c = Number(doc.province_code ?? doc.provinceCode ?? NaN);
        return (!Number.isNaN(c) && c === Number(provinceCode)) || (doc.province_name || doc.provinceName || "").includes(pName);
      });
    }
    if (districtCode) {
      const dName = getDistrictName(districtCode);
      filtered = filtered.filter(doc => {
        const c = Number(doc.district_code ?? doc.districtCode ?? NaN);
        return (!Number.isNaN(c) && c === Number(districtCode)) || (doc.district_name || doc.districtName || "").includes(dName);
      });
    }
    if (wardCode) {
      const wName = getWardName(wardCode);
      filtered = filtered.filter(doc => {
        const c = Number(doc.ward_code ?? doc.wardCode ?? NaN);
        return (!Number.isNaN(c) && c === Number(wardCode)) || (doc.ward_name || doc.wardName || "").includes(wName);
      });
    }
      setFilteredDoctors(filtered);
  }, [searchQuery, doctors, specialityFilter, provinceCode, districtCode, wardCode, getProvinceName, getDistrictName, getWardName]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response = await fetch("http://localhost:8080/doctor/dashboard/all");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched doctors:", data.length, "doctors");
        const activeOnly = (data || []).filter((d) => {
          if (!d.status) return true; // backward compatibility
          return String(d.status).toUpperCase() === 'ACTIVE';
        });
        // Resolve address names by codes (fetch minimal data and cache)
        const cache = { districts: new Map(), wards: new Map() };
        async function getDistrictNameByCode(provinceCode, districtCode) {
          if (!districtCode) return '';
          const key = `${provinceCode}`;
          if (!cache.districts.has(key)) {
            try {
              const resp = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
              const j = await resp.json();
              cache.districts.set(key, j.districts || []);
            } catch {}
          }
          const list = cache.districts.get(key) || [];
          const found = list.find((d) => d.code === Number(districtCode));
          return found?.name || '';
        }
        async function getWardNameByCode(districtCode, wardCode) {
          if (!wardCode) return '';
          const key = `${districtCode}`;
          if (!cache.wards.has(key)) {
            try {
              const resp = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
              const j = await resp.json();
              cache.wards.set(key, j.wards || []);
            } catch {}
          }
          const list = cache.wards.get(key) || [];
          const found = list.find((w) => w.code === Number(wardCode));
          return found?.name || '';
        }
        const withAddress = await Promise.all(activeOnly.map(async (doc) => {
          const province = doc.province_name || '';
          const district = await getDistrictNameByCode(doc.province_code, doc.district_code);
          const ward = await getWardNameByCode(doc.district_code, doc.ward_code);
          const parts = [];
          if (doc.clinicAddress) parts.push(doc.clinicAddress);
          if (ward) parts.push(ward);
          if (district) parts.push(district);
          if (province) parts.push(province);
          return { ...doc, displayAddress: parts.join(', ') };
        }));
        setDoctors(withAddress);
        setFilteredDoctors(withAddress);
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
        // Use local date format to avoid timezone issues
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
        console.log('Weekly available slots:', results);
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

  const handlePreviewDoctor = async (doctor) => {
    setPreviewDoctor(doctor);
    // Fetch feedback summary for this doctor
    if (doctor && doctor.id) {
      setLoadingFeedback(true);
      try {
        const response = await fetch(`http://localhost:8080/api/feedback/doctor/${doctor.id}/summary`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setDoctorFeedbackSummary(data.data);
          } else {
            setDoctorFeedbackSummary(null);
          }
        } else {
          setDoctorFeedbackSummary(null);
        }
      } catch (error) {
        console.error('Error fetching feedback summary:', error);
        setDoctorFeedbackSummary(null);
      } finally {
        setLoadingFeedback(false);
      }
    }
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(2);
  };

  // Build static map for preview doctor using Geoapify
  useEffect(() => {
    // Only NEXT_PUBLIC_* is guaranteed on client, but accept fallback if user used GEOAPIFY_API_KEY
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || process.env.GEOAPIFY_API_KEY;
    console.log('[Geoapify] effect run', { hasKey: Boolean(apiKey), previewDoctor: Boolean(previewDoctor) });
    if (!previewDoctor || !apiKey) {
      if (!apiKey) console.warn('[Geoapify] Missing NEXT_PUBLIC_GEOAPIFY_API_KEY');
      setMapUrl("");
      setMapError(false);
      setEmbedUrl("");
      return;
    }
    const address = previewDoctor.displayAddress || previewDoctor.clinicAddress || previewDoctor.province_name || "";
    console.log('[Geoapify] using address', address);
    if (!address) {
      setMapUrl("");
      setMapError(false);
      return;
    }
    const controller = new AbortController();
    const fetchCoords = async () => {
      try {
        setLoadingMap(true);
        setMapError(false);
        const candidates = [
          address,
          [previewDoctor.clinicAddress, previewDoctor.province_name].filter(Boolean).join(", "),
          previewDoctor.province_name,
        ].filter(Boolean);

        let found = null;
        for (const addr of candidates) {
          const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addr)}&filter=countrycode:vn&limit=1&lang=vi&apiKey=${apiKey}`;
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) continue;
          const json = await res.json();
          console.debug('[Geoapify] Geocode response for', addr, json);
          const feature = json?.features?.[0];
          if (feature?.geometry?.coordinates) {
            found = feature.geometry.coordinates; // [lon, lat]
            break;
          }
        }
        if (found) {
          const [lon, lat] = found;
          const flon = Number(lon).toFixed(6);
          const flat = Number(lat).toFixed(6);
          // Use the simplest valid marker to avoid API 400s across plans
          const staticUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=1200&height=260&center=lonlat:${flon},${flat}&zoom=14&marker=lonlat:${flon},${flat}&apiKey=${apiKey}`;
          console.log('[Geoapify] static url', staticUrl);
          setMapUrl(staticUrl);
          // Prepare interactive OpenStreetMap embed (no key, fast, pannable)
          const d = 0.02; // ~2km bbox
          const minLon = (Number(flon) - d).toFixed(6);
          const minLat = (Number(flat) - d).toFixed(6);
          const maxLon = (Number(flon) + d).toFixed(6);
          const maxLat = (Number(flat) + d).toFixed(6);
          const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${flat}%2C${flon}`;
          setEmbedUrl(osm);
        } else {
          setMapError(true);
        }
      } catch (e) {
        setMapError(true);
      } finally {
        setLoadingMap(false);
      }
    };
    fetchCoords();
    return () => controller.abort();
  }, [previewDoctor]);

  // Build patient -> clinic route link (Google Maps) using patient profile
  useEffect(() => {
    const buildRoute = async () => {
      try {
        if (!previewDoctor || !user) { setRouteUrl(""); return; }
        const token = await user.getIdToken();
        const res = await fetch('http://localhost:8080/api/patient/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { setRouteUrl(""); return; }
        const profile = await res.json();
        const addrParts = [];
        const detail = profile.address_detail || profile.addressDetail || profile.address;
        if (detail) addrParts.push(detail);
        const wardName = profile.ward_name || (profile.ward_code ? getWardName(profile.ward_code) : "");
        const districtName = profile.district_name || (profile.district_code ? getDistrictName(profile.district_code) : "");
        const provinceName = profile.province_name || (profile.province_code ? getProvinceName(profile.province_code) : "");
        if (wardName) addrParts.push(wardName);
        if (districtName) addrParts.push(districtName);
        if (provinceName) addrParts.push(provinceName);
        const origin = addrParts.filter(Boolean).join(', ');
        const destination = previewDoctor.displayAddress || previewDoctor.clinicAddress || previewDoctor.province_name || '';
        setOriginAddr(origin);
        setDestAddr(destination);
        if (!origin || !destination) { setRouteUrl(""); return; }

        // Prefer coordinates to avoid ambiguous Google geocoding
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
        const geocode = async (text) => {
          try {
            const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&limit=1&apiKey=${apiKey}`;
            const r = await fetch(url);
            if (!r.ok) return null;
            const j = await r.json();
            const f = j?.features?.[0];
            if (f?.geometry?.coordinates) {
              const [lon, lat] = f.geometry.coordinates;
              return { lat, lon };
            }
          } catch {}
          return null;
        };

        if (apiKey) {
          const [from, to] = await Promise.all([geocode(origin), geocode(destination)]);
          if (from && to) {
            const gmaps = `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lon}&destination=${to.lat},${to.lon}&travelmode=driving`;
            setRouteUrl(gmaps);
            return;
          }
        }
        // Fallback to address strings
        setRouteUrl(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`);
      } catch { setRouteUrl(""); }
    };
    buildRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewDoctor, user]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(""); // Reset slot when date changes
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      toast.error("Vui lòng chọn khung giờ");
      return;
    }

    if (!reason || reason.trim() === "") {
      toast.error("Vui lòng nhập lý do khám");
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
          // Store reason as plain text
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
            {consultationFee > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Phí khám:</span>
                </div>
                <span className="text-lg font-bold text-green-600">{formatPrice(consultationFee)}</span>
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
            {/* Page Intro */}
            <div className="rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 p-4">
              <p className="text-sm text-teal-900">
                Lọc và xem hồ sơ bác sĩ, sau đó chọn lịch trống trong tuần. Chúng tôi gợi ý các bác sĩ nổi bật theo chuyên khoa và khu vực của bạn.
              </p>
            </div>
            
            {/* Filters */}
            <div className="space-y-4 bg-white/70 p-4 rounded-2xl shadow-sm">
              <div className="grid grid-cols-12 gap-3 items-stretch">
                {/* Row 1: Search full width */}
                <div className="col-span-12">
            <Input
                    variant="flat"
                    size="lg"
                    classNames={{
                      inputWrapper: "min-h-[64px] h-[64px] bg-gray-100 hover:bg-gray-200 data-[focus=true]:bg-gray-100 border-0 shadow-none",
                      input: "text-base",
                      base: "border-0",
                    }}
              placeholder="Tìm bác sĩ theo tên hoặc chuyên khoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<User size={18} className="text-gray-400" />}
            />
                </div>
                {/* Row 2: Specialty + Province */}
                <div className="col-span-12 md:col-span-6">
                  <Select
                    variant="flat"
                    size="lg"
                    label="Chuyên khoa"
                    placeholder="Tất cả"
                    selectedKeys={specialityFilter ? [specialityFilter] : []}
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys)[0];
                      setSpecialityFilter(k || "");
                    }}
                    classNames={{
                      trigger: "bg-gray-100 hover:bg-gray-200 data-[focus=true]:bg-gray-100 border-0 shadow-none",
                      base: "border-0",
                    }}
                  >
                    {Object.entries(SPECIALTY_MAP).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <Select
                    variant="flat"
                    size="lg"
                    label="Tỉnh/Thành phố"
                    placeholder="Chọn tỉnh/thành"
                    selectedKeys={provinceCode ? [String(provinceCode)] : []}
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys)[0];
                      const code = k ? parseInt(k) : null;
                      setProvinceCode(code);
                      setDistrictCode(null);
                      setWardCode(null);
                    }}
                    classNames={{
                      trigger: "bg-gray-100 hover:bg-gray-200 data-[focus=true]:bg-gray-100 border-0 shadow-none",
                      base: "border-0",
                    }}
                  >
                    {provinces.map((p) => (
                      <SelectItem key={String(p.code)} value={String(p.code)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Quick speciality chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(SPECIALTY_MAP).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSpecialityFilter(prev => prev === key ? "" : key)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      specialityFilter === key
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white hover:bg-teal-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loadingDoctors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({length: 6}).map((_,i)=> (
                  <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="h-10 bg-gray-100 rounded mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <AlertCircle className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-600 font-medium">Không tìm thấy bác sĩ</p>
                <p className="text-sm text-gray-500">Thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[640px] overflow-y-auto pr-1">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} shadow="none" className="rounded-2xl transition-colors bg-white/70 hover:bg-teal-50/40 cursor-pointer" isPressable onPress={() => handlePreviewDoctor(doctor)}>
                  <CardBody className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0D9488&color=fff`}
                        className="w-16 h-16"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-base truncate">{doctor.name}</p>
                          <Chip size="sm" variant="flat" color="primary">{SPECIALTY_MAP[doctor.specialty] || doctor.specialty}</Chip>
                          {doctor.displayAddress && (
                            <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={14} />{doctor.displayAddress}</span>
                          )}
                        </div>
                        {doctor.bio && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doctor.bio}</p>
                        )}
                        <div className="mt-3 text-xs text-gray-600 flex flex-wrap gap-x-6 gap-y-2">
                          <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /><span>Đánh giá</span><span className="font-medium ml-1">{doctor.rating || '4.8'}</span></div>
                          <div className="flex items-center gap-1"><Award size={14} className="text-teal-600" /><span>Năm KN</span><span className="font-medium ml-1">{doctor.experience_years || doctor.experienceYears || '—'}</span></div>
                          <br/>
                          <div className="flex items-center gap-1 min-w-[180px] truncate"><User size={14} className="text-cyan-600" /><span>Email</span><span className="font-medium ml-1 truncate">{doctor.email || '—'}</span></div>
                          <div className="flex items-center gap-1"><Phone size={14} className="text-green-600" /><span>Điện thoại</span><span className="font-medium ml-1">{doctor.phone || '—'}</span></div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          {doctor.licenseId && <span>CCHN #{doctor.licenseId}</span>}
                          {doctor.education_level && <><span className="w-1 h-1 bg-gray-300 rounded-full"></span><span>{doctor.education_level}</span></>}
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button size="sm" variant="light" onPress={() => handlePreviewDoctor(doctor)}>Xem hồ sơ</Button>
                          <Button size="sm" color="primary" variant="solid" onPress={() => handleSelectDoctor(doctor)}>Xem lịch & đặt</Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            )}
            
            {/* Preview Doctor Card - Moved Below List */}
            {previewDoctor && (
              <Card shadow="lg" className="rounded-2xl overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
                  <div className="flex items-center gap-5">
                    <Avatar
                      src={previewDoctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(previewDoctor.name)}&background=0D9488&color=fff`}
                      className="w-24 h-24 ring-4 ring-white/30"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-3xl font-extrabold leading-tight truncate">{previewDoctor.name}</h3>
                        <Chip variant="flat" color="primary" size="sm" className="bg-white/20 text-white">{SPECIALTY_MAP[previewDoctor.specialty] || previewDoctor.specialty}</Chip>
                      </div>
                      <p className="text-white/90 mt-2 text-sm">
                        {previewDoctor.bio || "Bác sĩ tận tâm, giàu kinh nghiệm và được người bệnh tin tưởng."}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <Button size="sm" variant="bordered" className="border-white/50 text-white" onPress={() => setPreviewDoctor(null)}>Đóng</Button>
                    </div>
                  </div>
                </div>
                <CardBody className="p-6 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="rounded-xl p-4 bg-white/80 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2 text-gray-700"><Star size={18} className="text-yellow-500" /><span className="text-sm">Đánh giá</span></div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {loadingFeedback ? "..." : (doctorFeedbackSummary?.averageRating?.toFixed(1) || previewDoctor.rating || "—")}
                        </p>
                        {doctorFeedbackSummary?.totalFeedbacks > 0 && (
                          <p className="text-xs text-gray-500">({doctorFeedbackSummary.totalFeedbacks} đánh giá)</p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl p-4 bg-white/80 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2 text-gray-700"><Award size={18} className="text-teal-600" /><span className="text-sm">Năm KN</span></div>
                      <p className="text-2xl font-bold">{previewDoctor.experience_years || previewDoctor.experienceYears || "—"}</p>
                    </div>
                    {doctorFeedbackSummary?.totalFeedbacks > 0 && (
                      <div className="rounded-xl p-4 bg-white/80 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 text-gray-700"><MessageSquare size={18} className="text-blue-500" /><span className="text-sm">Feedback</span></div>
                        <p className="text-2xl font-bold">{doctorFeedbackSummary.totalFeedbacks}</p>
                      </div>
                    )}
                  </div>

                  {/* Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">Điện thoại</p>
                      <p className="font-medium">{previewDoctor.phone || "+84 000 000 000"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium truncate">{previewDoctor.email || "doctor@medconnect.vn"}</p>
                    </div>
                  </div>

                  {/* Education & License */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">Trình độ</p>
                      <p className="font-medium">{previewDoctor.education_level || "—"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">Chứng chỉ hành nghề</p>
                      <p className="font-medium">{previewDoctor.licenseId ? `#${previewDoctor.licenseId}` : "—"}</p>
                    </div>
                  </div>

                  {/* Address + Map */}
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">Địa chỉ phòng khám</p>
                      <p className="font-medium">{previewDoctor.displayAddress || previewDoctor.clinicAddress || previewDoctor.province_name || "—"}</p>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-gray-100">
                      {originAddr && destAddr && process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ? (
                        <RouteMap
                          originAddress={originAddr}
                          destinationAddress={destAddr}
                          apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}
                        />
                      ) : (
                        <>
                          {loadingMap && <div className="h-80 animate-pulse bg-gray-200" />}
                          {!loadingMap && embedUrl && (
                            <iframe
                              src={embedUrl}
                              className="w-full h-96 border-0"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              allowFullScreen
                            />
                          )}
                          {!loadingMap && !embedUrl && mapUrl && (
                            <img src={mapUrl} alt="Vị trí phòng khám" className="w-full h-96 object-cover" onError={() => { setMapError(true); setMapUrl(""); }} />
                          )}
                          {!loadingMap && !embedUrl && !mapUrl && mapError && (
                            <div className="h-80 flex items-center justify-center text-sm text-gray-500">Không thể tải bản đồ cho địa chỉ này</div>
                          )}
                        </>
                      )}
                      {routeUrl && (
                        <div className="p-3 bg-white/70 border-t flex justify-end">
                          <Button as={"a"} href={routeUrl} target="_blank" rel="noopener" color="primary" size="sm">
                            Mở trên Google Maps
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback Reviews */}
                  <div className="mt-2">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare size={18} />
                      {loadingFeedback ? "Đang tải đánh giá..." : doctorFeedbackSummary?.recentFeedbacks?.length > 0 ? "3 đánh giá gần nhất" : "Chưa có đánh giá"}
                    </p>
                    {loadingFeedback ? (
                      <div className="text-center py-4 text-gray-500">Đang tải...</div>
                    ) : doctorFeedbackSummary?.recentFeedbacks?.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {doctorFeedbackSummary.recentFeedbacks.map((fb, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{fb.patientName || 'Bệnh nhân'}</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={`${
                                      star <= fb.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {fb.comment && (
                              <p className="mt-1 text-gray-700">"{fb.comment}"</p>
                            )}
                            {fb.createdAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-50 text-center text-gray-500 text-sm">
                        Chưa có đánh giá nào cho bác sĩ này
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Bigger at bottom */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                    <Button 
                      variant="flat" 
                      size="lg"
                      className="flex-1"
                      onPress={() => setPreviewDoctor(null)}
                    >
                      Đóng
                    </Button>
                    <Button 
                      color="primary" 
                      size="lg"
                      className="flex-1 font-semibold text-lg"
                      onPress={() => handleSelectDoctor(previewDoctor)}
                      endContent={<ChevronRight size={20} />}
                    >
                      Xem lịch & đặt
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </CardBody>
        </Card>
      )}

      {/* Step 2: Select Date & Time */}
      {currentStep === 2 && (
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="flex items-center gap-3 p-6">
            <div className="bg-teal-100 p-2 rounded-lg">
            <Calendar className="text-teal-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Chọn ngày & giờ khám</h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-6 space-y-6">
            {/* Weekly Calendar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl shadow-sm">
                  <Button 
                    size="sm" 
                    variant="light" 
                    className="data-[hover=true]:bg-white rounded-lg transition-colors" 
                    onPress={() => {
                      const prev = new Date(weekStart);
                      prev.setDate(prev.getDate() - 7);
                      setWeekStart(prev);
                    }}
                  >
                    ← Tuần trước
                  </Button>
                  <Button 
                    size="sm" 
                    variant="flat"
                    color="primary"
                    className="rounded-lg font-semibold" 
                    onPress={() => {
                      const now = new Date();
                      const day = now.getDay();
                      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                      const monday = new Date(now);
                      monday.setDate(diff);
                      monday.setHours(0,0,0,0);
                      setWeekStart(monday);
                    }}
                  >
                    Tuần hiện tại
                  </Button>
                  <Button 
                    size="sm" 
                    variant="light" 
                    className="data-[hover=true]:bg-white rounded-lg transition-colors" 
                    onPress={() => {
                      const next = new Date(weekStart);
                      next.setDate(next.getDate() + 7);
                      setWeekStart(next);
                    }}
                  >
                    Tuần sau →
                  </Button>
                </div>
              </div>

              {/* Table Schedule */}
              <div className="overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-md">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 shadow-sm">
                    <tr>
                      <th className="border-2 border-gray-300 p-4 text-left font-bold text-gray-800 min-w-[140px] bg-gray-100">
                        <div className="flex items-center gap-2">
                          <Clock size={18} className="text-teal-600" />
                          Khung giờ
                        </div>
                      </th>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date(weekStart);
                        d.setDate(weekStart.getDate() + i);
                        const isToday = d.toDateString() === new Date().toDateString();
                        const dayName = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"][d.getDay()];
                        
                        return (
                          <th 
                            key={i} 
                            className={`border-2 border-gray-300 p-3 text-center font-bold min-w-[120px] ${
                              isToday ? "bg-teal-100 border-teal-400" : "bg-gray-50"
                            }`}
                          >
                            <div className={`text-xs uppercase tracking-wide ${isToday ? "text-teal-700" : "text-gray-600"}`}>
                              {dayName}
                            </div>
                            <div className={`text-lg font-bold mt-1 ${isToday ? "text-teal-700" : "text-gray-800"}`}>
                              {d.getDate()}-{d.getMonth() + 1}
                            </div>
                            {isToday && (
                              <div className="text-xs text-teal-600 font-semibold mt-1">Hôm nay</div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {Object.entries(SLOT_TIMES).map(([slotKey, slotTime], slotIdx) => (
                      <tr key={slotKey} className="hover:bg-gray-50/50 transition-colors">
                        <td className="border-2 border-gray-300 p-4 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Ca {slotIdx + 1}</span>
                            <span className="text-sm">{slotTime}</span>
                          </div>
                        </td>
                        {Array.from({ length: 7 }, (_, i) => {
                          const d = new Date(weekStart);
                          d.setDate(weekStart.getDate() + i);
                          // Use local date format to avoid timezone issues
                          const year = d.getFullYear();
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const day = String(d.getDate()).padStart(2, '0');
                          const dateStr = `${year}-${month}-${day}`;
                          
                          const available = (weeklyAvailable[dateStr] || []).includes(slotKey);
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          const isPast = d < today;
                          const selectable = available && !isPast;
                          const isSelected = selectedDate === dateStr && selectedSlot === slotKey;
                          const isToday = d.toDateString() === new Date().toDateString();
                          
                          return (
                            <td
                              key={dateStr + slotKey}
                              className={`border-2 border-gray-300 p-2 text-center transition-all duration-200 ${
                                isPast ? "bg-gray-100 opacity-60" : ""
                              } ${
                                !isPast && selectable ? "hover:bg-teal-50 hover:border-teal-300" : ""
                              } ${
                                isToday ? "bg-teal-50/30" : isPast ? "bg-gray-100" : "bg-white"
                              }`}
                            >
                              {isSelected ? (
                                <div className="flex items-center justify-center gap-1 text-teal-700 font-semibold py-2">
                                  <Check size={16} />
                                  Đã chọn
                                </div>
                              ) : selectable ? (
                                <Button
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  className="w-full"
                                  onPress={() => {
                                    handleDateChange(dateStr);
                                    setSelectedSlot(slotKey);
                                  }}
                                >
                                  Chọn
                                </Button>
                              ) : (
                                <span className="text-gray-400 py-2 block">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-6 text-sm text-gray-600 pt-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-white border-2 border-teal-600"></span>
                  Đã chọn
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-white border-2 border-gray-300"></span>
                  Có thể đặt
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></span>
                  Không khả dụng
                </div>
              </div>
            </div>

            {/* Appointment Type */}
            {selectedSlot && (
              <div className="!mt-8">
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

            {/* Reason (Required) */}
            {selectedSlot && (
              <div>
                <label className="block text-sm font-medium mb-2">Lý do khám <span className="text-red-500">*</span></label>
                <Textarea
                  isRequired
                  variant="flat"
                  placeholder="Mô tả triệu chứng hoặc lý do bạn muốn khám..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minRows={3}
                  classNames={{
                    inputWrapper: "bg-gray-100 hover:bg-gray-200 data-[focus=true]:bg-gray-100",
                  }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                variant="flat"
                onClick={() => setCurrentStep(1)}
                fullWidth
                size="lg"
              >
                Quay lại
              </Button>
              <Button
                color="primary"
                onClick={handleConfirmBooking}
                isDisabled={!selectedSlot}
                fullWidth
                size="lg"
                isLoading={loading}
              >
                Xác nhận & Tiếp tục
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
                variant="flat"
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

