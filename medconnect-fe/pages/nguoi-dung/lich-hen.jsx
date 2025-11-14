import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Globe, MapPin, Plus, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/router";
import { Button, Card, CardBody, CardHeader, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip as UiChip, Chip } from "@heroui/react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";


export default function AppointmentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [viewMode, setViewMode] = useState("schedule"); // 'schedule' | 'list'
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rxLoading, setRxLoading] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [paymentByAptId, setPaymentByAptId] = useState({}); // { [id]: { hasPaid, status } }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      router.push("/dang-nhap");
      return;
    }
    fetchAppointments();
  }, [user, authLoading]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/appointments/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[Patient Schedule] /api/appointments/my ->", data);
        setAppointments(data);
        
        // Fetch payment status for each appointment
        if (data.length > 0) {
          const paymentPromises = data.map(async (apt) => {
            const id = apt.id || apt.appointmentId;
            if (!id) return null;
            try {
              const resp = await fetch(`http://localhost:8080/api/payment/appointment/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (resp.ok) {
                const payData = await resp.json();
                return { id, payment: payData };
              }
            } catch (e) {
              console.error(`Failed to fetch payment for appointment ${id}:`, e);
            }
            return null;
          });
          
          const paymentResults = await Promise.all(paymentPromises);
          const paymentMap = {};
          paymentResults.forEach(result => {
            if (result && result.payment) {
              paymentMap[result.id] = {
                hasPaid: result.payment.hasPaid || false,
                status: result.payment.status
              };
            }
          });
          setPaymentByAptId(paymentMap);
        }
      } else {
        console.error("[Patient Schedule] Fetch failed:", response.status);
        toast.error("Không thể tải danh sách lịch hẹn");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getWeekDays(startDate) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }

  function previousWeek() {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  }

  function nextWeek() {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  }

  const weekDays = getWeekDays(currentWeekStart);
  // slot start time (minutes) for sorting
  const slotStartMinutes = {
    SLOT_1: 7 * 60 + 30,
    SLOT_2: 8 * 60 + 15,
    SLOT_3: 9 * 60,
    SLOT_4: 9 * 60 + 45,
    SLOT_5: 10 * 60 + 30,
    SLOT_6: 11 * 60 + 15,
    SLOT_7: 13 * 60,
    SLOT_8: 13 * 60 + 45,
    SLOT_9: 14 * 60 + 30,
    SLOT_10: 15 * 60 + 15,
    SLOT_11: 16 * 60,
    SLOT_12: 16 * 60 + 45,
  };

  function toDateTime(apt) {
    const d = new Date(apt.date);
    const mins = slotStartMinutes[apt.slot] || 0;
    d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    return d;
  }

  const now = new Date();
  const upcoming = [...appointments]
    .filter((a) => a.status !== "CANCELLED" && a.status !== "DENIED")
    .sort((a, b) => toDateTime(a) - toDateTime(b));
  const history = [...appointments]
    .filter((a) => toDateTime(a) < now || a.status === "CANCELLED" || a.status === "DENIED")
    .sort((a, b) => toDateTime(b) - toDateTime(a));

  const openAppointmentModal = async (apt) => {
    setSelectedAppointment(apt);
    setPrescription(null);
    onOpen();
    try {
      setRxLoading(true);
      const token = await user.getIdToken();
      const id = apt.id || apt.appointmentId;
      if (!id) return;
      const resp = await fetch(`http://localhost:8080/api/medical-records/appointment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        const meds = data.medications || data.medicines || [];
        setPrescription({ medications: Array.isArray(meds) ? meds : [], note: data.note || data.notes || "" });
      }
    } catch {}
    finally { setRxLoading(false); }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      "PENDING": "bg-yellow-50 border-yellow-300 text-yellow-900",
      "CONFIRMED": "bg-blue-50 border-blue-300 text-blue-900",
      "FINISHED": "bg-green-50 border-green-300 text-green-900",
      "CANCELLED": "bg-red-50 border-red-300 text-red-900",
      "DENIED": "bg-gray-50 border-gray-300 text-gray-900",
      "ONGOING": "bg-purple-50 border-purple-300 text-purple-900"
    };
    return statusMap[status] || "bg-gray-50 border-gray-300 text-gray-900";
  };

  const getStatusLabel = (status) => {
    const labels = {
      "PENDING": "Chờ xác nhận",
      "CONFIRMED": "Đã xác nhận",
      "FINISHED": "Hoàn thành",
      "CANCELLED": "Đã hủy",
      "DENIED": "Bị từ chối",
      "ONGOING": "Đang khám"
    };
    return labels[status] || status;
  };

  
  const getSlotTime = (slot) => {
    const slotTimes = {
      "SLOT_1": "07:30",
      "SLOT_2": "10:00",
      "SLOT_3": "12:50",
      "SLOT_4": "15:20"
    };
    return slotTimes[slot] || "N/A";
  };



const SLOTS = [
  // Morning slots (7:30 - 12:00)
  { id: "SLOT_1", time: "07:30 - 08:00"},
  { id: "SLOT_2", time: "08:15 - 08:45"},
  { id: "SLOT_3", time: "09:00 - 09:30"},
  { id: "SLOT_4", time: "09:45 - 10:15"},
  { id: "SLOT_5", time: "10:30 - 11:00"},
  { id: "SLOT_6", time: "11:15 - 11:45"},
  // Lunch break: 12:00 - 13:00
  // Afternoon slots (13:00 - 17:15)
  { id: "SLOT_7", time: "13:00 - 13:30"},
  { id: "SLOT_8", time: "13:45 - 14:15"},
  { id: "SLOT_9", time: "14:30 - 15:00"},
  { id: "SLOT_10", time: "15:15 - 15:45"},
  { id: "SLOT_11", time: "16:00 - 16:30"},
  { id: "SLOT_12", time: "16:45 - 17:15"}
];

// Lấy thông tin lịch hẹn của từng ô (theo ngày + ca)
function formatDateLocal(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
}

function getSlotData(date, slot) {
  const dayStr = formatDateLocal(date);
  const slotAppointments = appointments.filter(
    (a) =>
      a.date === dayStr &&
      a.slot === slot.id
  );

  if (slotAppointments.length === 0) return { status: "EMPTY" };
  const appointment = slotAppointments[0];

  if (appointment.status === "CONFIRMED" || appointment.status === "ONGOING" || appointment.status === "FINISHED") {
    return { status: "BUSY", appointment };
  } else if (appointment.status === "PENDING") {
    return { status: "RESERVED", appointment };
  } else {
    return { status: "EMPTY" };
  }
}

  if (authLoading || loading) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PatientFrame>
    );
  }

  const leftChildren = (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Plus className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Thao tác nhanh</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <Button
            fullWidth
            color="primary"
            startContent={<Plus size={18} />}
            onClick={() => router.push("/nguoi-dung/dat-lich-kham")}
          >
            Đặt lịch khám mới
          </Button>
        </CardBody>
      </Card>

      {/* Mode Switch */}
      <Card>
        <CardHeader className="flex gap-3">
          <Calendar className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Chế độ hiển thị</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-2 gap-2">
            <Button
              color={viewMode === 'schedule' ? 'primary' : 'default'}
              variant={viewMode === 'schedule' ? 'solid' : 'flat'}
              onClick={() => setViewMode('schedule')}
            >
              Theo tuần
            </Button>
            <Button
              color={viewMode === 'list' ? 'primary' : 'default'}
              variant={viewMode === 'list' ? 'solid' : 'flat'}
              onClick={() => setViewMode('list')}
            >
              Danh sách
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Legend Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Calendar className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Chú thích</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-300 rounded"></div>
            <span>Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
            <span>Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded"></div>
            <span>Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
            <span>Đã hủy</span>
          </div>
          <Divider />
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-green-600" />
            <span>Khám online</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-orange-600" />
            <span>Khám tại phòng khám</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn khám</h1>
                <p className="text-gray-600 text-sm">Xem lịch hẹn theo tuần</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onClick={previousWeek}
                title="Tuần trước"
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
              >
                Tuần hiện tại
              </Button>
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onClick={nextWeek}
                title="Tuần sau"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {viewMode === 'schedule' ? (
      <Card className="shadow-lg">
  <CardBody className="p-0">
    <div className="overflow-auto max-h-[75vh]">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-gradient-to-r from-gray-100 to-gray-50 z-10 shadow-sm">
          <tr>
            <th className="border-2 border-gray-300 p-4 text-left font-bold text-gray-800 min-w-[120px] bg-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" />
                Ca khám
              </div>
            </th>
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <th
                  key={index}
                  className={`border-2 border-gray-300 p-3 text-center font-bold min-w-[140px] ${
                    isToday ? "bg-teal-100 border-teal-400" : "bg-gray-50"
                  }`}
                >
                  <div className={`text-xs uppercase tracking-wide ${isToday ? "text-teal-700" : "text-gray-600"}`}>
                    {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                  </div>
                  <div className={`text-xl font-bold mt-1 ${isToday ? "text-teal-700" : "text-gray-800"}`}>
                    {day.getDate()}/{day.getMonth() + 1}
                  </div>
                  {isToday && <div className="text-xs text-teal-600 font-semibold mt-1">Hôm nay</div>}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {SLOTS.map((slot, slotIdx) => (
            <tr key={slot.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="border-2 border-gray-300 p-4 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Ca {slotIdx + 1}</span>
                  <span className="text-sm">{slot.time}</span>
                </div>
              </td>

              {weekDays.map((day, dayIdx) => {
                const slotData = getSlotData(day, slot);
                const status = slotData?.status || "EMPTY";
                const isBusy = status === "BUSY";
                const isReserved = status === "RESERVED";
                const isEmpty = status === "EMPTY";
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <td
                    key={dayIdx}
                    className={`border-2 border-gray-300 p-3 text-center transition-all duration-200 ${
                      isToday ? "bg-teal-50/30" : "bg-white"
                    }`}
                  >
                    {isEmpty && (
                      <div className="py-6 text-gray-400 text-xs italic">—</div>
                    )}
                    {isReserved && (() => {
                      const aptId = slotData.appointment?.id || slotData.appointment?.appointmentId;
                      const payInfo = aptId ? paymentByAptId[aptId] : null;
                      const hasPaid = payInfo?.hasPaid || false;
                      return (
                        <div className="py-3">
                          <Chip color="warning" size="sm" variant="solid" className="font-semibold">
                            {hasPaid ? "Chờ bác sĩ xác nhận" : "Chờ thanh toán"}
                          </Chip>
                        </div>
                      );
                    })()}
                    {isBusy && slotData.appointment && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="text-green-700" size={20} />
                        </div>
                        <p className="font-bold text-sm text-green-900 mb-1">
                          {slotData.appointment.doctor?.name || "Bác sĩ"}
                        </p>
                        <Chip color="success" size="sm" variant="solid" className="font-semibold">
                          Đã đặt
                        </Chip>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </CardBody>
</Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Lịch sắp tới</h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              {upcoming.length === 0 && <p className="text-sm text-gray-500">Không có lịch sắp tới</p>}
              {upcoming.map((a, idx) => {
                const isPending = a.status === "PENDING";
                const slotTime = SLOTS.find(s=>s.id===a.slot)?.time || a.slot;
                const aptId = a.id || a.appointmentId;
                const payInfo = aptId ? paymentByAptId[aptId] : null;
                const hasPaid = payInfo?.hasPaid || false;
                return (
                  <Card key={idx} className={`hover:shadow-md transition rounded-2xl ${isPending ? 'border-4 border-yellow-400' : 'border-2 border-gray-200'}`}>
                    <CardBody className="p-5">
                      {/* Header with profile picture, name, and status tags */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <img 
                            src={a.doctor?.avatar || a.doctor?.idPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.doctor?.name||'BS')}&background=0D9488&color=fff`} 
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-400" 
                            alt="avatar"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{a.doctor?.name || 'Bác sĩ'}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <UiChip size="sm" variant="flat" color={a.status==='PENDING' ? 'warning' : (a.status==='CONFIRMED'?'primary':'default')}>
                              {a.status === "PENDING" ? (hasPaid ? "Chờ bác sĩ xác nhận" : "Chờ thanh toán") : getStatusLabel(a.status)}
                            </UiChip>
                            {a.type === "ONLINE" ? (
                              <Chip size="sm" variant="flat" color="success" startContent={<Globe size={12}/>}>Khám online</Chip>
                            ) : (
                              <Chip size="sm" variant="flat" color="default" startContent={<MapPin size={12}/>}>Tại phòng khám</Chip>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details grid - 2 columns */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Left column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar size={16} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Ngày khám</p>
                              <p className="font-bold text-gray-900">{new Date(a.date).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                          {a.doctor?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700">{a.doctor.phone}</span>
                            </div>
                          )}
                        </div>
                        {/* Right column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock size={16} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Giờ khám</p>
                              <p className="font-bold text-gray-900">{slotTime}</p>
                            </div>
                          </div>
                          {a.doctor?.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 truncate">{a.doctor.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <Divider className="my-4" />
                      <div className="flex gap-2">
                        {a.status === "PENDING" ? (
                          hasPaid ? (
                            <Button 
                              size="sm" 
                              color="default" 
                              variant="flat"
                              className="flex-1"
                              isDisabled
                            >
                              Chờ bác sĩ xác nhận
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              color="primary" 
                              className="flex-1"
                              onClick={() => router.push(`/nguoi-dung/dat-lich-kham/thanh-toan?appointmentId=${aptId}`)}
                            >
                              Thanh toán
                            </Button>
                          )
                        ) : a.status === "CONFIRMED" ? (
                          <Button 
                            size="sm" 
                            color="primary" 
                            className="flex-1"
                            onClick={() => router.push(a.type === "ONLINE" ? `/nguoi-dung/kham-online/${a.id || a.appointmentId}` : `/nguoi-dung/kham-offline/${a.id || a.appointmentId}`)}
                          >
                            Tham gia khám
                          </Button>
                        ) : null}
                        <Button 
                          size="sm" 
                          variant="flat"
                          color="default"
                          onClick={() => router.push('/nguoi-dung/lich-hen')}
                        >
                          Xem lịch
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Lịch đã qua</h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              {history.length === 0 && <p className="text-sm text-gray-500">Chưa có lịch đã qua</p>}
              {history.map((a, idx) => {
                const slotTime = SLOTS.find(s=>s.id===a.slot)?.time || a.slot;
                return (
                  <Card key={idx} className="hover:shadow-md transition rounded-2xl border-2 border-gray-200">
                    <CardBody className="p-5">
                      {/* Header with profile picture, name, and status tags */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <img 
                            src={a.doctor?.avatar || a.doctor?.idPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.doctor?.name||'BS')}&background=0D9488&color=fff`} 
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-400" 
                            alt="avatar"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{a.doctor?.name || 'Bác sĩ'}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <UiChip size="sm" variant="flat" color={a.status==='FINISHED' ? 'success' : (a.status==='CANCELLED'?'danger':'default')}>
                              {getStatusLabel(a.status)}
                            </UiChip>
                            {a.type === "ONLINE" ? (
                              <Chip size="sm" variant="flat" color="success" startContent={<Globe size={12}/>}>Khám online</Chip>
                            ) : (
                              <Chip size="sm" variant="flat" color="default" startContent={<MapPin size={12}/>}>Tại phòng khám</Chip>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details grid - 2 columns */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Left column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar size={16} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Ngày khám</p>
                              <p className="font-bold text-gray-900">{new Date(a.date).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                          {a.doctor?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700">{a.doctor.phone}</span>
                            </div>
                          )}
                        </div>
                        {/* Right column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock size={16} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Giờ khám</p>
                              <p className="font-bold text-gray-900">{slotTime}</p>
                            </div>
                          </div>
                          {a.doctor?.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 truncate">{a.doctor.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <Divider className="my-4" />
                      <div className="flex gap-2">
                        {a.status === "FINISHED" ? (
                          <Button 
                            size="sm" 
                            color="default" 
                            variant="flat"
                            className="flex-1"
                            onClick={() => openAppointmentModal(a)}
                          >
                            Xem lại
                          </Button>
                        ) : null}
                        <Button 
                          size="sm" 
                          variant="flat"
                          color="default"
                          onClick={() => router.push('/nguoi-dung/lich-hen')}
                        >
                          Xem lịch
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </CardBody>
          </Card>
        </>
      )}

    </div>
  );

  return (
    <PatientFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Modal: Prescription or Appointment detail */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {selectedAppointment ? `Chi tiết lịch hẹn • ${new Date(selectedAppointment.date).toLocaleDateString('vi-VN')}` : 'Chi tiết lịch hẹn'}
          </ModalHeader>
          <ModalBody>
            {rxLoading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : selectedAppointment ? (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2"><Calendar size={16} className="text-teal-600" /><span>Ngày: {new Date(selectedAppointment.date).toLocaleDateString('vi-VN')}</span></div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-cyan-600" /><span>Hình thức: {selectedAppointment.type || '—'}</span></div>
                <Divider />
                <h4 className="font-medium text-gray-800">Đơn thuốc</h4>
                {prescription?.medications && prescription.medications.length > 0 ? (
                  <div className="space-y-2">
                    {prescription.medications.map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span>{m.name}</span>
                        <span className="text-gray-600">{m.dose} {m.unit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có đơn thuốc</p>
                )}
                <Divider />
                <h4 className="font-medium text-gray-800">Ghi chú</h4>
                <p className="text-gray-700">{prescription?.note || 'Không có ghi chú'}</p>
              </div>
            ) : (
              <div className="text-center py-8">Chọn một lịch để xem chi tiết</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" color="primary" onPress={onClose}>Đóng</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PatientFrame>
  );
}
