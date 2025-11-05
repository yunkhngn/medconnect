import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, CardBody, Spinner } from "@heroui/react";
import { Clock, CreditCard } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function PaymentProcessing() {
  const router = useRouter();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Auto redirect after 30 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/nguoi-dung/trang-chu");
    }, 30000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <PatientFrame>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-blue-600" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xử lý thanh toán{dots}
              </h1>
              <p className="text-gray-600">
                Vui lòng chờ trong giây lát
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <Spinner size="lg" color="primary" />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-blue-600 mr-2" size={16} />
                <span className="text-sm font-medium text-blue-800">
                  Đang kiểm tra trạng thái giao dịch
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Quá trình này có thể mất vài phút. 
                Xin vui lòng không tắt trình duyệt.
              </p>
            </div>

            <div className="text-xs text-gray-500">
              Trang sẽ tự động chuyển hướng sau 30 giây
            </div>
          </CardBody>
        </Card>
      </div>
    </PatientFrame>
  );
}