import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card, CardBody, CardHeader, Button, Divider, Chip, Spinner
} from "@heroui/react";
import { CreditCard, Calendar, User, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

const SLOT_TIMES = {
  SLOT_1: "07:30 - 09:50",
  SLOT_2: "10:00 - 12:20",
  SLOT_3: "12:50 - 15:10",
  SLOT_4: "15:20 - 17:40"
};

export default function PaymentPage() {
  const router = useRouter();
  const { appointmentId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      router.push("/dang-nhap");
      return;
    }
    if (appointmentId) {
      fetchAppointmentAndPayment();
    }
  }, [user, authLoading, appointmentId]);

  const fetchAppointmentAndPayment = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();

      // Fetch appointment details
      const aptResponse = await fetch(`http://localhost:8080/api/appointments/${appointmentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (aptResponse.ok) {
        const aptData = await aptResponse.json();
        setAppointment(aptData);
      } else {
        toast.error("Không tìm thấy lịch hẹn");
        router.push("/nguoi-dung/lich-hen");
        return;
      }

      // Check payment status
      const paymentResponse = await fetch(`http://localhost:8080/api/payment/appointment/${appointmentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        setPaymentStatus(paymentData);
        
        if (paymentData.hasPaid) {
          toast.success("Lịch hẹn này đã được thanh toán");
          setTimeout(() => router.push("/nguoi-dung/lich-hen"), 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/payment/mock-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: parseInt(appointmentId)
        })
      });

      if (response.ok) {
        toast.success("Thanh toán thành công!");
        setTimeout(() => {
          router.push("/thanh-toan/thanh-cong?appointmentId=" + appointmentId);
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PatientFrame>
    );
  }

  if (!appointment) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardBody className="text-center p-8">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy lịch hẹn</h2>
              <Button color="primary" onClick={() => router.push("/nguoi-dung/lich-hen")}>
                Quay lại
              </Button>
            </CardBody>
          </Card>
        </div>
      </PatientFrame>
    );
  }

  const leftChildren = (
    <div className="space-y-6">
      {/* Payment Info Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <CreditCard className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Thông tin thanh toán</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Phí khám bệnh:</span>
            <span className="text-2xl font-bold text-teal-600">200,000 VND</span>
          </div>
          <Divider />
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Phương thức thanh toán</h4>
            <p className="text-sm text-blue-800">Chuyển khoản ngân hàng qua QR Code</p>
            <p className="text-xs text-blue-600 mt-1">Được cung cấp bởi SePay</p>
          </div>
        </CardBody>
      </Card>

      {/* Security Card */}
      <Card className="bg-gradient-to-br from-green-50 to-teal-50">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-green-900">Thanh toán an toàn</h4>
              <p className="text-sm text-green-800 mt-1">
                Giao dịch được mã hóa và bảo mật bởi SePay
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      {/* Appointment Details Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Calendar className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Chi tiết lịch hẹn</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3">
            <User size={20} className="text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Bác sĩ</p>
              <p className="font-semibold">{appointment.doctor?.name || "N/A"}</p>
              <p className="text-sm text-gray-500">{appointment.doctor?.specialization || "N/A"}</p>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar size={18} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Ngày khám</p>
                <p className="font-medium">{new Date(appointment.date).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock size={18} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Giờ khám</p>
                <p className="font-medium">{SLOT_TIMES[appointment.slot]}</p>
              </div>
            </div>
          </div>

          <Divider />

          <div>
            <p className="text-sm text-gray-600 mb-1">Hình thức khám</p>
            <Chip color={appointment.type === "ONLINE" ? "success" : "warning"} variant="flat">
              {appointment.type === "ONLINE" ? "Khám online" : "Khám tại phòng khám"}
            </Chip>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
            <Chip color="primary" variant="flat">
              {appointment.status === "PENDING" ? "Chờ thanh toán" : appointment.status}
            </Chip>
          </div>
        </CardBody>
      </Card>

      {/* Payment Action Card */}
      <Card className="border-2 border-teal-500">
        <CardBody className="p-6">
          <h3 className="text-xl font-semibold mb-4">Xác nhận thanh toán</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Tổng thanh toán:</span>
              <span className="text-3xl font-bold text-teal-600">200,000 VND</span>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
            <p className="text-sm text-yellow-900">
              <strong>Lưu ý:</strong> Sau khi thanh toán thành công, lịch hẹn của bạn sẽ được xác nhận.
            </p>
          </div>

          <Button
            fullWidth
            color="primary"
            size="lg"
            onClick={handlePayment}
            isLoading={processingPayment}
            endContent={<ArrowRight size={20} />}
          >
            Tiến hành thanh toán
          </Button>

          <Button
            fullWidth
            variant="bordered"
            className="mt-3"
            onClick={() => router.push("/nguoi-dung/lich-hen")}
          >
            Quay lại
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <PatientFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />
    </PatientFrame>
  );
}

