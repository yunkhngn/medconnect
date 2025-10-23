import { useRouter } from "next/router";
import { Card, CardBody, Button } from "@heroui/react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function PaymentCancelled() {
  const router = useRouter();

  return (
    <PatientFrame>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-yellow-600" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Đã hủy thanh toán
              </h1>
              <p className="text-gray-600">
                Bạn đã hủy giao dịch
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Lịch hẹn của bạn vẫn được giữ. 
                Bạn có thể thanh toán lại bất kỳ lúc nào.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                fullWidth
                color="primary"
                startContent={<RefreshCw size={18} />}
                onClick={() => router.back()}
              >
                Thanh toán lại
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

