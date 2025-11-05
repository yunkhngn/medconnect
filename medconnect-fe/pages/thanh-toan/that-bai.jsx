import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, CardBody, Button, Divider } from "@heroui/react";
import { XCircle, RefreshCw, Home, Clock, CreditCard } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function PaymentError() {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    console.log("Payment Error - Query params:", router.query);
    
    if (router.query) {
      const {
        vnp_TxnRef,
        vnp_ResponseCode,
        vnp_TransactionStatus,
        vnp_Message,
        vnp_TransDate,
        vnp_Amount,
        appointmentId,
        errorMessage,
        status,
        RspCode
      } = router.query;

      setPaymentDetails({
        txnRef: vnp_TxnRef,
        responseCode: vnp_ResponseCode || RspCode,
        transactionStatus: vnp_TransactionStatus || status,
        message: vnp_Message || errorMessage,
        transDate: vnp_TransDate,
        amount: vnp_Amount,
        appointmentId
      });

      console.log("Payment Error - Parsed details:", {
        txnRef: vnp_TxnRef,
        responseCode: vnp_ResponseCode || RspCode,
        transactionStatus: vnp_TransactionStatus || status,
        message: vnp_Message || errorMessage
      });
    }
  }, [router.query]);

  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    const numAmount = parseInt(amount);
    return `${(numAmount / 100).toLocaleString('vi-VN')} VND`;
  };

  const formatTransactionDate = (transDate) => {
    if (!transDate) return 'N/A';
    const year = transDate.substring(0, 4);
    const month = transDate.substring(4, 6);
    const day = transDate.substring(6, 8);
    const hour = transDate.substring(8, 10);
    const minute = transDate.substring(10, 12);
    const second = transDate.substring(12, 14);
    
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const getErrorMessage = (responseCode) => {
    const errorMessages = {
      '24': 'Giao dịch bị hủy bởi người dùng',
      '07': 'Trừ tiền thành công nhưng giao dịch bị nghi vấn',
      '09': 'Thẻ không đăng ký dịch vụ Internet Banking tại ngân hàng',
      '10': 'Thẻ đã quá hạn',
      '11': 'Thẻ bị khóa',
      '12': 'Sai thông tin thẻ',
      '13': 'Mật khẩu OTP không đúng',
      '24': 'Hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng đang bảo trì',
      '79': 'Nhập sai mật khẩu quá số lần quy định'
    };
    
    return errorMessages[responseCode] || 'Giao dịch không thành công';
  };

  return (
    <PatientFrame>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-lg w-full">
          <CardBody className="text-center p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="text-red-600" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600">
                Giao dịch không thành công
              </p>
            </div>

            {paymentDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-3">Thông tin giao dịch:</h3>
                <div className="space-y-2 text-sm">
                  {paymentDetails.appointmentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Mã lịch hẹn:</span>
                      <span className="font-medium">#{paymentDetails.appointmentId}</span>
                    </div>
                  )}
                  {paymentDetails.txnRef && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Mã giao dịch:</span>
                      <span className="font-medium">{paymentDetails.txnRef}</span>
                    </div>
                  )}
                  {paymentDetails.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Số tiền:</span>
                      <span className="font-medium text-red-600">{formatAmount(paymentDetails.amount)}</span>
                    </div>
                  )}
                  {paymentDetails.responseCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Mã lỗi:</span>
                      <span className="font-medium">{paymentDetails.responseCode}</span>
                    </div>
                  )}
                  {paymentDetails.transDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Thời gian:</span>
                      <span className="font-medium">{formatTransactionDate(paymentDetails.transDate)}</span>
                    </div>
                  )}
                </div>
                <Divider className="my-3" />
                <div className="text-sm text-red-700">
                  <strong>Lý do:</strong> {paymentDetails.message || getErrorMessage(paymentDetails.responseCode)}
                </div>
              </div>
            )}

            {!paymentDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  Đã có lỗi xảy ra trong quá trình thanh toán. 
                  Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                fullWidth
                color="primary"
                startContent={<RefreshCw size={18} />}
                onClick={() => {
                  if (paymentDetails?.appointmentId) {
                    router.push(`/thanh-toan/${paymentDetails.appointmentId}`);
                  } else {
                    router.back();
                  }
                }}
              >
                Thử lại thanh toán
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
          </CardBody>
        </Card>
      </div>
    </PatientFrame>
  );
}

