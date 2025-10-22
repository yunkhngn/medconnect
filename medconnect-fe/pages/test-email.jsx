import React, { useState } from 'react';
import { Default } from '@/components/layouts';
import { Card, CardBody, CardHeader, Input, Button, Chip, Textarea } from '@heroui/react';
import Float from '@/components/ui/Float';
import Image from 'next/image';
import { useEmailService } from '@/hooks/useEmailService';

const TestEmail = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Test Email from MedConnect');
  const [message, setMessage] = useState('This is a test email sent from MedConnect platform.');
  const { sendEmail, loading, error, success } = useEmailService();

  const handleSendEmail = async () => {
    if (!email.trim()) {
      return;
    }

    await sendEmail({
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #3b82f6, #06b6d4); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MedConnect</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">${message}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is a test email sent from MedConnect platform.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                © ${new Date().getFullYear()} MedConnect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    });
  };

  return (
    <Default title="Test Email - MedConnect">
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with blur */}
        <div className="absolute inset-0">
          <Image
            src="/assets/homepage/cover.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-white/70 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <Float variant="fadeInUp" delay={0.1}>
              <div className="text-center mb-12">
                <Chip color="primary" variant="flat" className="mb-4 bg-white/90 backdrop-blur-sm">
                  Email Testing
                </Chip>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Test Email Sender
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Kiểm tra chức năng gửi email với Resend API
                </p>
              </div>
            </Float>

            {/* Form Card */}
            <Float variant="fadeInUp" delay={0.2}>
              <Card className="mb-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Gửi Email Test
                  </h2>
                </CardHeader>
                <CardBody className="p-8 space-y-6">
                  {/* Email Input */}
                  <Float variant="fadeInUp" delay={0.3}>
                    <Input
                      type="email"
                      label="Địa chỉ email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      size="lg"
                      startContent={
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                  </Float>

                  {/* Subject Input */}
                  <Float variant="fadeInUp" delay={0.4}>
                    <Input
                      type="text"
                      label="Tiêu đề"
                      placeholder="Email subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={loading}
                      size="lg"
                    />
                  </Float>

                  {/* Message Input */}
                  <Float variant="fadeInUp" delay={0.5}>
                    <Textarea
                      label="Nội dung"
                      placeholder="Email message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={loading}
                      size="lg"
                      minRows={4}
                    />
                  </Float>

                  {/* Send Button */}
                  <Float variant="fadeInUp" delay={0.6}>
                    <Button
                      color="primary"
                      size="lg"
                      onClick={handleSendEmail}
                      disabled={loading || !email.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang gửi...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Gửi Email</span>
                        </div>
                      )}
                    </Button>
                  </Float>

                  {/* Error Message */}
                  {error && (
                    <Float variant="fadeIn">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h3 className="text-sm font-semibold text-red-800">Lỗi</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                          </div>
                        </div>
                      </div>
                    </Float>
                  )}

                  {/* Success Message */}
                  {success && (
                    <Float variant="fadeIn">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h3 className="text-sm font-semibold text-green-800">Thành công!</h3>
                            <p className="text-sm text-green-700 mt-1">
                              Email đã được gửi thành công đến <strong>{email}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Float>
                  )}
                </CardBody>
              </Card>
            </Float>

            {/* Info Card */}
            <Float variant="fadeInUp" delay={0.7}>
              <Card className="bg-blue-50/90 backdrop-blur-md border border-blue-200/50 shadow-2xl">
                <CardBody className="p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Thông tin
                      </h3>
                      <p className="text-blue-800 text-sm">
                        Trang này dùng để test chức năng gửi email với Resend API. 
                        Đảm bảo rằng bạn đã cấu hình <code className="bg-blue-100 px-1 py-0.5 rounded">NEXT_PUBLIC_RESEND_API_KEY</code> trong file <code className="bg-blue-100 px-1 py-0.5 rounded">.env.local</code>.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Float>
          </div>
        </div>
      </div>
    </Default>
  );
};

export default TestEmail;
