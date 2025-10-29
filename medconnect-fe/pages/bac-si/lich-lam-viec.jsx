import { useState, useEffect, useRef } from "react";
import {
  Card, CardBody, CardHeader, Button, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@heroui/react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, Info, Loader2 } from "lucide-react";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

const SLOTS = [
  // Morning slots (7:30 - 12:00)
  { id: "SLOT_1", time: "07:30 - 08:00", period: "morning" },
  { id: "SLOT_2", time: "08:15 - 08:45", period: "morning" },
  { id: "SLOT_3", time: "09:00 - 09:30", period: "morning" },
  { id: "SLOT_4", time: "09:45 - 10:15", period: "morning" },
  { id: "SLOT_5", time: "10:30 - 11:00", period: "morning" },
  { id: "SLOT_6", time: "11:15 - 11:45", period: "morning" },
  // Lunch break: 12:00 - 13:00
  // Afternoon slots (13:00 - 17:15)
  { id: "SLOT_7", time: "13:00 - 13:30", period: "afternoon" },
  { id: "SLOT_8", time: "13:45 - 14:15", period: "afternoon" },
  { id: "SLOT_9", time: "14:30 - 15:00", period: "afternoon" },
  { id: "SLOT_10", time: "15:15 - 15:45", period: "afternoon" },
  { id: "SLOT_11", time: "16:00 - 16:30", period: "afternoon" },
  { id: "SLOT_12", time: "16:45 - 17:15", period: "afternoon" }
];

