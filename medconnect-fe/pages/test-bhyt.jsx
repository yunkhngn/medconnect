import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Divider } from '@heroui/react';
import BHYTInput from '@/components/ui/BHYTInput';

export default function TestBHYT() {
  const [bhytCode, setBhytCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedCode(bhytCode);
    console.log('Mã BHYT đã submit:', bhytCode);
  };

  const exampleCodes = [
    { code: 'HS4010120878811', desc: 'Học sinh - Mức 4 - Hà Nội' },
    { code: 'DN4010123456789', desc: 'NLĐ Doanh nghiệp - Mức 4 - Hà Nội' },
    { code: 'TE1010987654321', desc: 'Trẻ em dưới 6 tuổi - Mức 1 - Hà Nội' },
    { code: 'SV4010111222333', desc: 'Sinh viên - Mức 4 - Hà Nội' },
    { code: 'GD4290987654321', desc: 'Hộ gia đình - Mức 4 - TP.HCM' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-2 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Test Component: Mã số BHYT
            </h1>
            <p className="text-sm text-gray-600">
              Component input mã số Bảo hiểm Y tế với validation theo chuẩn Việt Nam
            </p>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {/* Form nhập mã BHYT */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <BHYTInput
                value={bhytCode}
                onChange={setBhytCode}
                required
                label="Mã số Bảo hiểm Y tế"
                placeholder="VD: HS 4 01 0120878811"
              />

              <Button
                type="submit"
                color="primary"
                className="w-full md:w-auto"
                isDisabled={bhytCode.length !== 15}
              >
                Xác nhận
              </Button>
            </form>

            {/* Hiển thị kết quả submit */}
            {submittedCode && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  ✓ Mã BHYT đã được xác nhận
                </h3>
                <p className="text-green-700 font-mono text-lg">
                  {submittedCode.slice(0, 2)} {submittedCode.slice(2, 3)} {submittedCode.slice(3, 5)} {submittedCode.slice(5)}
                </p>
              </div>
            )}

            <Divider className="my-6" />

            {/* Ví dụ mã BHYT */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Ví dụ mã BHYT hợp lệ:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exampleCodes.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setBhytCode(example.code)}
                    className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-mono text-sm text-blue-600 mb-1">
                      {example.code.slice(0, 2)} {example.code.slice(2, 3)} {example.code.slice(3, 5)} {example.code.slice(5)}
                    </div>
                    <div className="text-xs text-gray-600">{example.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <Divider className="my-6" />

            {/* Hướng dẫn */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">
                📋 Cấu trúc mã số BHYT (15 ký tự):
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">XX</span>
                  <span>2 ký tự chữ - Mã đối tượng (VD: HS=Học sinh, DN=Doanh nghiệp)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">Y</span>
                  <span>1 ký tự số - Mức hưởng (1-5, mức thanh toán 80%-100%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">ZZ</span>
                  <span>2 ký tự số - Mã tỉnh/TP (01-99, VD: 01=Hà Nội, 29=TP.HCM)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">NNNNNNNNNN</span>
                  <span>10 ký tự số - Mã số BHXH (định danh duy nhất)</span>
                </div>
              </div>
            </div>

            {/* Feature list */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                ✨ Tính năng:
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ Auto-format khi nhập (thêm space tự động)</li>
                <li>✓ Validate real-time từng ký tự</li>
                <li>✓ Kiểm tra mã đối tượng hợp lệ (65+ loại)</li>
                <li>✓ Kiểm tra mức hưởng (1-5)</li>
                <li>✓ Kiểm tra mã tỉnh (01-99)</li>
                <li>✓ Kiểm tra mã BHXH (10 số)</li>
                <li>✓ Hiển thị thông tin chi tiết khi hợp lệ</li>
                <li>✓ Error messages rõ ràng</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

