import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card, CardBody, CardHeader, Button, Avatar, Chip, Input, Select, SelectItem, Divider, RadioGroup, Radio, Textarea
} from "@heroui/react";
import { Calendar, Clock, User, Stethoscope, Video, MapPin, ChevronRight, Check, AlertCircle } from "lucide-react";
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
    if (searchQuery) {
      const filtered = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (SPECIALTY_MAP[doc.specialty] || doc.specialty).toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchQuery, doctors]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response = await fetch("http://localhost:8080/doctor/dashboard/all");
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
        setFilteredDoctors(data);
      } else {
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

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/appointments/doctor/${selectedDoctor.id}/available-slots?date=${selectedDate}`
      );
      if (response.ok) {
        const data = await response.json();
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
          <CardBody className="space-y-4">
            <Input
              placeholder="Tìm bác sĩ theo tên hoặc chuyên khoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<User size={18} className="text-gray-400" />}
            />

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} shadow="none" className="border hover:border-teal-500 transition-all cursor-pointer" isPressable onPress={() => handleSelectDoctor(doctor)}>
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar 
                          src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0D9488&color=fff`} 
                          size="lg" 
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{doctor.name}</p>
                          <p className="text-sm text-gray-600">{SPECIALTY_MAP[doctor.specialty] || doctor.specialty}</p>
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
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Chọn ngày khám</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
              />
              <p className="text-xs text-gray-500 mt-1">Có thể đặt lịch từ ngày mai đến 30 ngày sau</p>
            </div>

            {/* Slot Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium mb-2">Chọn khung giờ</label>
                {loadingSlots ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Đang tải lịch trống...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-600">Bác sĩ không có lịch trống trong ngày này</p>
                    <p className="text-sm text-gray-500">Vui lòng chọn ngày khác</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "solid" : "bordered"}
                        color={selectedSlot === slot ? "primary" : "default"}
                        onClick={() => setSelectedSlot(slot)}
                        startContent={<Clock size={18} />}
                      >
                        {SLOT_TIMES[slot]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
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

