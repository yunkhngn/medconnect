import { useRouter } from "next/router";
import { Card, CardBody, Button } from "@heroui/react";
import { XCircle, RefreshCw, Home } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";

export default function PaymentError() {
  const router = useRouter();

  return (
    <PatientFrame>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
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

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                Đã có lỗi xảy ra trong quá trình thanh toán. 
                Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                fullWidth
                color="primary"
                startContent={<RefreshCw size={18} />}
                onClick={() => router.back()}
              >
                Thử lại
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

