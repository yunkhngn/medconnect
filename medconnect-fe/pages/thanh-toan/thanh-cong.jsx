import { useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Button } from "@heroui/react";
import { CheckCircle, Calendar, Home } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function PaymentSuccess() {
  const router = useRouter();
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
    // Auto redirect after 8 seconds to give user more time to read
    const timer = setTimeout(() => {
      router.push("/nguoi-dung/lich-hen");
    }, 8000);

    return () => clearTimeout(timer);
  }, [router]);

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

