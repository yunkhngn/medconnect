import { useState } from 'react';
import { Card, CardBody, Input, Button, Textarea, Select, SelectItem } from '@heroui/react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestEmail() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Test Email từ MedConnect');
  const [message, setMessage] = useState('Đây là email test từ hệ thống MedConnect.');
  const [template, setTemplate] = useState('custom');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCustom = async () => {
    if (!to) {
      alert('Vui lòng nhập email người nhận');
      return;
    }

    setResult(null);
    setIsLoading(true);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 30px; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Test Email - MedConnect</h2>
            </div>
            <p>${message}</p>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Sent at: ${new Date().toLocaleString('vi-VN')}
            </p>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, data });
      } else {
        setResult({ success: false, error: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTemplate = async () => {
    if (!to) {
      alert('Vui lòng nhập email người nhận');
      return;
    }

    setResult(null);
    setIsLoading(true);

    // For now, templates use custom HTML - in production you'd have template API routes
    if (template === 'custom') {
      await handleSendCustom();
      return;
    }

    let html = '';
    let emailSubject = '';

    if (template === 'welcome') {
      emailSubject = 'Chào mừng bạn đến với MedConnect! 🎉';
      html = generateWelcomeTemplate('Người dùng test');
    } else if (template === 'appointment') {
      emailSubject = 'Xác nhận lịch khám - 15/11/2025 10:00';
      html = generateAppointmentTemplate();
    } else if (template === 'reset') {
      emailSubject = 'Yêu cầu đặt lại mật khẩu - MedConnect';
      html = generateResetTemplate();
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject: emailSubject,
          html
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, data });
      } else {
        setResult({ success: false, error: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWelcomeTemplate = (userName) => {
    return `<!DOCTYPE html><html><body><h1>Chào mừng ${userName}!</h1><p>Cảm ơn bạn đã đăng ký MedConnect.</p></body></html>`;
  };

  const generateAppointmentTemplate = () => {
    return `<!DOCTYPE html><html><body><h1>Xác nhận lịch hẹn</h1><p>Lịch khám với BS. Nguyễn Văn An vào 15/11/2025 lúc 10:00.</p></body></html>`;
  };

  const generateResetTemplate = () => {
    return `<!DOCTYPE html><html><body><h1>Đặt lại mật khẩu</h1><p>Click vào link sau để đặt lại mật khẩu: <a href="#">Reset</a></p></body></html>`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Email Service</h1>
          <p className="text-gray-600">Kiểm tra chức năng gửi email với Resend</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form gửi email */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gửi Email Test</h2>
              
              <div className="space-y-4">
                <Input
                  label="Email người nhận"
                  placeholder="example@gmail.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  startContent={<Mail size={18} />}
                  isRequired
                />

                <Select
                  label="Loại email"
                  placeholder="Chọn template"
                  selectedKeys={[template]}
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  <SelectItem key="custom" value="custom">
                    Email tùy chỉnh
                  </SelectItem>
                  <SelectItem key="welcome" value="welcome">
                    Welcome Email
                  </SelectItem>
                  <SelectItem key="appointment" value="appointment">
                    Xác nhận lịch hẹn
                  </SelectItem>
                  <SelectItem key="reset" value="reset">
                    Đặt lại mật khẩu
                  </SelectItem>
                </Select>

                {template === 'custom' && (
                  <>
                    <Input
                      label="Tiêu đề"
                      placeholder="Nhập tiêu đề email"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />

                    <Textarea
                      label="Nội dung"
                      placeholder="Nhập nội dung email"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      minRows={4}
                    />
                  </>
                )}

                <Button
                  color="primary"
                  fullWidth
                  size="lg"
                  startContent={<Send size={18} />}
                  onClick={template === 'custom' ? handleSendCustom : handleSendTemplate}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi Email'}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Kết quả */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-4">Kết quả</h2>
              
              {!result && (
                <div className="text-center py-12 text-gray-400">
                  <Mail size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Chưa có kết quả</p>
                  <p className="text-sm mt-2">Điền thông tin và nhấn "Gửi Email"</p>
                </div>
              )}

              {result && result.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-600 mr-3 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-2">Gửi thành công!</h3>
                      <p className="text-green-700 text-sm mb-3">
                        Email đã được gửi đến <strong>{to}</strong>
                      </p>
                      {result.data && (
                        <div className="bg-white rounded p-3 text-xs font-mono">
                          <div className="text-gray-600">Email ID:</div>
                          <div className="text-green-600 break-all">{result.data.id}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {result && !result.success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Gửi thất bại!</h3>
                      <p className="text-red-700 text-sm mb-3">{result.error}</p>
                      <div className="bg-red-100 rounded p-3 text-xs">
                        <strong>Các lỗi thường gặp:</strong>
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                          <li>API key không đúng hoặc chưa được cấu hình</li>
                          <li>Email domain chưa được verify trên Resend</li>
                          <li>Email người nhận không hợp lệ</li>
                          <li>Đã vượt quota miễn phí (100 emails/ngày)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Hướng dẫn</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Kiểm tra NEXT_PUBLIC_RESEND_API_KEY trong .env</li>
                  <li>2. Resend miễn phí cho phép gửi từ onboarding@resend.dev</li>
                  <li>3. Muốn dùng domain riêng phải verify trên Resend</li>
                  <li>4. Giới hạn: 100 emails/ngày (free tier)</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* API Key Check */}
        <Card className="mt-6">
          <CardBody className="p-6">
            <h3 className="font-semibold mb-3">🔑 Trạng thái cấu hình</h3>
              <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium">RESEND_API_KEY (Server)</span>
                {process.env.RESEND_API_KEY ? (
                  <span className="text-green-600 text-sm flex items-center">
                    <CheckCircle size={16} className="mr-1" /> Đã cấu hình
                  </span>
                ) : (
                  <span className="text-red-600 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" /> Chưa cấu hình
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 p-3 bg-blue-50 rounded">
                ℹ️ API key được dùng ở server-side (/api/send-email), không hiển thị ở client để bảo mật.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
