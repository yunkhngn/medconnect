import { useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Button } from "@heroui/react";
import { CheckCircle, Calendar, Home } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/nguoi-dung/lich-hen");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

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

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                Cảm ơn bạn đã sử dụng dịch vụ của MedConnect. 
                Bạn sẽ nhận được thông báo chi tiết qua email.
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
              Tự động chuyển hướng sau 5 giây...
            </p>
          </CardBody>
        </Card>
      </div>
    </PatientFrame>
  );
}

