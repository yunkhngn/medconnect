import React, { useState, useEffect } from 'react';
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
  Select,      // <--- IMPORT THÊM
  SelectItem   // <--- IMPORT THÊM
} from "@nextui-org/react";


const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all'); 
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAppt, setEditedAppt] = useState(null);

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

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:8080/doctor/dashboard/appointments", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Lỗi tải dữ liệu");
        const data = await res.json();

        setAppointments(Array.isArray(data) ? data : []);
        setFilteredAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi tải lịch hẹn:", err);
      }
    };
    fetchAppointments();
  }, []);

  // debounce search
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(h);
  }, [searchQuery]);

  // ==================================================================
  // CÁC HÀM XỬ LÝ DATE (Không thay đổi)
  // Bạn làm rất tốt khi xử lý nhiều định dạng ngày tháng!
  // Gợi ý: Nếu component này phình to, bạn có thể chuyển 
  // các hàm này (parseDatetimeToTimestamp, extractRawDate, v.v.)
  // ra một file riêng (ví dụ: /lib/dateUtils.js)
  // và import vào để component chính gọn gàng hơn.
  // ==================================================================
  const parseDatetimeToTimestamp = (s) => {
    if (!s) return NaN;
    if (/^\d+$/.test(String(s))) {
      const n = Number(s);
      if (String(n).length === 10) return n * 1000;
      return n;
    }
    let t = String(s).trim();
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
      apt.date, apt.appointment_date, apt.scheduled_at, apt.scheduledAt,
      apt.datetime, apt.start_time, apt.startTime, apt.created_at, apt.createdAt
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
  // ==================================================================
  // HẾT PHẦN XỬ LÝ DATE
  // ==================================================================


  // filtering + sorting (now uses type filter instead of week)
  useEffect(() => {
    const q = (debouncedSearch || '').trim().toLowerCase();

    const filtered = appointments.filter((apt) => {
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

      return matchesSearch && matchesStatus && matchesType;
    });

    filtered.sort((a, b) => getApptTimestamp(a) - getApptTimestamp(b));

    setFilteredAppointments(filtered);
    setPage(1);
  }, [debouncedSearch, selectedType, selectedStatus, appointments]);

  const getStatusColor = (status) => {
    const st = (status || '').toString().toUpperCase();
    return {
      PENDING: 'warning',
      CONFIRMED: 'primary',
      DENIED: 'danger',
      CANCELLED: 'danger',
      ONGOING: 'secondary', // <-- Thay đổi 'info' thành 'secondary' cho nhất quán với NextUI
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
    // Khi mở modal, set editedAppt với dữ liệu chuẩn hóa
    const { date, time } = formatApptDateTime(appointment);
    setEditedAppt({ 
      ...appointment,
      date: date === '—' ? '' : date,
      time: time === '—' ? '' : time,
      type: (appointment.type || 'online').toLowerCase() // Đảm bảo type luôn có giá trị
    });
    setIsEditing(false);
    onOpen();
  };

  // ==================================================================
  // CÁC HÀM API (handleConfirm, handleReject)
  // (Không thay đổi) - Logic của bạn đã chuẩn
  // ==================================================================
  const handleConfirm = async () => {
    if (!selectedAppt) return;
    if (!confirm('Bạn chắc chắn muốn xác nhận lịch hẹn này?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const id = selectedAppt.appointment_id ?? selectedAppt.id;
      const res = await fetch(`/api/doctor/appointments/${id}/confirm`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => (a.appointment_id ?? a.id) === id ? { ...a, status: 'CONFIRMED' } : a));
        onClose();
      } else {
        alert('Xác nhận thất bại');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi khi xác nhận');
    }
  };

  const handleReject = async () => {
    if (!selectedAppt) return;
    if (!confirm('Bạn chắc chắn muốn từ chối lịch hẹn này?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const id = selectedAppt.appointment_id ?? selectedAppt.id;
      const res = await fetch(`/api/doctor/appointments/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => (a.appointment_id ?? a.id) === id ? { ...a, status: 'DENIED' } : a));
        onClose();
      } else {
        alert('Từ chối thất bại');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi khi từ chối');
    }
  };

  const handleViewEMR = (appointment) => {
    if (!appointment) return;
    window.open(`/doctor/emr/${encodeURIComponent(appointment.patientName || appointment.id)}`, '_blank');
  };
  
  // Logic lưu thay đổi (ví dụ)
  const handleSave = async () => {
    if (!editedAppt) return;
    
    // *** THÊM LOGIC VALIDATION Ở ĐÂY ***
    // (ví dụ: kiểm tra ngày giờ)

    console.log("Đang lưu:", editedAppt);
    // try {
    //   const token = await auth.currentUser.getIdToken();
    //   const id = editedAppt.appointment_id ?? editedAppt.id;
    //   const res = await fetch(`/api/doctor/appointments/${id}/update`, {
    //     method: 'PUT',
    //     headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       date: editedAppt.date,
    //       time: editedAppt.time,
    //       type: editedAppt.type
    //     })
    //   });
    //   if (res.ok) {
    //     const updatedAppt = await res.json(); // Giả sử API trả về lịch hẹn đã cập nhật
    //     setAppointments(prev => prev.map(a => (a.appointment_id ?? a.id) === id ? updatedAppt : a));
    //     setSelectedAppt(updatedAppt); // Cập nhật cả state đang xem
    //     setIsEditing(false);
    //   } else {
    //     alert('Cập nhật thất bại');
    //   }
    // } catch (e) {
    //   console.error(e);
    //   alert('Lỗi khi cập nhật');
    // }
    
    // Logic giả lập để test
    setAppointments(prev => prev.map(a => (a.appointment_id ?? a.id) === editedAppt.id ? editedAppt : a));
    setSelectedAppt(editedAppt);
    setIsEditing(false);
  };


  return (
    <DoctorFrame title="Lịch hẹn">
      <div className="space-y-6">
        <Card>
          <CardBody className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* THAY THẾ: Sử dụng Select của NextUI */}
            <Select
              label="Loại"
              placeholder="Chọn loại"
              className="md:col-span-4"
              selectedKeys={[selectedType]}
              onChange={(e) => setSelectedType(e.target.value || 'all')}
            >
              {typeOptions.map(t => (
                <SelectItem key={t.key} value={t.key}>
                  {t.label}
                </SelectItem>
              ))}
            </Select>

            {/* THAY THẾ: Sử dụng Select của NextUI */}
            <Select
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              className="md:col-span-4"
              selectedKeys={[selectedStatus]}
              onChange={(e) => setSelectedStatus(e.target.value || 'all')}
            >
              {statusOptions.map(o => (
                <SelectItem key={o.key} value={o.key}>
                  {o.label}
                </SelectItem>
              ))}
            </Select>

            {/* Giữ nguyên Input của NextUI */}
            <Input
              label="Tìm kiếm"
              placeholder="Nhập tên, ID, email, sđt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              isClearable
              onClear={() => setSearchQuery('')}
              className="md:col-span-4"
            />
          </CardBody>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* TỐI ƯU: Thêm prop `shadow` của NextUI */}
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

        {/* Table */}
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
                <TableColumn>LOẠI</TableColumn>
                <TableColumn>TRẠNG THÁI</TableColumn>
                <TableColumn>HÀNH ĐỘNG</TableColumn>
              </TableHeader>

              {/* TỐI ƯU: Sử dụng `emptyContent` cho trường hợp không có dữ liệu */}
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
                          <Button size="sm" color="primary" variant="flat" onPress={() => handleViewDetails(apt)}>Chi tiết</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center justify-between w-full pr-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">Chi tiết lịch hẹn</span>
                  {selectedAppt && <Chip color={getStatusColor(selectedAppt.status)}>{getStatusLabel(selectedAppt.status)}</Chip>}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && selectedAppt && !['FINISHED', 'CANCELLED', 'DENIED'].includes((selectedAppt.status || '').toString().toUpperCase()) && (
                    <Button size="sm" color="primary" variant="flat" onPress={() => setIsEditing(true)}>Sửa</Button>
                  )}
                  <span className="text-base font-semibold text-primary">{selectedAppt?.appointment_id || selectedAppt?.id}</span>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedAppt && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4"> {/* Đổi màu gradient một chút */}
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
                        {isEditing ? (
                          <Input type="date" value={editedAppt?.date || ''} onChange={(e) => setEditedAppt({ ...editedAppt, date: e.target.value })} size="sm" variant="bordered" />
                        ) : (
                          <p className="font-semibold text-lg">{formatApptDateTime(selectedAppt).date}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Giờ khám</p>
                        {isEditing ? (
                          <Input type="time" value={editedAppt?.time || ''} onChange={(e) => setEditedAppt({ ...editedAppt, time: e.target.value })} size="sm" variant="bordered" />
                        ) : (
                          <p className="font-semibold text-lg">{formatApptDateTime(selectedAppt).time}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Loại khám</p>
                        {isEditing ? (
                          // THAY THẾ: Sử dụng Select của NextUI
                          <Select
                            size="sm"
                            variant="bordered"
                            selectedKeys={[(editedAppt?.type || 'online').toLowerCase()]}
                            onChange={(e) => setEditedAppt({ ...editedAppt, type: e.target.value })}
                          >
                            <SelectItem key="online" value="online">Trực tuyến</SelectItem>
                            <SelectItem key="offline" value="offline">Trực tiếp</SelectItem>
                          </Select>
                        ) : (
                          <Chip color={selectedAppt.type === 'online' ? 'primary' : 'secondary'}>{(selectedAppt.type || '').toString().toUpperCase() === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}</Chip>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                        <p className="font-medium">{selectedAppt.created_at || selectedAppt.createdAt}</p>
                      </div>
                    </div>
                  </div>

                  {selectedAppt.status && selectedAppt.status.toString().toUpperCase() === 'PENDING' && !isEditing && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <p className="text-sm text-yellow-800"><strong>Lưu ý:</strong> Lịch hẹn này đang chờ xác nhận.</p>
                    </div>
                  )}

                  {isEditing && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-sm text-blue-800"><strong>Chế độ chỉnh sửa:</strong> Bạn có thể thay đổi thông tin lịch hẹn. Nhấn "Lưu" để cập nhật.</p>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {isEditing ? (
                <>
                  <Button color="default" variant="flat" onPress={() => { setIsEditing(false); setEditedAppt({ ...selectedAppt }); }}>Hủy</Button>
                  <Button color="primary" onPress={handleSave}>Lưu thay đổi</Button>
                </>
              ) : (
                <>
                  <Button color="secondary" variant="flat" onPress={() => handleViewEMR(selectedAppt)}>Xem EMR</Button>
                  {selectedAppt?.status && selectedAppt.status.toString().toUpperCase() === 'PENDING' && (
                    <>
                      <Button color="danger" variant="flat" onPress={handleReject}>Từ chối</Button>
                      <Button color="success" onPress={handleConfirm}>Xác nhận</Button>
                    </>
                  )}
                  {selectedAppt?.type === 'online' && selectedAppt?.status && selectedAppt.status.toString().toUpperCase() === 'CONFIRMED' && (
                    <Button color="primary" onPress={onClose}>Tham gia</Button> // Cần thêm logic tham gia
                  )}
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DoctorFrame>
  );
};

export default DoctorAppointments;