export default function DoctorSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // For silent background refresh
  
  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    
    // First load: show loading spinner
    // Subsequent loads (week changes): silent background fetch
    const silent = !isInitialLoad.current;
    fetchSchedule(silent);
    
    // Mark as no longer initial load after first fetch
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [user, authLoading, currentWeekStart]);

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
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

  const fetchSchedule = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      const token = await user.getIdToken();
      const weekDays = getWeekDays(currentWeekStart);
      const startDate = formatDate(weekDays[0]);
      const endDate = formatDate(weekDays[6]);
      
      const response = await fetch(
        `http://localhost:8080/api/schedule/weekly?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { "Authorization": `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setScheduleData(data);
      } else {
        if (!silent) toast.error("Không thể tải lịch làm việc");
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      if (!silent) toast.error("Lỗi kết nối server");
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleAddSlot = async (date, slot) => {
    const dateStr = formatDate(date);
    const existingSlot = scheduleData.find(s => s.date === dateStr && s.slot === slot.id);
    
    if (existingSlot && existingSlot.status !== "EMPTY") {
      toast.error("Ca làm việc này đã được mở");
      return;
    }
    
    const isUpdate = existingSlot && existingSlot.id;
    
    // Optimistic Update
    const optimisticSlot = {
      id: `temp-${Date.now()}`,
      date: dateStr,
      slot: slot.id,
      status: "RESERVED",
      appointment: null,
      isOptimistic: true
    };

    setScheduleData(prev => {
      const newData = [...prev, optimisticSlot];
      return newData;
    });

    try {
      const token = await user.getIdToken();
      
      try {
      const token = await user.getIdToken();
      
      let response;
      if (isUpdate) {
        // Update existing slot status from EMPTY to RESERVED
        response = await fetch(`http://localhost:8080/api/schedule/${existingSlot.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            status: "RESERVED"
          })
        });
      } else {
        // Create new schedule
        response = await fetch("http://localhost:8080/api/schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            date: dateStr,
            slot: slot.id,
            status: "RESERVED"
          })
        });
      }

      if (response.ok) {
        const newSlot = await response.json();
        // Replace optimistic slot with real data
        setScheduleData(prev => {
          const updated = prev.map(s => 
            s.id === optimisticSlot.id ? newSlot : s
          );
          return updated;
        });
        
        // Backup: Silent refresh to ensure sync
        setTimeout(() => {
          fetchSchedule(true);
        }, 100);
        
        toast.success("Đã thêm ca làm việc");
      } else {
        // Rollback on failure
        setScheduleData(prev => prev.filter(s => s.id !== optimisticSlot.id));
        const error = await response.json();
        const errorMessage = error.error || error.message || JSON.stringify(error);
        toast.error(errorMessage);
      }
    } catch (error) {
      // Rollback on error
      setScheduleData(prev => prev.filter(s => s.id !== optimisticSlot.id));
      console.error("Error adding slot:", error);
      toast.error("Lỗi kết nối server");
    }
  };

  const handleDeleteSlot = async (scheduleId) => {
    const deletedSlot = scheduleData.find(s => s.id === scheduleId);
    
    // Optimistic Update: Remove from UI immediately
    setScheduleData(prev => prev.filter(s => s.id !== scheduleId));
    onClose();

    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/schedule/${scheduleId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        // Backup: Silent refresh to ensure sync
        setTimeout(() => {
          fetchSchedule(true);
        }, 100);
        
        toast.success("Đã xóa ca làm việc");
      } else {
        // Rollback on failure
        if (deletedSlot) {
          setScheduleData(prev => [...prev, deletedSlot]);
        }
        const error = await response.json();
        toast.error(error.error || "Không thể xóa ca làm việc");
      }
    } catch (error) {
      // Rollback on error
      if (deletedSlot) {
        setScheduleData(prev => [...prev, deletedSlot]);
      }
      console.error("Error deleting slot:", error);
      toast.error("Lỗi kết nối server");
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getSlotData = (date, slot) => {
    const dateStr = formatDate(date);
    const found = scheduleData.find(
      (s) => s.date === dateStr && s.slot === slot.id
    );
    return found;
  };

  const getStatusColor = (status) => {
    const colors = {
      EMPTY: "default",
      RESERVED: "warning",
      BUSY: "success"
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      EMPTY: "Trống",
      RESERVED: "Sẵn sàng",
      BUSY: "Có lịch hẹn"
    };
    return labels[status] || status;
  };

  const weekDays = getWeekDays(currentWeekStart);

  if (authLoading || loading) {
    return (
      <DoctorFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DoctorFrame>
    );
  }

  // Calculate stats
  const emptySlots = scheduleData.filter(s => s.status === "EMPTY").length;
  const reservedSlots = scheduleData.filter(s => s.status === "RESERVED").length;
  const bookedSlots = scheduleData.filter(s => s.status === "BUSY").length;
  const totalWeekSlots = 7 * 12; // 7 days * 12 slots

  const leftChildren = (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-3">
        {/* Reserved Slots */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Sẵn sàng</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{reservedSlots}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center">
                <CheckCircle className="text-yellow-700" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Booked Slots */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Đã đặt</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{bookedSlots}</p>
              </div>
              <div className="w-12 h-12 bg-green-300 rounded-full flex items-center justify-center">
                <Calendar className="text-green-700" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Empty Slots */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Trống</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalWeekSlots - reservedSlots - bookedSlots}</p>
              </div>
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <Plus className="text-gray-700" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Total Slots */}
      <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-teal-100 uppercase tracking-wide">Tổng ca trong tuần</p>
              <p className="text-4xl font-bold mt-1">{totalWeekSlots}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="text-white" size={28} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Info className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Hướng dẫn</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Plus className="text-blue-600" size={16} />
            </div>
            <p>Click ô <strong className="text-gray-900">trống</strong> để mở lịch cho bệnh nhân</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trash2 className="text-yellow-600" size={16} />
            </div>
            <p>Click ô <strong className="text-yellow-600">sẵn sàng</strong> để đóng lịch</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-green-600" size={16} />
            </div>
            <p>Ô <strong className="text-green-600">có lịch hẹn</strong> không thể xóa</p>
          </div>
        </CardBody>
      </Card>

      {/* Legend Card */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-700">Chú thích</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
            <span>Trống - Chưa mở lịch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-400"></div>
            <span>Sẵn sàng - Có thể đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
            <span>Đã đặt - Có bệnh nhân</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      {/* Header Card - Enhanced */}
      <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Calendar className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Lịch làm việc</h1>
                <p className="text-teal-100 text-sm mt-1">
                  Quản lý ca làm việc • {reservedSlots} ca sẵn sàng • {bookedSlots} ca đã đặt
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onClick={previousWeek}
                isDisabled={isRefreshing}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                size="sm"
                className="bg-white text-teal-600 font-semibold hover:bg-white/90 min-w-[140px]"
                onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
                isDisabled={isRefreshing}
                startContent={isRefreshing ? <Loader2 size={16} className="animate-spin" /> : null}
              >
                Tuần hiện tại
              </Button>
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onClick={nextWeek}
                isDisabled={isRefreshing}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Schedule Table Card - Enhanced */}
      <Card className="shadow-lg">
          <CardBody className="p-0">
          <div className="overflow-auto max-h-[75vh]">
            <table className="w-full text-sm border-collapse transition-opacity duration-300 ease-in-out">
              <thead className="sticky top-0 bg-gradient-to-r from-gray-100 to-gray-50 z-10 shadow-sm">
                <tr>
                  <th className="border-2 border-gray-300 p-4 text-left font-bold text-gray-800 min-w-[120px] bg-gray-100">
                      <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-teal-600" />
                      Ca làm việc
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
                        {isToday && (
                          <div className="text-xs text-teal-600 font-semibold mt-1">Hôm nay</div>
                        )}
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
                      
                      // Check if date is in the past (before today)
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPastDate = day < today;
                        
                        return (
                          <td
                          key={dayIdx}
                          className={`border-2 border-gray-300 p-3 text-center transition-all duration-300 ease-in-out ${
                            isPastDate ? "bg-gray-100 cursor-not-allowed opacity-60" : "cursor-pointer"
                          } ${
                            !isPastDate && isEmpty ? "hover:bg-blue-50 hover:border-blue-300 hover:shadow-inner" : ""
                          } ${
                            !isPastDate && isReserved ? "hover:bg-yellow-100 hover:border-yellow-400" : ""
                          }
                          ${isToday ? "bg-teal-50/30" : isPastDate ? "bg-gray-100" : "bg-white"}
                          ${slotData?.isOptimistic ? "animate-pulse" : ""}`}
                          onClick={() => {
                            // Chặn click vào ngày đã qua
                            if (isPastDate) {
                              toast.warning("Không thể đặt lịch cho ngày đã qua");
                              return;
                            }
                            
                            if (isEmpty) {
                              handleAddSlot(day, slot);
                            } else if (isReserved) {
                              setSelectedSlot(slotData);
                              onOpen();
                            }
                          }}
                        >
                          {isEmpty && !isPastDate && (
                            <div className="flex flex-col items-center justify-center gap-2 py-4 text-gray-400 group-hover:text-blue-600 animate-fade-in">
                              <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-all duration-300">
                                <Plus size={20} />
                                      </div>
                              <span className="text-xs font-medium">Thêm ca</span>
                                        </div>
                                      )}
                          {isEmpty && isPastDate && (
                            <div className="flex flex-col items-center justify-center gap-2 py-4 text-gray-400">
                              <span className="text-xs font-medium">Đã qua</span>
                            </div>
                                      )}
                          {isReserved && (
                            <div className="py-4 animate-fade-in">
                              <div className="w-10 h-10 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center mx-auto mb-2 transition-transform duration-300 hover:scale-110">
                                <CheckCircle className="text-yellow-600" size={20} />
                                </div>
                              <Chip color="warning" size="sm" variant="solid" className="font-semibold">
                                Sẵn sàng
                              </Chip>
                                </div>
                          )}
                          {isBusy && slotData.appointment && (
                            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm animate-fade-in hover:shadow-md transition-shadow duration-300">
                              <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center mx-auto mb-2 transition-transform duration-300 hover:scale-110">
                                <CheckCircle className="text-green-700" size={20} />
                                  </div>
                              <p className="font-bold text-sm text-green-900 mb-1">
                                {slotData.appointment.patient?.name || "Bệnh nhân"}
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
                  </div>
  );

  return (
    <DoctorFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Đóng lịch làm việc</ModalHeader>
          <ModalBody>
            <p>Bạn có chắc muốn đóng ca làm việc này không?</p>
            <p className="text-sm text-gray-500 mt-2">
              Ca này sẽ không còn cho phép bệnh nhân đặt lịch.
            </p>
                </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Hủy
            </Button>
                    <Button
                      color="danger"
              onPress={() => selectedSlot && handleDeleteSlot(selectedSlot.id)}
            >
              Đóng lịch
                    </Button>
                </ModalFooter>
          </ModalContent>
        </Modal>
    </DoctorFrame>
  );
}
