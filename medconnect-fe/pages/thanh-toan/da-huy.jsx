import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, CardBody, Button, Divider } from "@heroui/react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function PaymentCancelled() {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    console.log("Payment Cancelled - Query params:", router.query);
    
    if (router.query) {
      const {
        vnp_TxnRef,
        vnp_ResponseCode,
        appointmentId
      } = router.query;

      setPaymentDetails({
        txnRef: vnp_TxnRef,
        responseCode: vnp_ResponseCode,
        appointmentId
      });

      console.log("Payment Cancelled - Parsed details:", {
        txnRef: vnp_TxnRef,
        responseCode: vnp_ResponseCode,
        appointmentId
      });
    }
  }, [router.query]);

  return (
    <PatientFrame>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-lg w-full">
          <CardBody className="text-center p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-orange-600" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán đã bị hủy
              </h1>
              <p className="text-gray-600">
                Bạn đã hủy giao dịch thanh toán
              </p>
            </div>

            {paymentDetails && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-orange-800 mb-3">Thông tin giao dịch:</h3>
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
                  {paymentDetails.responseCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Mã phản hồi:</span>
                      <span className="font-medium">{paymentDetails.responseCode}</span>
                    </div>
                  )}
                </div>
                <Divider className="my-3" />
                <div className="text-sm text-orange-700">
                  <strong>Lý do:</strong> Giao dịch được hủy bởi người dùng
                </div>
              </div>
            )}

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-800">
                Không sao cả! Bạn có thể thực hiện thanh toán lại bất cứ lúc nào.
                Lịch hẹn của bạn vẫn được giữ trong hệ thống.
              </p>
            </div>

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
                Thực hiện thanh toán lại
              </Button>
              <Button
                fullWidth
                variant="bordered"
                startContent={<Home size={18} />}
                onClick={() => router.push("/nguoi-dung/lich-hen")}
              >
                Xem lịch hẹn
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </PatientFrame>
  );
}

