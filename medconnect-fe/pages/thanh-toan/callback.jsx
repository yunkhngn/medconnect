import { useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Spinner } from "@heroui/react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { useAuth } from "@/contexts/AuthContext";

export default function PaymentCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!router.isReady) return;
    
    const processCallback = () => {
      const queryParams = router.query;
      console.log("Payment callback params:", queryParams);
      
      // Extract VNPay parameters
      const {
        vnp_ResponseCode,
        vnp_TransactionStatus,
        vnp_TxnRef,
        vnp_Amount,
        vnp_OrderInfo,
        vnp_PayDate,
        vnp_BankCode,
        vnp_TransactionNo,
        appointmentId
      } = queryParams;

      // VNPay response codes:
      // 00: Success
      // 24: Customer cancelled transaction
      // Others: Failed
      
      if (vnp_ResponseCode === "24" || vnp_TransactionStatus === "02") {
        // Payment cancelled by user
        const cancelUrl = `/thanh-toan/da-huy?${new URLSearchParams({
          vnp_TxnRef: vnp_TxnRef || '',
          vnp_ResponseCode: vnp_ResponseCode || '',
          appointmentId: appointmentId || ''
        }).toString()}`;
        router.replace(cancelUrl);
        return;
      }

      if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
        // Payment successful
        const successUrl = `/thanh-toan/thanh-cong?${new URLSearchParams({
          vnp_TxnRef: vnp_TxnRef || '',
          vnp_Amount: vnp_Amount || '',
          vnp_OrderInfo: vnp_OrderInfo || '',
          vnp_PayDate: vnp_PayDate || '',
          vnp_BankCode: vnp_BankCode || '',
          vnp_TransactionNo: vnp_TransactionNo || '',
          vnp_ResponseCode: vnp_ResponseCode || '',
          appointmentId: appointmentId || '',
          status: 'PAID'
        }).toString()}`;
        
        console.log("Redirecting to success page:", successUrl);
        router.replace(successUrl);
      } else {
        // Payment failed
        const errorUrl = `/thanh-toan/that-bai?${new URLSearchParams({
          vnp_TxnRef: vnp_TxnRef || '',
          vnp_ResponseCode: vnp_ResponseCode || '',
          vnp_TransactionStatus: vnp_TransactionStatus || '',
          vnp_OrderInfo: vnp_OrderInfo || '',
          appointmentId: appointmentId || '',
          errorMessage: 'Giao dịch không thành công'
        }).toString()}`;
        
        console.log("Redirecting to error page:", errorUrl);
        router.replace(errorUrl);
      }
    };

    // Add small delay to ensure router is fully ready
    setTimeout(processCallback, 100);
  }, [router.isReady, router.query]);

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
                Đang xử lý thanh toán
              </h1>
              <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </PatientFrame>
  );
}
