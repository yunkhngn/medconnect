import { useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Spinner } from "@heroui/react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function PaymentResult() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    
    const processResult = () => {
      const queryParams = router.query;
      console.log("VNPay return params:", queryParams);
      
      const {
        vnp_ResponseCode,
        vnp_TransactionStatus
      } = queryParams;

      // VNPay response codes:
      // 00: Success
      // 24: Customer cancelled transaction
      // Others: Failed
      
      if (vnp_ResponseCode === "24" || vnp_TransactionStatus === "02") {
        // Payment cancelled by user
        console.log("Payment cancelled, redirecting to cancelled page");
        router.replace(`/thanh-toan/da-huy?${new URLSearchParams(queryParams).toString()}`);
        return;
      }

      if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
        // Payment successful - pass ALL params to success page
        console.log("Payment successful, redirecting to success page");
        router.replace(`/thanh-toan/thanh-cong?${new URLSearchParams(queryParams).toString()}`);
      } else {
        // Payment failed
        console.log("Payment failed, redirecting to error page");
        router.replace(`/thanh-toan/that-bai?${new URLSearchParams(queryParams).toString()}`);
      }
    };

    // Add small delay to ensure router is fully ready
    setTimeout(processResult, 100);
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
                Đang xử lý kết quả thanh toán
              </h1>
              <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </PatientFrame>
  );
}
