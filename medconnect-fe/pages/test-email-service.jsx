import { useState } from "react";
import { Input, Textarea, Button, Card, CardBody, CardHeader, Select, SelectItem, Divider, Chip } from "@heroui/react";
import { Mail, Send, CheckCircle, XCircle, Loader, ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

export default function TestEmailService() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Form states
  const [emailType, setEmailType] = useState("test");
  const [formData, setFormData] = useState({
    to: "",
    subject: "Test Email from MedConnect",
    content: "<h1>Hello!</h1><p>This is a test email.</p>",
    userName: "Nguyễn Văn A",
    patientName: "Nguyễn Văn A",
    doctorName: "Trần Thị B",
    appointmentDate: "25/10/2024",
    appointmentTime: "09:00",
    specialization: "Tim mạch",
    resetLink: "https://medconnect.app/reset-password?token=abc123"
  });

  const emailTypes = [
    { value: "test", label: "🧪 Test Email (Simple)", description: "Gửi email đơn giản để test" },
    { value: "welcome", label: "👋 Welcome Email", description: "Email chào mừng user mới" },
    { value: "appointment-confirmation", label: "✅ Appointment Confirmation", description: "Xác nhận đặt lịch khám" },
    { value: "appointment-reminder", label: "⏰ Appointment Reminder", description: "Nhắc nhở lịch hẹn sắp tới" },
    { value: "password-reset", label: "🔒 Password Reset", description: "Email đặt lại mật khẩu" }
  ];

  const handleSendEmail = async () => {
    if (!formData.to) {
      toast.error("Vui lòng nhập email người nhận");
      return;
    }

    setLoading(true);
    try {
      let endpoint = "";
      let body = {};

      switch (emailType) {
        case "test":
          endpoint = "/api/email/test";
          body = {
            to: formData.to,
            subject: formData.subject,
            content: formData.content
          };
          break;

        case "welcome":
          endpoint = "/api/email/welcome";
          body = {
            to: formData.to,
            userName: formData.userName
          };
          break;

        case "appointment-confirmation":
          endpoint = "/api/email/appointment/confirmation";
          body = {
            to: formData.to,
            patientName: formData.patientName,
            doctorName: formData.doctorName,
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime,
            specialization: formData.specialization
          };
          break;

        case "appointment-reminder":
          endpoint = "/api/email/appointment/reminder";
          body = {
            to: formData.to,
            patientName: formData.patientName,
            doctorName: formData.doctorName,
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime
          };
          break;

        case "password-reset":
          endpoint = "/api/email/password-reset";
          body = {
            to: formData.to,
            userName: formData.userName,
            resetLink: formData.resetLink
          };
          break;

        default:
          throw new Error("Invalid email type");
      }

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Email đã được gửi thành công!");
        setResults(prev => [{
          type: emailType,
          status: "success",
          to: formData.to,
          emailId: data.emailId,
          time: new Date().toLocaleTimeString()
        }, ...prev]);
      } else {
        throw new Error(data.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Không thể gửi email");
      setResults(prev => [{
        type: emailType,
        status: "error",
        to: formData.to,
        error: error.message,
        time: new Date().toLocaleTimeString()
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (emailType) {
      case "test":
        return (
          <>
            <Input
              label="Subject"
              placeholder="Email subject"
              value={formData.subject}
              onValueChange={(v) => setFormData({ ...formData, subject: v })}
              variant="bordered"
              labelPlacement="outside"
            />
            <Textarea
              label="HTML Content"
              placeholder="<h1>Hello!</h1>"
              value={formData.content}
              onValueChange={(v) => setFormData({ ...formData, content: v })}
              variant="bordered"
              labelPlacement="outside"
              minRows={4}
            />
          </>
        );

      case "welcome":
        return (
          <Input
            label="Tên người dùng"
            placeholder="VD: Nguyễn Văn A"
            value={formData.userName}
            onValueChange={(v) => setFormData({ ...formData, userName: v })}
            variant="bordered"
            labelPlacement="outside"
          />
        );

      case "appointment-confirmation":
        return (
          <>
            <Input
              label="Tên bệnh nhân"
              placeholder="VD: Nguyễn Văn A"
              value={formData.patientName}
              onValueChange={(v) => setFormData({ ...formData, patientName: v })}
              variant="bordered"
              labelPlacement="outside"
            />
            <Input
              label="Tên bác sĩ"
              placeholder="VD: Trần Thị B"
              value={formData.doctorName}
              onValueChange={(v) => setFormData({ ...formData, doctorName: v })}
              variant="bordered"
              labelPlacement="outside"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ngày khám"
                placeholder="25/10/2024"
                value={formData.appointmentDate}
                onValueChange={(v) => setFormData({ ...formData, appointmentDate: v })}
                variant="bordered"
                labelPlacement="outside"
              />
              <Input
                label="Giờ khám"
                placeholder="09:00"
                value={formData.appointmentTime}
                onValueChange={(v) => setFormData({ ...formData, appointmentTime: v })}
                variant="bordered"
                labelPlacement="outside"
              />
            </div>
            <Input
              label="Chuyên khoa"
              placeholder="VD: Tim mạch"
              value={formData.specialization}
              onValueChange={(v) => setFormData({ ...formData, specialization: v })}
              variant="bordered"
              labelPlacement="outside"
            />
          </>
        );

      case "appointment-reminder":
        return (
          <>
            <Input
              label="Tên bệnh nhân"
              placeholder="VD: Nguyễn Văn A"
              value={formData.patientName}
              onValueChange={(v) => setFormData({ ...formData, patientName: v })}
              variant="bordered"
              labelPlacement="outside"
            />
            <Input
              label="Tên bác sĩ"
              placeholder="VD: Trần Thị B"
              value={formData.doctorName}
              onValueChange={(v) => setFormData({ ...formData, doctorName: v })}
              variant="bordered"
              labelPlacement="outside"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ngày khám"
                placeholder="25/10/2024"
                value={formData.appointmentDate}
                onValueChange={(v) => setFormData({ ...formData, appointmentDate: v })}
                variant="bordered"
                labelPlacement="outside"
              />
              <Input
                label="Giờ khám"
                placeholder="09:00"
                value={formData.appointmentTime}
                onValueChange={(v) => setFormData({ ...formData, appointmentTime: v })}
                variant="bordered"
                labelPlacement="outside"
              />
            </div>
          </>
        );

      case "password-reset":
        return (
          <>
            <Input
              label="Tên người dùng"
              placeholder="VD: Nguyễn Văn A"
              value={formData.userName}
              onValueChange={(v) => setFormData({ ...formData, userName: v })}
              variant="bordered"
              labelPlacement="outside"
            />
            <Input
              label="Reset Link"
              placeholder="https://medconnect.app/reset-password?token=..."
              value={formData.resetLink}
              onValueChange={(v) => setFormData({ ...formData, resetLink: v })}
              variant="bordered"
              labelPlacement="outside"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ToastNotification toast={toast} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="light"
            startContent={<ArrowLeft size={20} />}
            onClick={() => router.push("/")}
            className="mb-4"
          >
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Mail className="text-primary" size={36} />
            📧 Email Service Tester
          </h1>
          <p className="text-gray-600 mt-2">
            Test gửi email với các template khác nhau
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>WARNING:</strong> Đây là trang test. Chỉ dùng để development. Xóa sau khi test xong!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Gửi Email</h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                {/* Email Type */}
                <Select
                  label="Loại email"
                  selectedKeys={[emailType]}
                  onSelectionChange={(keys) => setEmailType(Array.from(keys)[0])}
                  variant="bordered"
                  labelPlacement="outside"
                  description={emailTypes.find(t => t.value === emailType)?.description}
                >
                  {emailTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Recipient Email */}
                <Input
                  label="Người nhận"
                  placeholder="your-email@example.com"
                  value={formData.to}
                  onValueChange={(v) => setFormData({ ...formData, to: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  type="email"
                  isRequired
                  startContent={<Mail className="text-default-400" size={20} />}
                />

                <Divider />

                {/* Dynamic Fields */}
                {renderFormFields()}

                {/* Send Button */}
                <Button
                  color="primary"
                  size="lg"
                  fullWidth
                  startContent={loading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                  onClick={handleSendEmail}
                  isLoading={loading}
                  isDisabled={!formData.to}
                >
                  {loading ? "Đang gửi..." : "Gửi Email"}
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Right: Results */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Kết quả gửi email</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="mx-auto text-gray-300" size={48} />
                    <p className="mt-4">Chưa có email nào được gửi</p>
                    <p className="text-sm mt-2">Điền form bên trái và click "Gửi Email"</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {results.map((result, idx) => (
                      <Card key={idx} className={`border-l-4 ${result.status === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                        <CardBody>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {result.status === 'success' ? (
                                  <CheckCircle className="text-green-600" size={20} />
                                ) : (
                                  <XCircle className="text-red-600" size={20} />
                                )}
                                <span className="font-semibold">
                                  {emailTypes.find(t => t.value === result.type)?.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                <strong>Người nhận:</strong> {result.to}
                              </p>
                              {result.emailId && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Email ID:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{result.emailId}</code>
                                </p>
                              )}
                              {result.error && (
                                <p className="text-sm text-red-600 mt-1">
                                  <strong>Error:</strong> {result.error}
                                </p>
                              )}
                            </div>
                            <Chip
                              size="sm"
                              color={result.status === 'success' ? 'success' : 'danger'}
                              variant="flat"
                            >
                              {result.time}
                            </Chip>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Quick Info */}
            <Card className="mt-6 bg-blue-50 border border-blue-200">
              <CardBody>
                <h3 className="font-semibold text-blue-900 mb-2">💡 Lưu ý:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Kiểm tra spam folder nếu không nhận được email</li>
                  <li>• API key phải được config trong <code className="bg-white px-1 rounded">.env</code></li>
                  <li>• Domain <code className="bg-white px-1 rounded">mail.medconnects.app</code> phải verified</li>
                  <li>• Xem logs backend nếu gửi thất bại</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Email Templates Preview */}
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">📋 Email Templates</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emailTypes.map((type) => (
                <Card key={type.value} isPressable onPress={() => setEmailType(type.value)} className={emailType === type.value ? 'border-2 border-primary' : ''}>
                  <CardBody>
                    <p className="font-semibold mb-1">{type.label}</p>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

