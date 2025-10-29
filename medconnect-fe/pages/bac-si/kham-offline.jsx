"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import Grid from "@/components/layouts/Grid";
import { Calendar, Stethoscope, Search, Clock, Phone, Mail, Video, MapPin } from "lucide-react";
import { Button, Card, CardBody, CardHeader, Divider, Input, Chip, Select, SelectItem } from "@heroui/react";
import { auth } from "@/lib/firebase";

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

export default function OfflineExamListPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const counts = {
    pending: appointments.filter(a => a.status === "PENDING").length,
    confirmed: appointments.filter(a => a.status === "CONFIRMED").length,
    finished: appointments.filter(a => a.status === "FINISHED").length,
    total: appointments.length,
  };

  const getStatusChip = (s) => {
    const map = { PENDING: { color: "warning", text: "Chờ xác nhận" }, CONFIRMED: { color: "primary", text: "Đã xác nhận" }, FINISHED: { color: "success", text: "Hoàn thành" }, ONGOING: { color: "secondary", text: "Đang khám" } };
    const obj = map[s] || { color: "default", text: s };
    return <Chip size="sm" variant="flat" color={obj.color}>{obj.text}</Chip>;
  };

  const parseReason = (reason) => {
    try {
      if (typeof reason === 'string' && reason.trim().startsWith('{')) {
        const j = JSON.parse(reason);
        const text = j?.reason || "";
        const attachments = Array.isArray(j?.attachments) ? j.attachments : [];
        return { text, attachmentsCount: attachments.length };
      }
    } catch {}
    return { text: typeof reason === 'string' ? reason : '', attachmentsCount: 0 };
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const base = new Date(selectedDate);
        const start = base.toISOString().split('T')[0];
        const endDate = new Date(base); endDate.setDate(base.getDate()+14);
        const end = endDate.toISOString().split('T')[0];
        const url = new URL("http://localhost:8080/api/appointments/doctor");
        url.searchParams.append("startDate", start);
        url.searchParams.append("endDate", end);
        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
        const data = res.ok ? await res.json() : [];
        const offline = (data||[])
          .filter(a => (a.type||"").toUpperCase()==="OFFLINE")
          .filter(a => status === "all" || a.status === status.toUpperCase())
          .filter(a => !q || (a.patient?.name||"").toLowerCase().includes(q.toLowerCase()));
        setAppointments(offline);
      } finally { setLoading(false); }
    };
    load();
  }, [user, selectedDate, status, q]);

  const leftChildren = (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Chờ xác nhận</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{counts.pending}</p>
            </div>
              <div className="w-10 h-10 bg-yellow-300 rounded-full" />
          </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Đã xác nhận</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{counts.confirmed}</p>
                </div>
              <div className="w-10 h-10 bg-blue-300 rounded-full" />
                          </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{counts.finished}</p>
                            </div>
              <div className="w-10 h-10 bg-green-300 rounded-full" />
                              </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-teal-100 uppercase tracking-wide">Tổng lịch hẹn</p>
                <p className="text-4xl font-bold mt-1">{counts.total}</p>
                              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full" />
                              </div>
          </CardBody>
        </Card>
                              </div>
      <Card>
        <CardHeader className="flex items-center gap-2"><Calendar className="text-teal-600" size={20}/><h3 className="font-semibold">Bộ lọc</h3></CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          <Input startContent={<Search size={16} className="text-gray-400"/>} placeholder="Tìm tên bệnh nhân..." value={q} onValueChange={setQ} />
          <Input type="date" label="Từ ngày" labelPlacement="outside" value={selectedDate} onValueChange={setSelectedDate} />
          <Select label="Trạng thái" selectedKeys={[status]} onSelectionChange={(k)=>setStatus(Array.from(k)[0])}>
            <SelectItem key="all">Tất cả</SelectItem>
            <SelectItem key="PENDING">Chờ xác nhận</SelectItem>
            <SelectItem key="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem key="ONGOING">Đang khám</SelectItem>
            <SelectItem key="FINISHED">Hoàn thành</SelectItem>
          </Select>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-gray-700">Ghi chú</h3></CardHeader>
        <CardBody className="text-xs text-gray-600">Danh sách hiển thị lịch offline trong 14 ngày kể từ ngày chọn. Bấm “Bắt đầu khám” để mở form ghi bệnh án.</CardBody>
      </Card>
                            </div>
  );

  const rightChildren = (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Quản lý lịch hẹn</h1>
            <p className="text-sm text-gray-500">{appointments.length} lịch hẹn • {counts.pending} cần xử lý</p>
                            </div>
        </CardHeader>
      </Card>
      {loading ? (
        <Card><CardBody className="text-center py-10 text-gray-500">Đang tải...</CardBody></Card>
      ) : appointments.length === 0 ? (
        <Card><CardBody className="text-center py-10"><Calendar className="mx-auto mb-2 text-gray-400" /><p>Không có lịch hẹn offline</p></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt)=> {
            const pr = parseReason(apt.reason);
            const slotText = SLOT_TIMES[apt.slot] || apt.slot;
            const isPending = apt.status === "PENDING";
            return (
            <Card key={apt.appointmentId} className={`hover:shadow-md transition rounded-2xl border-2 ${isPending ? 'border-yellow-300' : 'border-gray-200'}`}>
              <CardBody className="p-5">
                {/* Header with profile picture, name, and status tags */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img 
                      src={apt.patient?.idPhotoUrl || apt.patient?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient?.name||'BN')}&background=0D9488&color=fff`} 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-400" 
                      alt="avatar"
                    />
                            </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{apt.patient?.name || 'Bệnh nhân'}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusChip(apt.status)}
                      {apt.type === "ONLINE" ? (
                        <Chip size="sm" variant="flat" color="success" startContent={<Video size={12}/>}>Online</Chip>
                      ) : (
                        <Chip size="sm" variant="flat" color="default" startContent={<MapPin size={12}/>}>Tại phòng khám</Chip>
                      )}
                          </div>
                        </div>
                      </div>

                {/* Details grid - 2 columns */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Left column */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ngày khám</p>
                      <p className="font-semibold text-gray-900">{new Date(apt.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  {/* Right column */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Giờ khám</p>
                      <p className="font-semibold text-gray-900">{slotText}</p>
                      </div>
                    </div>
                  {/* Phone */}
                  {apt.patient?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-gray-700">{apt.patient.phone}</span>
                    </div>
                  )}
                  {/* Email */}
                  {apt.patient?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-700 truncate">{apt.patient.email}</span>
                    </div>
                  )}
                  </div>

                {/* Reason section with orange background */}
                {pr.text && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-orange-700 font-medium mb-1">Lý do khám:</p>
                    <p className="text-sm text-gray-900">{pr.text}</p>
                    {pr.attachmentsCount > 0 && (
                      <Chip size="sm" variant="flat" color="warning" className="mt-2">{pr.attachmentsCount} ảnh đính kèm</Chip>
              )}
            </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {apt.status === "PENDING" ? (
                    <>
                      <Button 
                        size="sm" 
                        color="primary" 
                        variant="flat"
                        startContent={<Stethoscope size={16}/>}
                        onClick={() => router.push(`/bac-si/kham-offline/${apt.appointmentId}`)}
                      >
                        Xác nhận
                      </Button>
                    </>
                  ) : apt.status === "CONFIRMED" || apt.status === "ONGOING" ? (
                    <Button 
                      size="sm" 
                      color="primary" 
                      startContent={<Stethoscope size={16}/>}
                      onClick={() => router.push(`/bac-si/kham-offline/${apt.appointmentId}`)}
                    >
                      Bắt đầu khám
                    </Button>
                  ) : null}
                  <Button 
                    size="sm" 
                    variant="flat"
                    onClick={() => router.push(`/bac-si/lich-hen`)}
                  >
                    Xem lịch
                  </Button>
          </div>
              </CardBody>
            </Card>
          );})}
        </div>
              )}
      </div>
  );

  return (
    <DoctorFrame title="Khám offline">
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />
    </DoctorFrame>
  );
}
