import React, { useState, useEffect } from 'react'
import DoctorFrame from '@/components/layouts/Doctor/Frame'
import { Calendar, ChevronLeft, ChevronRight, Clock, Edit2, Plus, Check, X } from 'lucide-react'
import {
  Button, Card, CardBody, Chip, Spinner, Tooltip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure
} from '@heroui/react'
import { auth } from '../../lib/firebase'

const WorkingHours = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)
  const [editStatus, setEditStatus] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const slots = [
    { id: 'SLOT_1', time: '07:30 - 09:50' },
    { id: 'SLOT_2', time: '10:00 - 12:20' },
    { id: 'SLOT_3', time: '12:50 - 15:10' },
    { id: 'SLOT_4', time: '15:20 - 17:40' }
  ]

  const statusOptions = [
    { key: 'BUSY', label: 'Có lịch', icon: '📅', description: 'Ca làm việc có lịch hẹn' },
    { key: 'EMPTY', label: 'Trống', icon: '✨', description: 'Ca làm việc trống' }
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
      if (!user) return
      const token = await user.getIdToken()
      const weekDates = getWeekDates(currentWeek)
      const start = formatDate(weekDates[0])
      const end = formatDate(weekDates[6])

      const response = await fetch(`http://localhost:8080/doctor/dashboard/schedule?start=${start}&end=${end}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      const transformedData = (data || []).map(schedule => ({
        id: schedule.id,
        date: schedule.date,
        slot: schedule.slot,
        status: schedule.status
      }))
      setScheduleData(transformedData)
    } catch (error) {
      console.error('Fetch error:', error)
      alert(`Lỗi: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSchedule() }, [currentWeek])

  const getScheduleForSlot = (date, slotId) => {
    const dateStr = formatDate(date)
    return scheduleData.find(s => s.date === dateStr && s.slot === slotId)
  }

  const handleSelectCell = (date, slotId) => {
    const schedule = getScheduleForSlot(date, slotId)
    setSelectedCell({ date: formatDate(date), slot: slotId, schedule })
    setEditStatus(schedule ? schedule.status : 'BUSY')
    onOpen()
  }

  const handleEditClick = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      setSelectedCell(null)
      setEditStatus(null)
    }
  }

  const handleDelete = async () => {
    if (!selectedCell?.schedule) return
    if (!confirm('Bạn chắc chắn muốn xóa lịch làm việc này?')) return
    try {
      const user = auth.currentUser
      if (!user) return
      const token = await user.getIdToken()
      const response = await fetch(`http://localhost:8080/doctor/dashboard/schedule/${selectedCell.schedule.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to delete schedule')
      onClose()
      setSelectedCell(null)
      await fetchSchedule()
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert(`Lỗi: ${error.message}`)
    }
  }

  const handleSaveStatus = async () => {
    if (!selectedCell || !editStatus) return
    try {
      const user = auth.currentUser
      if (!user) return
      const token = await user.getIdToken()

      if (!selectedCell.schedule) {
        const response = await fetch('http://localhost:8080/doctor/dashboard/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: selectedCell.date,
            slot: selectedCell.slot,
            status: editStatus
          })
        })
        if (!response.ok) throw new Error('Failed to create schedule')
      } else {
        const response = await fetch(`http://localhost:8080/doctor/dashboard/schedule/${selectedCell.schedule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: editStatus })
        })
        if (!response.ok) throw new Error('Failed to update schedule')
      }

      onClose()
      setSelectedCell(null)
      setEditStatus(null)
      await fetchSchedule()
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert(`Lỗi: ${error.message}`)
    }
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const isToday = (date) => date.toDateString() === new Date().toDateString()

  const handleCloseModal = () => {
    onClose()
    setSelectedCell(null)
    setEditStatus(null)
  }

  const weekDates = getWeekDates(currentWeek)
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

  return (
    <DoctorFrame title="Lịch làm việc">
      <div className="p-4 lg:p-6 min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100">

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
                <Tooltip content={isEditing ? "Tắt chế độ chỉnh sửa" : "Bật chế độ chỉnh sửa lịch"} placement="bottom" color="foreground">
                  <Button variant="flat" startContent={<Edit2 className="w-5 h-5" />}
                    onPress={handleEditClick}
                    className={`font-semibold transition-all ${isEditing ? 'bg-blue-500 text-white border-blue-600 shadow-lg' : 'bg-blue-100 text-blue-700 border-blue-300'} border`}>
                    {isEditing ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}
                  </Button>
                </Tooltip>
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
                        const isBusy = schedule?.status === 'BUSY'
                        const isSelected = selectedCell?.date === formatDate(date) && selectedCell?.slot === slot.id
                        return (
                          <td key={idx} className="border border-gray-200 p-3 align-middle bg-white min-h-24">
                            <div className="flex items-center justify-center h-full">
                              {isBusy ? (
                                // ✅ Có lịch
                                <div
                                  onClick={() => isEditing && handleSelectCell(date, slot.id)}
                                  className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all font-semibold text-sm whitespace-nowrap ${
                                    isEditing ? 'hover:shadow-lg hover:scale-105' : 'cursor-default'
                                  } ${isSelected
                                    ? 'bg-yellow-300 border-2 border-yellow-500 shadow-lg ring-2 ring-yellow-200'
                                    : 'bg-yellow-100 border border-yellow-300 hover:border-yellow-400'}`}>
                                  <Calendar className="w-5 h-5 text-yellow-700" />
                                  <span className="text-yellow-800">Có lịch</span>
                                </div>
                              ) : (
                                // ✅ Trống
                                isEditing ? (
                                  <div
                                    onClick={() => handleSelectCell(date, slot.id)}
                                    className={`w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 border-dashed ${isSelected
                                      ? 'bg-blue-100 border-blue-500 shadow-lg ring-2 ring-blue-300 scale-110'
                                      : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                                    <Plus className={`w-6 h-6 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-400'}`} />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14" />
                                )
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

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg" backdrop="blur" classNames={{ backdrop: "bg-black/30 backdrop-blur-md" }}>
          <ModalContent className="bg-white">
            {selectedCell && (
              <>
                <ModalHeader className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedCell.schedule ? 'Chỉnh sửa trạng thái' : 'Thêm lịch làm việc'}
                  </h2>
                  <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </ModalHeader>

                <ModalBody className="py-6 space-y-6">
                  {/* Date & Slot Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-sm">
                      <CardBody className="p-4">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-2">Ngày</p>
                        <p className="text-2xl font-bold text-blue-900">{selectedCell.date}</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-sm">
                      <CardBody className="p-4">
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-2">Ca làm việc</p>
                        <p className="text-2xl font-bold text-purple-900">{selectedCell.slot}</p>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Current Status */}
                  {selectedCell.schedule && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-3">Trạng thái hiện tại</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedCell.schedule.status === 'BUSY' ? '📅' : '✨'}</span>
                        <Chip 
                          color={selectedCell.schedule.status === 'BUSY' ? 'warning' : 'success'}
                          variant="flat"
                          className="font-bold text-sm"
                        >
                          {selectedCell.schedule.status === 'BUSY' ? 'Có lịch' : 'Trống'}
                        </Chip>
                      </div>
                    </div>
                  )}

                  {/* Status Selection */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">Chọn trạng thái</p>
                    <div className="space-y-2">
                      {statusOptions.map((option) => (
                        <div
                          key={option.key}
                          onClick={() => setEditStatus(option.key)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            editStatus === option.key
                              ? option.key === 'BUSY'
                                ? 'bg-yellow-50 border-yellow-400 shadow-md ring-2 ring-yellow-200'
                                : 'bg-green-50 border-green-400 shadow-md ring-2 ring-green-200'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            editStatus === option.key
                              ? 'border-current bg-current'
                              : 'border-gray-300'
                          }`}>
                            {editStatus === option.key && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">
                              <span className="text-lg mr-2">{option.icon}</span>
                              {option.label}
                            </p>
                            <p className="text-xs text-gray-600">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter className="border-t border-gray-200 pt-4 gap-3">
                  {selectedCell.schedule && (
                    <Button 
                      color="danger" 
                      variant="flat" 
                      className="font-semibold"
                      onPress={handleDelete}
                    >
                      Xóa
                    </Button>
                  )}
                  <Button 
                    color="default" 
                    variant="flat" 
                    className="font-semibold"
                    onPress={handleCloseModal}
                  >
                    Hủy
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-[#65CCCC] to-[#4DB8B8] text-white font-semibold hover:shadow-lg transition-all"
                    onPress={handleSaveStatus}
                  >
                    Lưu
                  </Button>
                </ModalFooter>
              </>
            )}
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