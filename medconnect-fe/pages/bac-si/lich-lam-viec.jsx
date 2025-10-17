import React, { useState, useEffect } from 'react'
import DoctorFrame from '@/components/layouts/Doctor/Frame'
import { Calendar, ChevronLeft, ChevronRight, Clock, Eye, Plus } from 'lucide-react'
import { 
  Button, 
  Card, 
  CardBody,
  Chip,
  Spinner,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import { auth } from '../../lib/firebase'

const WorkingHours = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const slots = [
    { id: 0, time: '7:30-9:00' },
    { id: 1, time: '9:00-10:30' },
    { id: 2, time: '10:30-12:00' },
    { id: 3, time: '13:00-14:30' },
    { id: 4, time: '14:30-16:00' },
    { id: 5, time: '16:00-17:30' },
    { id: 6, time: '18:00-19:30' },
    { id: 7, time: '19:30-21:00' },
    { id: 8, time: '7:30-9:00' },
    { id: 9, time: '9:00-10:30' },
    { id: 10, time: '10:30-12:00' },
    { id: 11, time: '13:00-14:30' },
    { id: 12, time: '14:30-16:00' }
  ]

  const getWeekDates = (date) => {
    const current = new Date(date)
    const monday = new Date(current)
    monday.setDate(current.getDate() - current.getDay() + 1)
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      dates.push(day)
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

  const fetchSchedule = async () => {
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        console.error('No user logged in')
        setLoading(false)
        return
      }
      
      const token = await user.getIdToken()
      const weekDates = getWeekDates(currentWeek)
      const start = formatDate(weekDates[0])
      const end = formatDate(weekDates[6])
      
      console.log('Request info:', { 
        start, 
        end,
        userEmail: user.email,
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 20) + '...'
      })
      
      const response = await fetch(
        `http://localhost:8080/doctor/dashboard/schedule?start=${start}&end=${end}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      )
      
      console.log('Response:', { 
        status: response.status, 
        statusText: response.statusText
      })
      
      if (response.status === 403) {
        const errorText = await response.text()
        console.error('403 Forbidden - Auth issue:', {
          error: errorText,
          suggestion: 'Check if Firebase token is being verified correctly on backend'
        })
        throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.')
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Schedule data received:', data)
      setScheduleData(data || [])
    } catch (error) {
      console.error('Fetch error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // Thông báo lỗi cụ thể
      if (error.message.includes('403') || error.message.includes('quyền')) {
        alert('Lỗi xác thực:\n' + error.message + '\n\nVui lòng:\n1. Đăng xuất và đăng nhập lại\n2. Kiểm tra backend có verify Firebase token đúng không')
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Không thể kết nối tới server.\nKiểm tra backend đang chạy tại: http://localhost:8080')
      } else {
        alert(`Lỗi: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [currentWeek])

  const getScheduleForSlot = (date, slotIndex) => {
    const dateStr = formatDate(date)
    return scheduleData.find(
      s => s.date === dateStr && s.slot === `SLOT_${slotIndex}`
    )
  }

  const handleStatusToggle = async (schedule) => {
    if (!schedule || !schedule.id) return
    
    try {
      const user = auth.currentUser
      if (!user) {
        console.error('No user logged in')
        return
      }
      
      const token = await user.getIdToken()
      const newStatus = schedule.status === 'BUSY' ? 'EMPTY' : 'BUSY'
      const response = await fetch(`http://localhost:8080/doctor/dashboard/schedule/${schedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update schedule')
      
      await fetchSchedule()
    } catch (error) {
      console.error('Error updating schedule:', error)
    }
  }

  const handleViewMaterials = (schedule) => {
    setSelectedSchedule(schedule)
    onOpen()
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const weekDates = getWeekDates(currentWeek)
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

  return (
    <DoctorFrame title="Lịch làm việc">
      <div className="p-4 lg:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header Section */}
        <Card className="mb-6 shadow-lg border-none bg-white/80 backdrop-blur">
          <CardBody>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Lịch làm việc tuần
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  variant="flat"
                  onPress={() => navigateWeek(-1)}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  color="primary"
                  variant="shadow"
                  onPress={() => setCurrentWeek(new Date())}
                  className="font-semibold"
                >
                  Hôm nay
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  onPress={() => navigateWeek(1)}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Calendar Grid */}
        <Card className="shadow-xl border-none bg-white/90 backdrop-blur">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <th className="border-r border-blue-500 p-4 text-left text-white font-bold min-w-32">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Ca làm việc
                      </div>
                    </th>
                    {dayNames.map((day, idx) => (
                      <th key={day} className="border-r border-blue-500 last:border-r-0 p-4 text-center text-white font-bold min-w-40">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm">{day}</span>
                          <Chip
                            size="sm"
                            variant={isToday(weekDates[idx]) ? "solid" : "flat"}
                            color={isToday(weekDates[idx]) ? "warning" : "default"}
                            className={isToday(weekDates[idx]) ? "font-bold" : "bg-white/20 text-white"}
                          >
                            {formatDisplayDate(weekDates[idx])}
                          </Chip>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot, slotIdx) => (
                    <tr key={slotIdx} className="hover:bg-blue-50/50 transition-colors">
                      <td className="border p-4 font-semibold bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex flex-col">
                          <span className="text-gray-800">Slot {slot.id}</span>
                          <span className="text-xs text-gray-500 mt-1">{slot.time}</span>
                        </div>
                      </td>
                      {weekDates.map((date, dateIdx) => {
                        const schedule = getScheduleForSlot(date, slot.id)
                        const isBusy = schedule?.status === 'BUSY'
                        
                        return (
                          <td
                            key={dateIdx}
                            className="border p-3 align-top"
                          >
                            {schedule ? (
                              <div className="flex flex-col gap-2">
                                {isBusy ? (
                                  <>
                                    <Chip
                                      color="warning"
                                      variant="flat"
                                      size="sm"
                                      className="font-semibold"
                                    >
                                      Có lịch
                                    </Chip>
                                    <Button
                                      size="sm"
                                      color="primary"
                                      variant="flat"
                                      startContent={<Eye className="w-4 h-4" />}
                                      onPress={() => handleViewMaterials(schedule)}
                                      className="w-full font-medium"
                                    >
                                      Xem tài liệu
                                    </Button>
                                    <Button
                                      size="sm"
                                      color="success"
                                      variant="bordered"
                                      onPress={() => handleStatusToggle(schedule)}
                                      className="w-full font-medium"
                                    >
                                      EduNext
                                    </Button>
                                    <Chip
                                      color="success"
                                      variant="dot"
                                      size="sm"
                                      className="text-xs"
                                    >
                                      Đã tham gia
                                    </Chip>
                                  </>
                                ) : (
                                  <>
                                    <Chip
                                      color="default"
                                      variant="flat"
                                      size="sm"
                                      className="font-semibold"
                                    >
                                      Trống
                                    </Chip>
                                    <Tooltip content="Đánh dấu ca này là bận">
                                      <Button
                                        size="sm"
                                        color="default"
                                        variant="bordered"
                                        startContent={<Plus className="w-4 h-4" />}
                                        onPress={() => handleStatusToggle(schedule)}
                                        className="w-full"
                                      >
                                        Đặt lịch
                                      </Button>
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                <span>-</span>
                              </div>
                            )}
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

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6">
              <CardBody className="flex flex-col items-center gap-4">
                <Spinner size="lg" color="primary" />
                <p className="text-gray-600 font-medium">Đang tải lịch làm việc...</p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Materials Modal */}
        <Modal 
          isOpen={isOpen} 
          onClose={onClose}
          size="2xl"
          backdrop="blur"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Tài liệu học tập
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedSchedule ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Ngày</p>
                      <p className="font-semibold">{selectedSchedule.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ca làm việc</p>
                      <p className="font-semibold">{selectedSchedule.slot}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-center text-gray-600">
                      Tính năng xem tài liệu đang được phát triển
                    </p>
                  </div>
                </div>
              ) : (
                <p>Không có thông tin</p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Đóng
              </Button>
              <Button color="primary" onPress={onClose}>
                Xác nhận
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DoctorFrame>
  )
}

export default WorkingHours