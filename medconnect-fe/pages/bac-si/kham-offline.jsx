"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Stethoscope,
  MapPin,
  Search,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PatientFrame from "@/components/layouts/Doctor/Frame";

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} patient_name
 * @property {string} patient_id
 * @property {string} patient_phone
 * @property {number} patient_age
 * @property {string} patient_gender
 * @property {string} appointment_date
 * @property {string} appointment_time
 * @property {string} slot
 * @property {"waiting" | "in_progress" | "completed" | "cancelled"} status
 * @property {string} chief_complaint
 * @property {"offline"} visit_type
 * @property {number} appointment_number
 */

export default function PatientSchedulePage() {
  /** @type {[Appointment[], Function]} */
  const [appointments, setAppointments] = useState([
    {
      id: "1",
      patient_name: "Nguyễn Văn An",
      patient_id: "BN001",
      patient_phone: "0912345678",
      patient_age: 35,
      patient_gender: "Nam",
      appointment_date: "2025-10-25",
      appointment_time: "08:00",
      slot: "Ca 1",
      status: "waiting",
      chief_complaint: "Đau đầu, chóng mặt",
      visit_type: "offline",
      appointment_number: 1,
    },
    {
      id: "2",
      patient_name: "Trần Thị Bình",
      patient_id: "BN002",
      patient_phone: "0987654321",
      patient_age: 42,
      patient_gender: "Nữ",
      appointment_date: "2025-10-25",
      appointment_time: "08:30",
      slot: "Ca 1",
      status: "waiting",
      chief_complaint: "Ho, sốt nhẹ",
      visit_type: "offline",
      appointment_number: 2,
    },
    {
      id: "3",
      patient_name: "Lê Minh Cường",
      patient_id: "BN003",
      patient_phone: "0901234567",
      patient_age: 28,
      patient_gender: "Nam",
      appointment_date: "2025-10-25",
      appointment_time: "09:00",
      slot: "Ca 2",
      status: "waiting",
      chief_complaint: "Đau dạ dày",
      visit_type: "offline",
      appointment_number: 3,
    },
    {
      id: "4",
      patient_name: "Phạm Thu Hà",
      patient_id: "BN004",
      patient_phone: "0923456789",
      patient_age: 31,
      patient_gender: "Nữ",
      appointment_date: "2025-10-25",
      appointment_time: "10:00",
      slot: "Ca 3",
      status: "waiting",
      chief_complaint: "Khám định kỳ",
      visit_type: "offline",
      appointment_number: 4,
    },
  ]);

  const [selectedDate, setSelectedDate] = useState("2025-10-25");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAppointments = appointments.filter((apt) => {
    const matchesDate = apt.appointment_date === selectedDate;
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    const matchesSearch =
      apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "waiting":
        return "Đang chờ";
      case "in_progress":
        return "Đang khám";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleStartConsultation = (appointmentId) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, status: "in_progress" }
          : apt
      )
    );
  };

  return (
    <PatientFrame title="Lịch khám bệnh nhân">
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Bảng thống kê bên trái */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Thống kê ca khám
              </h2>

              <div className="space-y-4">
                {[
                  { key: "waiting", label: "Đang chờ", color: "amber" },
                  { key: "in_progress", label: "Đang khám", color: "blue" },
                  { key: "completed", label: "Hoàn thành", color: "emerald" },
                  { key: "all", label: "Tổng ca", color: "teal" },
                ].map((status) => (
                  <button
                    key={status.key}
                    onClick={() => setFilterStatus(status.key)}
                    className={`w-full rounded-xl p-4 border-2 transition-all duration-200 text-left ${
                      filterStatus === status.key
                        ? `bg-${status.color}-50 border-${status.color}-300 shadow-md`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-${status.color}-700 font-semibold`}
                      >
                        {status.label}
                      </p>
                      <span className="font-bold text-gray-900">
                        {
                          appointments.filter(
                            (a) =>
                              (status.key === "all" ||
                                a.status === status.key) &&
                              a.appointment_date === selectedDate
                          ).length
                        }
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danh sách ca khám bên phải */}
        <div className="col-span-12 xl:col-span-9 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Quản lý ca khám trực tiếp
            </h2>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-teal-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <input
              type="text"
              placeholder="Tìm tên hoặc mã bệnh nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />

            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="mx-auto mb-3 text-gray-400" size={40} />
                  Không có lịch khám nào trong ngày
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xl font-bold">
                              #{appointment.appointment_number}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {appointment.patient_name}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {getStatusText(appointment.status)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User size={16} className="text-gray-400" />
                                <span>{appointment.patient_id}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={16} className="text-gray-400" />
                                <span>{appointment.patient_phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={16} className="text-gray-400" />
                                <span>
                                  {appointment.patient_age} tuổi -{" "}
                                  {appointment.patient_gender}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock size={16} className="text-gray-400" />
                                <span>
                                  {appointment.slot} -{" "}
                                  {appointment.appointment_time}
                                </span>
                              </div>
                            </div>

                            <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                              <p className="text-sm text-gray-600 mb-1 font-medium">
                                Lý do khám:
                              </p>
                              <p className="text-gray-900">
                                {appointment.chief_complaint}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() =>
                            handleStartConsultation(appointment.id)
                          }
                          disabled={
                            appointment.status === "completed" ||
                            appointment.status === "cancelled"
                          }
                          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                            appointment.status === "waiting"
                              ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-sm"
                              : appointment.status === "in_progress"
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Stethoscope size={18} />
                          {appointment.status === "waiting" && "Bắt đầu khám"}
                          {appointment.status === "in_progress" && "Đang khám"}
                          {appointment.status === "completed" &&
                            "Đã hoàn thành"}
                          {appointment.status === "cancelled" && "Đã hủy"}
                        </button>

                        <button className="py-3 px-6 border-2 border-teal-500 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all duration-200 flex items-center gap-2">
                          <FileText size={18} />
                          Xem hồ sơ
                        </button>

                        <button className="w-12 h-12 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PatientFrame>
  );
}
