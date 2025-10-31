import { useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Spinner } from "@heroui/react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { useAuth } from "@/contexts/AuthContext";

export default function PaymentCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!router.isReady || !user) return;
    
    const verifyPayment = async () => {
      const queryParams = router.query;
      
      // Check VNPay response code
      const responseCode = queryParams.vnp_ResponseCode;
      const transactionStatus = queryParams.vnp_TransactionStatus;

      // VNPay response codes:
      // 00: Success
      // 24: Customer cancelled transaction
      // Others: Failed
      
      if (responseCode === "24" || transactionStatus === "02") {
        // Payment cancelled by user
        router.replace("/thanh-toan/da-huy");
        return;
      }

      try {
        // Get JWT token
        const token = await user.getIdToken();
        
        // Build query string from URL params
        const queryString = new URLSearchParams(queryParams).toString();
        
        // Call backend to verify payment
        const response = await fetch(
          `http://localhost:8080/api/payment/confirm?${queryString}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && responseCode === "00") {
            // Payment successful
            router.replace("/thanh-toan/thanh-cong");
          } else {
            // Payment failed
            router.replace("/thanh-toan/that-bai");
          }
        } else {
          // Server error
          router.replace("/thanh-toan/that-bai");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        router.replace("/thanh-toan/that-bai");
      }
    };

    verifyPayment();
  }, [router.isReady, router.query, user]);

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
