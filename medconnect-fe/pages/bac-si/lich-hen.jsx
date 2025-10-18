import React, { useState, useEffect, useCallback } from 'react';
import DoctorFrame from '@/components/layouts/Doctor/Frame';
import { auth } from '@/lib/firebase';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Pagination,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem
} from "@nextui-org/react";

const SLOTS = {
  SLOT_1: { label: 'Slot 1', start: '07:30', end: '09:50' },
  SLOT_2: { label: 'Slot 2', start: '10:00', end: '12:20' },
  SLOT_3: { label: 'Slot 3', start: '12:50', end: '15:10' },
  SLOT_4: { label: 'Slot 4', start: '15:20', end: '17:40' }
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  const statusOptions = [
    { key: 'all', label: 'Tất cả trạng thái' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'DENIED', label: 'Bị từ chối' },
    { key: 'CANCELLED', label: 'Đã hủy' },
    { key: 'ONGOING', label: 'Đang diễn ra' },
    { key: 'FINISHED', label: 'Hoàn thành' }
  ];

  const typeOptions = [
    { key: 'all', label: 'Tất cả loại' },
    { key: 'online', label: 'Trực tuyến' },
    { key: 'offline', label: 'Trực tiếp' }
  ];

  const timeRangeOptions = [
    { key: 'all', label: 'Tất cả' },
    { key: 'history', label: 'Lịch sử' },
    { key: 'today', label: 'Hôm nay' },
    { key: 'future', label: 'Tương lai' }
  ];

  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLocalDateAtMidnight = (date = new Date()) => {
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    return localDate;
  };

  // fetchAppointments được tách ra để có thể gọi lại sau patch
  const fetchAppointments = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:8080/doctor/dashboard/appointments", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Lỗi tải dữ liệu");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setAppointments(arr);
      // setFilteredAppointments sẽ được set bởi useEffect filter (dưới)
    } catch (err) {
      console.error("Lỗi khi tải lịch hẹn:", err);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(h);
  }, [searchQuery]);

  const parseDatetimeToTimestamp = (s) => {
    if (!s) return NaN;
    if (/^\d+$/.test(String(s))) {
      const n = Number(s);
      if (String(n).length === 10) return n * 1000;
      return n;
    }
    let t = String(s).trim();

    const ddmmyyyyRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const ddmmMatch = t.match(ddmmyyyyRegex);
    if (ddmmMatch) {
      const [, day, month, year] = ddmmMatch;
      t = `${year}-${month}-${day}`;
    }

    const spaceWithFracRegex = /^(\d{4}-\d{2}-\d{2})[ ]+(\d{2}:\d{2}:\d{2})(\.\d+)?(Z)?$/;
    const m = t.match(spaceWithFracRegex);
    if (m) {
      const datePart = m[1];
      const timePart = m[2];
      const frac = m[3] || '';
      const z = m[4] || '';
      let ms = '';
      if (frac) {
        const digits = frac.slice(1);
        ms = '.' + (digits.slice(0, 3).padEnd(3, '0'));
      }
      const normalized = `${datePart}T${timePart}${ms}${z}`;
      const parsed = Date.parse(normalized);
      if (!isNaN(parsed)) return parsed;
      const parsed2 = Date.parse(`${datePart}T${timePart}${z}`);
      if (!isNaN(parsed2)) return parsed2;
    }
    if (t.includes(' ') && !t.includes('T')) {
      const replaced = t.replace(' ', 'T');
      const parsed = Date.parse(replaced);
      if (!isNaN(parsed)) return parsed;
    }
    const direct = Date.parse(t);
    if (!isNaN(direct)) return direct;
    return NaN;
  };

  const extractRawDate = (apt) => {
    if (!apt) return null;
    const candidates = [
      apt.date,
      apt.appointment_date,
      apt.scheduled_at,
      apt.scheduledAt,
      apt.datetime,
      apt.start_time,
      apt.startTime
    ];
    for (const c of candidates) {
      if (c !== undefined && c !== null && c !== '') return c;
    }
    if (typeof apt.date === 'object' && apt.date !== null) {
      if ('seconds' in apt.date) {
        try { const sec = Number(apt.date.seconds); if (!isNaN(sec)) return sec * 1000; } catch (e) {}
      }
      if ('value' in apt.date) return apt.date.value;
      if ('toString' in apt.date && typeof apt.date.toString === 'function') {
        const s = apt.date.toString(); if (s && s !== '[object Object]') return s;
      }
    }
    return null;
  };

  const getApptTimestamp = (apt) => {
    if (!apt) return 0;
    const raw = extractRawDate(apt);
    if (raw !== null && raw !== undefined) {
      const ts = parseDatetimeToTimestamp(raw);
      if (!isNaN(ts)) return ts;
    }
    if (apt.date) {
      const combined = apt.time ? `${apt.date} ${apt.time}` : apt.date;
      const ts2 = parseDatetimeToTimestamp(combined);
      if (!isNaN(ts2)) return ts2;
    }
    const created = apt.createdAt ?? apt.created_at;
    if (created) {
      const ts3 = parseDatetimeToTimestamp(created);
      if (!isNaN(ts3)) return ts3;
    }
    return 0;
  };

  const formatApptDateTime = (apt) => {
    const raw = extractRawDate(apt);
    if (!raw && !(apt && (apt.date || apt.time))) return { date: '—', time: '—' };
    if (raw) {
      if (typeof raw === 'number' || (/^\d+$/.test(String(raw)))) {
        const ts = parseDatetimeToTimestamp(raw);
        if (!isNaN(ts)) {
          const d = new Date(ts);
          const datePart = d.toISOString().split('T')[0];
          const timePart = d.toTimeString().split(' ')[0];
          return { date: datePart, time: timePart };
        }
      }
      const s = String(raw).trim();
      if (s.includes('T')) {
        const [datePart, timePart] = s.split('T');
        const time = timePart ? timePart.split('.')[0].slice(0, 8) : '00:00:00';
        return { date: datePart, time };
      }
      if (s.includes(' ')) {
        const [datePart, timePart] = s.split(' ');
        const time = timePart ? timePart.split('.')[0].slice(0, 8) : '00:00:00';
        return { date: datePart, time };
      }
    }
    if (apt.date) {
      const dateStr = String(apt.date);
      const timeStr = apt.time ? String(apt.time).split('.')[0].slice(0, 8) : '00:00:00';
      return { date: dateStr.split('T')[0].split(' ')[0], time: timeStr };
    }
    return { date: '—', time: '—' };
  };

  const getSlotLabel = (timeStr) => {
    if (!timeStr || timeStr === '—') return '—';
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '—';
    const appointmentTime = hours * 60 + minutes;

    for (const [slotKey, slot] of Object.entries(SLOTS)) {
      const [slotHours, slotMins] = slot.start.split(':').map(Number);
      const slotStart = slotHours * 60 + slotMins;
      const [slotEndHours, slotEndMins] = slot.end.split(':').map(Number);
      const slotEnd = slotEndHours * 60 + slotEndMins;

      if (appointmentTime >= slotStart && appointmentTime <= slotEnd) {
        return slot.label;
      }
    }
    return '—';
  };

  const isInTimeRange = (aptDate, range) => {
    if (!aptDate) return range === 'all';

    const ts = parseDatetimeToTimestamp(aptDate);
    if (isNaN(ts)) return range === 'all';

    const aptDateObj = new Date(ts);
    const aptDateStr = getLocalDateString(aptDateObj);
    const todayDateStr = getLocalDateString();
    const todayDate = getLocalDateAtMidnight();

    if (range === 'all') {
      return true;
    } else if (range === 'today') {
      return aptDateStr === todayDateStr;
    } else if (range === 'history') {
      return aptDateObj < todayDate;
    } else if (range === 'future') {
      const tomorrowDate = new Date(todayDate);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      return aptDateObj >= tomorrowDate;
    }

    return false;
  };

  const applyFiltersFromAppointments = (appts) => {
    const q = (debouncedSearch || '').trim().toLowerCase();

    const filtered = (appts || []).filter((apt) => {
      const matchesSearch = q === '' ? true : (
        (String(apt.patientName || '')).toLowerCase().includes(q) ||
        (String(apt.patientEmail || '')).toLowerCase().includes(q) ||
        (String(apt.patientPhone || '')).toLowerCase().includes(q) ||
        String(apt.appointment_id ?? apt.id ?? '').toLowerCase().includes(q) ||
        String(extractRawDate(apt) ?? '').toLowerCase().includes(q)
      );

      const matchesStatus = selectedStatus === 'all' ||
        ((apt.status || '').toString().toUpperCase() === selectedStatus.toString().toUpperCase());

      const aptType = (apt.type || '').toString().toLowerCase();
      const matchesType = selectedType === 'all' || aptType === selectedType.toString().toLowerCase();

      const matchesTimeRange = isInTimeRange(extractRawDate(apt), selectedTimeRange);

      return matchesSearch && matchesStatus && matchesType && matchesTimeRange;
    });

    filtered.sort((a, b) => getApptTimestamp(a) - getApptTimestamp(b));
    return filtered;
  };

  // đồng bộ filteredAppointments mỗi khi appointments hoặc filter thay đổi
  useEffect(() => {
    setFilteredAppointments(applyFiltersFromAppointments(appointments));
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedType, selectedStatus, selectedTimeRange, appointments]);

  const getStatusColor = (status) => {
    const st = (status || '').toString().toUpperCase();
    return {
      PENDING: 'warning',
      CONFIRMED: 'primary',
      DENIED: 'danger',
      CANCELLED: 'danger',
      ONGOING: 'secondary',
      FINISHED: 'success'
    }[st] || 'default';
  };

  const getStatusLabel = (status) => {
    const st = (status || '').toString().toUpperCase();
    return {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      DENIED: 'Bị từ chối',
      CANCELLED: 'Đã hủy',
      ONGOING: 'Đang diễn ra',
      FINISHED: 'Hoàn thành'
    }[st] || status;
  };

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / rowsPerPage));

  const handleViewDetails = (appointment) => {
    setSelectedAppt(appointment);
    onOpen();
  };

  // cập nhật trong state appointments + sync filteredAppointments
  const updateAppointmentInState = (id, newValueOrFn) => {
    setAppointments(prev => {
      const next = prev.map(a => {
        const key = a.appointment_id ?? a.id;
        if (key === id) {
          return typeof newValueOrFn === 'function' ? newValueOrFn(a) : newValueOrFn;
        }
        return a;
      });
      setFilteredAppointments(applyFiltersFromAppointments(next));
      return next;
    });
  };

  // Khi user nói "fetch lại đi" - ta thực hiện refetch bắt buộc sau patch thành công
  const handleConfirm = async () => {
    if (!selectedAppt) return;
    if (!confirm("Bạn chắc chắn muốn xác nhận lịch hẹn này?")) return;

    const id = selectedAppt.appointment_id ?? selectedAppt.id;
    const original = appointments.find(a => (a.appointment_id ?? a.id) === id) ?? selectedAppt;
    const optimistic = { ...original, status: "CONFIRMED" };

    // optimistic UI ngay
    updateAppointmentInState(id, optimistic);
    setSelectedAppt(optimistic);
    setIsMutating(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const appointmentDTO = { ...original, status: "CONFIRMED" };

      const res = await fetch(`http://localhost:8080/doctor/dashboard/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointmentDTO)
      });

      if (res.ok) {
        // bất chấp optimistic, ta sẽ fetch lại list từ server để đảm bảo consistency (giải pháp bạn yêu cầu)
        await fetchAppointments();
        // cập nhật selectedAppt bằng data server (nếu muốn lấy chi tiết, có thể lấy từ response)
        try {
          const updated = await res.json();
          setSelectedAppt(updated);
        } catch {
          // nếu response không trả body, bỏ qua
        }
        onClose();
      } else {
        // revert
        updateAppointmentInState(id, original);
        setSelectedAppt(original);
        alert("Xác nhận thất bại");
      }
    } catch (e) {
      console.error(e);
      updateAppointmentInState(id, original);
      setSelectedAppt(original);
      alert("Lỗi khi xác nhận");
    } finally {
      setIsMutating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAppt) return;
    if (!confirm("Bạn chắc chắn muốn từ chối lịch hẹn này?")) return;

    const id = selectedAppt.appointment_id ?? selectedAppt.id;
    const original = appointments.find(a => (a.appointment_id ?? a.id) === id) ?? selectedAppt;
    const optimistic = { ...original, status: "DENIED" };

    updateAppointmentInState(id, optimistic);
    setSelectedAppt(optimistic);
    setIsMutating(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const appointmentDTO = { ...original, status: "DENIED" };

      const res = await fetch(`http://localhost:8080/doctor/dashboard/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointmentDTO)
      });

      if (res.ok) {
        // refetch authoritative list
        await fetchAppointments();
        try {
          const updated = await res.json();
          setSelectedAppt(updated);
        } catch {
          // ignore
        }
        onClose();
      } else {
        updateAppointmentInState(id, original);
        setSelectedAppt(original);
        alert("Từ chối thất bại");
      }
    } catch (e) {
      console.error(e);
      updateAppointmentInState(id, original);
      setSelectedAppt(original);
      alert("Lỗi khi từ chối");
    } finally {
      setIsMutating(false);
    }
  };

  const handleViewEMR = (appointment) => {
    if (!appointment) return;
    window.open(`/doctor/emr/${encodeURIComponent(appointment.patientName || appointment.id)}`, '_blank');
  };

  return (
    <DoctorFrame title="Lịch hẹn">
      <div className="space-y-6">
        <Card>
          <CardBody className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <Select
              label="Loại"
              placeholder="Chọn loại"
              className="md:col-span-2"
              selectedKeys={[selectedType]}
              onChange={(e) => setSelectedType(e.target.value || 'all')}
            >
              {typeOptions.map(t => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
            </Select>

            <Select
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              className="md:col-span-3"
              selectedKeys={[selectedStatus]}
              onChange={(e) => setSelectedStatus(e.target.value || 'all')}
            >
              {statusOptions.map(o => (
                <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
              ))}
            </Select>

            <Select
              label="Thời gian"
              placeholder="Chọn thời gian"
              className="md:col-span-2"
              selectedKeys={[selectedTimeRange]}
              onChange={(e) => setSelectedTimeRange(e.target.value || 'all')}
            >
              {timeRangeOptions.map(t => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
            </Select>

            <Input
              label="Tìm kiếm"
              placeholder="Nhập tên, ID, email, sđt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              isClearable
              onClear={() => setSearchQuery('')}
              className="md:col-span-5"
            />
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card shadow="sm" className="border-l-4 border-warning">
            <CardBody className="p-4">
              <p className="text-sm text-gray-600 mb-1">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-warning">{appointments.filter(a => (a.status || '').toString().toUpperCase() === 'PENDING').length}</p>
            </CardBody>
          </Card>

          <Card shadow="sm" className="border-l-4 border-primary">
            <CardBody className="p-4">
              <p className="text-sm text-gray-600 mb-1">Đã xác nhận</p>
              <p className="text-2xl font-bold text-primary">{appointments.filter(a => (a.status || '').toString().toUpperCase() === 'CONFIRMED').length}</p>
            </CardBody>
          </Card>

          <Card shadow="sm" className="border-l-4 border-success">
            <CardBody className="p-4">
              <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
              <p className="text-2xl font-bold text-success">{appointments.filter(a => (a.status || '').toString().toUpperCase() === 'FINISHED').length}</p>
            </CardBody>
          </Card>

          <Card shadow="sm" className="border-l-4 border-danger">
            <CardBody className="p-4">
              <p className="text-sm text-gray-600 mb-1">Đã hủy / từ chối</p>
              <p className="text-2xl font-bold text-danger">{appointments.filter(a => {
                const s = (a.status || '').toString().toUpperCase();
                return s === 'CANCELLED' || s === 'DENIED';
              }).length}</p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody className="p-0">
            <Table
              aria-label="Appointments"
              bottomContent={totalPages > 1 && (
                <div className="flex justify-center py-3">
                  <Pagination color="primary" page={page} total={totalPages} onChange={setPage} />
                </div>
              )}
            >
              <TableHeader>
                <TableColumn>MÃ LỊCH HẸN</TableColumn>
                <TableColumn>BỆNH NHÂN</TableColumn>
                <TableColumn>NGÀY GIỜ</TableColumn>
                <TableColumn>SLOT</TableColumn>
                <TableColumn>LOẠI</TableColumn>
                <TableColumn>TRẠNG THÁI</TableColumn>
                <TableColumn>HÀNH ĐỘNG</TableColumn>
              </TableHeader>

              <TableBody
                items={paginatedAppointments}
                emptyContent={
                  <div className="text-center text-gray-500 py-6">
                    Không có lịch hẹn phù hợp.
                  </div>
                }
              >
                {(apt) => {
                  const id = apt.appointment_id ?? apt.id ?? '—';
                  const patientName = apt.patientName ?? '—';
                  const typeUpper = String(apt.type || '').toUpperCase();
                  const typeLabel = typeUpper === 'ONLINE' ? 'Trực tuyến' : (typeUpper === 'OFFLINE' || typeUpper === 'INPERSON' ? 'Trực tiếp' : (apt.type || '—'));
                  const { date, time } = formatApptDateTime(apt);
                  const slotLabel = getSlotLabel(time);

                  return (
                    <TableRow key={id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">{id}</p>
                          <p className="text-xs text-gray-500">Đặt: {apt.created_at || apt.createdAt || '—'}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={(patientName || 'U')[0]} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{patientName}</p>
                            {apt.patientEmail && <p className="text-xs text-gray-500 truncate">{apt.patientEmail}</p>}
                            {apt.patientPhone && <p className="text-xs text-gray-500 truncate">{apt.patientPhone}</p>}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{date}</p>
                          <p className="text-xs text-gray-600">{time}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Chip size="sm" color="secondary" variant="flat">
                          {slotLabel}
                        </Chip>
                      </TableCell>

                      <TableCell>
                        <Chip size="sm" color={typeUpper === 'ONLINE' ? 'primary' : 'secondary'} variant="flat">
                          {typeLabel}
                        </Chip>
                      </TableCell>

                      <TableCell>
                        <Chip size="sm" color={getStatusColor(apt.status)} variant="flat">
                          {getStatusLabel(apt.status)}
                        </Chip>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" color="primary" variant="flat" onPress={() => handleViewDetails(apt)}>
                            Chi tiết
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center justify-between w-full pr-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">Chi tiết lịch hẹn</span>
                  {selectedAppt && <Chip color={getStatusColor(selectedAppt.status)}>{getStatusLabel(selectedAppt.status)}</Chip>}
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              {selectedAppt && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Thông tin bệnh nhân</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                        <p className="font-semibold">{selectedAppt.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium">{selectedAppt.patientEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                        <p className="font-medium">{selectedAppt.patientPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Chi tiết lịch hẹn</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Ngày khám</p>
                        <p className="font-semibold text-lg">{formatApptDateTime(selectedAppt).date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Giờ khám</p>
                        <p className="font-semibold text-lg">{formatApptDateTime(selectedAppt).time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Slot</p>
                        <p className="font-semibold">{getSlotLabel(formatApptDateTime(selectedAppt).time)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                        <p className="font-medium">{selectedAppt.created_at || selectedAppt.createdAt}</p>
                      </div>
                    </div>
                  </div>

                  {selectedAppt.status && selectedAppt.status.toString().toUpperCase() === 'PENDING' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <p className="text-sm text-yellow-800"><strong>Lưu ý:</strong> Lịch hẹn này đang chờ xác nhận.</p>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button color="secondary" variant="flat" onPress={() => handleViewEMR(selectedAppt)}>
                Xem EMR
              </Button>
              {selectedAppt?.status && selectedAppt.status.toString().toUpperCase() === 'PENDING' && (
                <>
                  <Button color="danger" variant="flat" onPress={handleReject} disabled={isMutating}>
                    Từ chối
                  </Button>
                  <Button color="success" onPress={handleConfirm} disabled={isMutating}>
                    Xác nhận
                  </Button>
                </>
              )}
              {selectedAppt?.type === 'online' && selectedAppt?.status && selectedAppt.status.toString().toUpperCase() === 'CONFIRMED' && (
                <Button color="primary" onPress={onClose}>Tham gia</Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DoctorFrame>
  );
};

export default DoctorAppointments;