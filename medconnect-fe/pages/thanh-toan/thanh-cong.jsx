import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { CheckCircle, Calendar, Home, AlertCircle } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { generateAppointmentPendingEmail } from "@/utils/emailTemplates";
import { sendEmailViaAPI } from "@/utils/emailHelper";

export default function PaymentSuccess() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    paymentId, 
    status, 
    amount,
    vnp_TxnRef,
    vnp_Amount,
    vnp_OrderInfo,
    vnp_PayDate,
    vnp_BankCode,
    vnp_TransactionNo,
    vnp_ResponseCode,
    appointmentId
  } = router.query;

  useEffect(() => {
    const confirmPayment = async () => {
      if (!router.isReady || !vnp_ResponseCode) return;

      try {
        // Gọi backend để confirm và update payment status
        console.log("Confirming payment with params:", router.query);
        
        // Build query string from router.query
        const queryString = new URLSearchParams(router.query).toString();
        const url = `http://localhost:8080/api/payment/confirm?${queryString}`;
        
        console.log("Calling API:", url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Payment confirmation response:", data);

        if (data.success) {
          setConfirming(false);
          
          // Send pending appointment email after successful payment
          if (appointmentId) {
            try {
              // Fetch appointment details to send email
              const appointmentResponse = await fetch(`http://localhost:8080/api/appointments/${appointmentId}`);
              if (appointmentResponse.ok) {
                const appointment = await appointmentResponse.json();
                
                // Format date and time for email
                const appointmentDate = new Date(appointment.date).toLocaleDateString('vi-VN');
                const slotTimes = {
                  SLOT_1: "07:30 - 08:00", SLOT_2: "08:15 - 08:45", SLOT_3: "09:00 - 09:30",
                  SLOT_4: "09:45 - 10:15", SLOT_5: "10:30 - 11:00", SLOT_6: "11:15 - 11:45",
                  SLOT_7: "13:00 - 13:30", SLOT_8: "13:45 - 14:15", SLOT_9: "14:30 - 15:00",
                  SLOT_10: "15:15 - 15:45", SLOT_11: "16:00 - 16:30", SLOT_12: "16:45 - 17:15"
                };
                const appointmentTime = slotTimes[appointment.slot] || appointment.slot;
                
                const emailDetails = {
                  patientName: appointment.patient?.name || 'Bệnh nhân',
                  doctorName: `BS. ${appointment.doctor?.name || 'Bác sĩ'}`,
                  date: appointmentDate,
                  time: appointmentTime,
                  specialty: appointment.doctor?.speciality?.name || 'Chưa xác định',
                  type: appointment.type,
                  appointmentId: appointmentId
                };
                
                const { subject, html } = generateAppointmentPendingEmail(emailDetails);
                await sendEmailViaAPI(appointment.patient?.email, subject, html);
                console.log("✅ Pending appointment email sent");
              }
            } catch (emailError) {
              console.error("⚠️ Failed to send appointment email:", emailError);
              // Don't block user flow if email fails
            }
          }
          
          // Auto redirect after 8 seconds
          setTimeout(() => {
            router.push("/nguoi-dung/lich-hen");
          }, 8000);
        } else {
          setError("Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.");
          setConfirming(false);
        }
      } catch (err) {
        console.error("Error confirming payment:", err);
        setError(err.message || "Lỗi xác nhận thanh toán");
        setConfirming(false);
      }
    };

    confirmPayment();
  }, [router.isReady, router.query, vnp_ResponseCode, appointmentId]);

  const formatAmount = (amount) => {
    if (!amount) return "";
    // VNPay amount is in cents, so divide by 100
    const numAmount = parseInt(amount) / 100;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numAmount);
  };

  const formatTransactionDate = (transDate) => {
    if (!transDate) return 'N/A';
    // Format: yyyyMMddHHmmss -> dd/MM/yyyy HH:mm:ss
    const year = transDate.substring(0, 4);
    const month = transDate.substring(4, 6);
    const day = transDate.substring(6, 8);
    const hour = transDate.substring(8, 10);
    const minute = transDate.substring(10, 12);
    const second = transDate.substring(12, 14);
    
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  if (confirming) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <CardBody className="text-center p-8">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Spinner size="lg" color="primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Đang xác nhận thanh toán
                </h1>
                <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </PatientFrame>
    );
  }

  if (error) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <CardBody className="text-center p-8">
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-red-600" size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Có lỗi xảy ra
                </h1>
                <p className="text-red-600">{error}</p>
              </div>
              <Button
                fullWidth
                color="primary"
                onClick={() => router.push("/nguoi-dung/lich-hen")}
              >
                Về trang lịch hẹn
              </Button>
            </CardBody>
          </Card>
        </div>
      </PatientFrame>
    );
  }

  return (
    <PatientFrame>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600">
                Lịch hẹn của bạn đã được xác nhận
              </p>
            </div>

            {(vnp_TxnRef || vnp_Amount || appointmentId) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                <h3 className="font-semibold text-green-900 mb-3">Chi tiết giao dịch</h3>
                <div className="space-y-2">
                  {appointmentId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Mã lịch hẹn:</span>
                      <span className="text-sm font-medium text-green-800">#{appointmentId}</span>
                    </div>
                  )}
                  {vnp_TxnRef && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Mã giao dịch:</span>
                      <span className="text-sm font-medium text-green-800">{vnp_TxnRef}</span>
                    </div>
                  )}
                  {vnp_TransactionNo && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Mã GD VNPay:</span>
                      <span className="text-sm font-medium text-green-800">{vnp_TransactionNo}</span>
                    </div>
                  )}
                  {vnp_Amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Số tiền:</span>
                      <span className="text-sm font-bold text-green-600">{formatAmount(vnp_Amount)}</span>
                    </div>
                  )}
                  {vnp_BankCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Ngân hàng:</span>
                      <span className="text-sm font-medium text-green-800">{vnp_BankCode}</span>
                    </div>
                  )}
                  {vnp_PayDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Thời gian:</span>
                      <span className="text-sm font-medium text-green-800">{formatTransactionDate(vnp_PayDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Cảm ơn bạn đã sử dụng dịch vụ của MedConnect. 
                Bạn sẽ nhận được thông báo chi tiết qua email và SMS.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                fullWidth
                color="primary"
                startContent={<Calendar size={18} />}
                onClick={() => router.push("/nguoi-dung/lich-hen")}
              >
                Xem lịch hẹn
              </Button>
              <Button
                fullWidth
                variant="bordered"
                startContent={<Home size={18} />}
                onClick={() => router.push("/nguoi-dung/trang-chu")}
              >
                Về trang chủ
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Tự động chuyển hướng sau 8 giây...
            </p>
          </CardBody>
        </Card>
      </div>
    </PatientFrame>
  );
}

