import React, { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Avatar,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/react";

export default function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([
    { id: 1, patientName: "Nguyễn Văn A", patientEmail: "nva@email.com", date: "2025-10-10", time: "09:00", type: "online", status: "pending" },
    { id: 2, patientName: "Trần Thị B", patientEmail: "ttb@email.com", date: "2025-10-10", time: "10:30", type: "offline", status: "confirmed" },
    { id: 3, patientName: "Lê Văn C", patientEmail: "lvc@email.com", date: "2025-10-11", time: "14:00", type: "online", status: "pending" }
  ]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    setUser({
    displayName: "Bác sĩ Nguyễn",
    email: "bacsi.nguyen@test.com"
  });
    // const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    //   if (currentUser) {
    //     setUser(currentUser);
    //   } else {
    //     window.location.href = "/login";
    //   }
    // });
    // return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAccept = async (id) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: "confirmed" } : apt
    ));
  };

  const handleReject = async (id) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const viewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    onOpen();
  };

  const DashboardTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
        <CardBody className="text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Lịch hẹn hôm nay</p>
              <p className="text-4xl font-bold mt-2">
                {appointments.filter(a => a.status === "pending").length}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600">
        <CardBody className="text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Đã hoàn thành</p>
              <p className="text-4xl font-bold mt-2">
                {appointments.filter(a => a.status === "completed").length}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
        <CardBody className="text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Tổng bệnh nhân</p>
              <p className="text-4xl font-bold mt-2">
                {new Set(appointments.map(a => a.patientEmail)).size}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <h3 className="text-xl font-semibold">Lịch hẹn sắp tới</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-3">
            {appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-default-100 rounded-lg hover:bg-default-200 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar name={apt.patientName[0]} className="bg-primary text-white" />
                  <div>
                    <p className="font-medium">{apt.patientName}</p>
                    <p className="text-sm text-default-500">{apt.date} - {apt.time}</p>
                  </div>
                </div>
                <Chip
                  color={apt.status === "pending" ? "warning" : apt.status === "confirmed" ? "success" : "default"}
                  variant="flat"
                >
                  {apt.status === "pending" ? "Chờ xác nhận" : apt.status === "confirmed" ? "Đã xác nhận" : "Hoàn thành"}
                </Chip>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const AppointmentsTab = () => (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-semibold">Danh sách lịch hẹn</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <Table aria-label="Appointments table">
          <TableHeader>
            <TableColumn>BỆNH NHÂN</TableColumn>
            <TableColumn>THỜI GIAN</TableColumn>
            <TableColumn>LOẠI</TableColumn>
            <TableColumn>TRẠNG THÁI</TableColumn>
            <TableColumn>HÀNH ĐỘNG</TableColumn>
          </TableHeader>
          <TableBody>
            {appointments.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={apt.patientName[0]} size="sm" className="bg-primary text-white" />
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-default-500">{apt.patientEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{apt.date} {apt.time}</TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color={apt.type === "online" ? "primary" : "secondary"}>
                    {apt.type === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={apt.status === "pending" ? "warning" : apt.status === "confirmed" ? "success" : "default"}
                  >
                    {apt.status === "pending" ? "Chờ" : apt.status === "confirmed" ? "Xác nhận" : "Hoàn thành"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {apt.status === "pending" && (
                      <>
                        <Button size="sm" color="success" variant="flat" onPress={() => handleAccept(apt.id)}>
                          Chấp nhận
                        </Button>
                        <Button size="sm" color="danger" variant="flat" onPress={() => handleReject(apt.id)}>
                          Từ chối
                        </Button>
                      </>
                    )}
                    <Button size="sm" color="primary" variant="flat" onPress={() => viewDetails(apt)}>
                      Chi tiết
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );

  const ScheduleTab = () => (
    <Card>
      <CardHeader className="flex justify-between">
        <h3 className="text-xl font-semibold">Lịch làm việc</h3>
        <Button color="primary">Cập nhật lịch</Button>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((day) => (
            <Card key={day} className="border-2">
              <CardHeader>
                <h4 className="font-semibold">{day}</h4>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-default-600">Buổi sáng</span>
                    <span className="font-medium">08:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-600">Buổi chiều</span>
                    <span className="font-medium">14:00 - 18:00</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </CardBody>
    </Card>
  );

  const ProfileTab = () => (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-semibold">Thông tin cá nhân</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="flex items-center gap-6 mb-8">
          <Avatar
            name={user?.displayName?.[0] || "D"}
            className="w-24 h-24 text-large bg-primary text-white"
          />
          <div>
            <h4 className="text-xl font-semibold">{user?.displayName || "Bác sĩ"}</h4>
            <p className="text-default-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            defaultValue={user?.displayName || ""}
          />
          <Input
            label="Email"
            placeholder="email@example.com"
            defaultValue={user?.email || ""}
            isDisabled
          />
          <Input
            label="Số điện thoại"
            placeholder="0912345678"
            type="tel"
          />
          <Select
            label="Chuyên khoa"
            placeholder="Chọn chuyên khoa"
          >
            <SelectItem key="cardiology" value="cardiology">Tim mạch</SelectItem>
            <SelectItem key="dermatology" value="dermatology">Da liễu</SelectItem>
            <SelectItem key="internal" value="internal">Nội khoa</SelectItem>
            <SelectItem key="pediatrics" value="pediatrics">Nhi khoa</SelectItem>
          </Select>
          <Button color="primary" className="w-full">
            Cập nhật thông tin
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-default-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <h1 className="text-xl font-bold text-primary">MedConnect</h1>
            </div>
            <div className="flex items-center gap-4">
              <Avatar name={user?.displayName?.[0] || "D"} size="sm" className="bg-primary text-white" />
              <Button color="danger" variant="light" onPress={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard Bác sĩ</h2>
        
        <Tabs aria-label="Dashboard tabs" color="primary" variant="underlined" size="lg">
          <Tab key="dashboard" title={
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Tổng quan
            </div>
          }>
            <DashboardTab />
          </Tab>
          <Tab key="appointments" title={
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Lịch hẹn
            </div>
          }>
            <AppointmentsTab />
          </Tab>
          <Tab key="schedule" title={
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch làm việc
            </div>
          }>
            <ScheduleTab />
          </Tab>
          <Tab key="profile" title={
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Hồ sơ
            </div>
          }>
            <ProfileTab />
          </Tab>
        </Tabs>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Chi tiết lịch hẹn</ModalHeader>
          <ModalBody>
            {selectedAppointment && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-default-500">Bệnh nhân</p>
                  <p className="font-medium">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Email</p>
                  <p className="font-medium">{selectedAppointment.patientEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Thời gian</p>
                  <p className="font-medium">{selectedAppointment.date} {selectedAppointment.time}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Loại khám</p>
                  <Chip color={selectedAppointment.type === "online" ? "primary" : "secondary"}>
                    {selectedAppointment.type === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </Chip>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}