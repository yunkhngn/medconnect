import React, { useState, useEffect, useCallback } from 'react'
import DoctorFrame from '@/components/layouts/Doctor/Frame'
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react' // Xóa Edit2, Plus, Check
import {
  Button, Card, CardBody, Chip, Spinner, Tooltip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure
} from '@heroui/react'
import { auth } from '../../lib/firebase'

/*
  Update summary:
  - Removed all editing functionality (isEditing, handleSave, handleDelete).
  - The schedule is now read-only.
  - Clicking a BUSY cell opens the info modal.
  - Clicking an EMPTY cell does nothing.
  - Added console.log() statements for debugging data flow:
    1. fetchSchedule (raw API data, transformed data)
    2. Grid render (data for each cell)
    3. handleSelectCell (data for clicked cell)
    4. Modal render (data passed to modal)
*/

const WorkingHours = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(false)
  // const [isMutating, setIsMutating] = useState(false) // ĐÃ XÓA
  // const [selectedCell, setSelectedCell] = useState(null) // ĐÃ XÓA
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  // const [editStatus, setEditStatus] = useState(null) // ĐÃ XÓA
  // const [isEditing, setIsEditing] = useState(false) // ĐÃ XÓA
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Simple toast state
  const [toasts, setToasts] = useState([]) // { id, type: 'success'|'error'|'info', message }

  const pushToast = (message, type = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, ttl)
  }

  const slots = [
    { id: 'SLOT_1', time: '07:30 - 09:50' },
    { id: 'SLOT_2', time: '10:00 - 12:20' },
    { id: 'SLOT_3', time: '12:50 - 15:10' },
    { id: 'SLOT_4', time: '15:20 - 17:40' }
  ]

  // const statusOptions = [...] // ĐÃ XÓA (Không cần thiết nữa)

  const getWeekDates = (date) => {
    const current = new Date(date)
    const monday = new Date(current)
    const day = current.getDay() || 7
    monday.setDate(current.getDate() - day + 1)
    const dates = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + i)
      dayDate.setHours(0, 0, 0, 0)
      dates.push(dayDate)
    }
    return dates
  }

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }

  // FETCH: Thêm console.log
  const fetchSchedule = useCallback(async () => {
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) return
      const token = await user.getIdToken()
      const weekDates = getWeekDates(currentWeek)
      const start = formatDate(weekDates[0])
      const end = formatDate(weekDates[6])

      const response = await fetch(`http://localhost:8080/doctor/dashboard/schedule?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      
      // ===== DEBUG LOG 1 =====
      console.log('[DEBUG] Raw API Data:', data)
      // =======================

      const transformed = (data || []).map(s => ({
        id: s.id,
        date: s.date,
        slot: s.slot,
        status: s.status,
        appointment: s.appointment ? {
          id: s.appointment.id,
          patientName: s.appointment.patientName,
          patientEmail: s.appointment.patientEmail,
          type: s.appointment.type,
          status: s.appointment.status
        } : null
      }))

      // ===== DEBUG LOG 2 =====
      console.log('[DEBUG] Transformed Data:', transformed)
      // =======================

      setScheduleData(transformed)
    } catch (e) {
      console.error(e)
      pushToast(`Lỗi tải lịch: ${e.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [currentWeek])

  useEffect(() => { fetchSchedule() }, [fetchSchedule])

  const getScheduleForSlot = (date, slotId) => {
    const dateStr = formatDate(date)
    return scheduleData.find(s => s.date === dateStr && s.slot === slotId)
  }

  // Sửa handleSelectCell - chỉ để mở modal
  const handleSelectCell = (date, slotId) => {
    const schedule = getScheduleForSlot(date, slotId)

    // ===== DEBUG LOG 4 =====
    console.log('[DEBUG] Cell Clicked. Schedule found:', schedule)
    console.log('[DEBUG] Setting Selected Appointment:', schedule?.appointment ?? null)
    // =======================

    // Chỉ mở modal nếu có thông tin lịch hẹn
    if (schedule?.appointment) {
      setSelectedAppointment(schedule.appointment)
      onOpen()
    } else {
      // (Nếu backend trả về BUSY nhưng không có appointment, log 1 cảnh báo)
      if (schedule?.status === 'BUSY') {
         console.warn(`[DEBUG] Cell is BUSY but has no appointment info. Date: ${date}, Slot: ${slotId}`)
         // Vẫn mở modal để hiển thị "Không có thông tin"
         setSelectedAppointment(null) 
         onOpen()
      }
      // Nếu là ô trống (hoặc schedule=null) thì không làm gì cả
    }
  }

  // const handleEditClick = () => {} // ĐÃ XÓA
  // const handleDelete = async () => {} // ĐÃ XÓA
  // const handleSaveStatus = async () => {} // ĐÃ XÓA

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const isToday = (date) => date.toDateString() === new Date().toDateString()

  // Sửa handleCloseModal
  const handleCloseModal = () => {
    onClose()
    setSelectedAppointment(null)
  }

  const weekDates = getWeekDates(currentWeek)
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

  // open EMR using appointment.id (per DTO)
  const openEMR = (appointment) => {
    if (!appointment) return
    const key = encodeURIComponent(String(appointment.id ?? appointment.patientName ?? 'unknown'))
    window.open(`/doctor/emr/${key}`, '_blank')
  }

  return (
    <DoctorFrame title="Lịch làm việc">
      <div className="p-4 lg:p-6 min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100">

        {/* Toaster (top-right) */}
        <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
          {toasts.map(t => (
            <div key={t.id} className={`max-w-xs w-full rounded-lg p-3 shadow-lg text-sm text-white ${
              t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-gray-700'
            }`}>
              {t.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <Card className="mb-6 shadow-xl border-none bg-white/90 backdrop-blur-md">
          <CardBody>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-gradient-to-br from-[#65CCCC] to-[#4DB8B8] rounded-2xl shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#65CCCC] to-[#4DB8B8] bg-clip-text text-transparent">
                    Lịch làm việc tuần
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button isIconOnly variant="flat" onPress={() => navigateWeek(-1)} className="bg-white shadow-md hover:shadow-lg border border-gray-200 transition-all">
                  <ChevronLeft className="w-5 h-5 text-[#65CCCC]" />
                </Button>
                <Button variant="shadow" onPress={() => setCurrentWeek(new Date())}
                  className="font-semibold bg-gradient-to-r from-[#65CCCC] to-[#4DB8B8] text-white hover:shadow-lg transition-all">
                  Hôm nay
                </Button>
                <Button isIconOnly variant="flat" onPress={() => navigateWeek(1)} className="bg-white shadow-md hover:shadow-lg border border-gray-200 transition-all">
                  <ChevronRight className="w-5 h-5 text-[#65CCCC]" />
                </Button>
                
                {/* NÚT CHỈNH SỬA ĐÃ BỊ XÓA */}
                {/* <Tooltip content={isEditing ? "Tắt chế độ chỉnh sửa" : "Bật chế độ chỉnh sửa lịch"} placement="bottom" color="foreground">
                  ...
                </Tooltip> */}

              </div>
            </div>
          </CardBody>
        </Card>

        {/* Calendar Grid */}
        <Card className="shadow-2xl border-none bg-white/95 backdrop-blur-md overflow-hidden">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#65CCCC] to-[#4DB8B8]">
                    <th className="p-4 text-left text-white font-bold sticky left-0 bg-[#4DB8B8] min-w-32">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span>Ca làm việc</span>
                      </div>
                    </th>
                    {dayNames.map((day, idx) => (
                      <th key={day} className="p-4 text-center text-white font-bold min-w-40">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-sm font-semibold">{day}</span>
                          <Chip size="sm" variant={isToday(weekDates[idx]) ? "solid" : "flat"}
                            className={isToday(weekDates[idx]) ? "bg-white text-[#65CCCC] font-bold shadow-md" : "bg-white/25 text-white font-medium"}>
                            {formatDisplayDate(weekDates[idx])}
                          </Chip>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-cyan-50/50 transition-colors">
                      <td className="border border-gray-200 p-4 font-bold bg-gradient-to-r from-cyan-50 to-white sticky left-0 z-10">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-800 text-sm">{slot.id.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-500 font-normal flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.time}
                          </span>
                        </div>
                      </td>
                      {weekDates.map((date, idx) => {
                        const schedule = getScheduleForSlot(date, slot.id)
                        
                        // ===== DEBUG LOG 3 =====
                        if (schedule) {
                          console.log(`[DEBUG] Grid Cell Render (${formatDate(date)} @ ${slot.id}):`, schedule)
                        }
                        // =======================

                        const isBusy = schedule?.status === 'BUSY'
                        // const isSelected = selectedCell?.date === formatDate(date) && selectedCell?.slot === slot.id // ĐÃ XÓA
                        return (
                          <td
                            key={idx}
                            className="border border-gray-200 p-3 align-middle bg-white min-h-24"
                          >
                            <div className="flex items-center justify-center h-full">
                              {isBusy ? (
                                // BUSY: show patientName + patientEmail inline (from DTO appointment)
                                <div
                                  onClick={() => handleSelectCell(date, slot.id)} // Luôn cho phép nhấp
                                  className={`px-4 py-2 rounded-lg flex flex-col items-start gap-1 cursor-pointer transition-all text-sm whitespace-normal max-w-xs break-words
                                    bg-yellow-100 border border-yellow-300 hover:border-yellow-400 hover:shadow-lg`} // Xóa logic isSelected, luôn cho phép hover
                                >
                                  {schedule?.appointment ? (
                                    <>
                                      <div className="font-medium text-gray-800">
                                        {schedule.appointment.patientName ?? '—'}
                                      </div>
                                      {schedule.appointment.patientEmail && (
                                        <div className="text-xs text-gray-600">
                                          {schedule.appointment.patientEmail}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-xs text-gray-600 font-medium">Đã đặt</div>
                                  )}
                                </div>
                              ) : (
                                // EMPTY - ĐÃ XÓA LOGIC CHỈNH SỬA
                                <div className="w-14 h-14" />
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Modal (Modal bạn cung cấp) */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg" backdrop="blur">
          <ModalContent className="bg-white">
            <ModalHeader className="text-lg font-bold border-b">Thông tin lịch hẹn</ModalHeader>
            <ModalBody className="space-y-2 text-sm">
              
              {/* ===== DEBUG LOG 5 ===== */}
              {console.log('[DEBUG] Modal Render. selectedAppointment:', selectedAppointment)}
              {/* ======================= */}

              {selectedAppointment ? (
                <>
                  <p><strong>ID:</strong> {selectedAppointment.id}</p>
                  <p><strong>Tên bệnh nhân:</strong> {selectedAppointment.patientName}</p>
                  <p><strong>Email:</strong> {selectedAppointment.patientEmail}</p>
                  <p><strong>Loại khám:</strong> {selectedAppointment.type}</p>
                  <p><strong>Trạng thái:</strong> {selectedAppointment.status}</p>
                  <div className="pt-3">
                    <Button className="bg-blue-600 text-white" onPress={() => openEMR(selectedAppointment)}>
                      Xem EMR
                    </Button>
                  </div>
                </>
              ) : (
                <p>Không có thông tin lịch hẹn.</p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={handleCloseModal}>Đóng</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {loading && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <Spinner color="primary" size="lg" />
          </div>
        )}
      </div>
    </DoctorFrame>
  )
}

export default WorkingHours