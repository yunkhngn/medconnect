import { useState } from 'react';

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendEmail = async ({ to, subject, html, text }) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY;

      if (!apiKey) {
        throw new Error('Resend API key không được cấu hình');
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'MedConnect <onboarding@resend.dev>', // Replace with verified domain
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      const data = await response.json();
      setIsLoading(false);
      return { success: true, data };
    } catch (err) {
      console.error('Email send error:', err);
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Template: Welcome email
  const sendWelcomeEmail = async (userEmail, userName) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Chào mừng đến với MedConnect!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${userName}</strong>,</p>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại MedConnect - nền tảng đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam.</p>
              <p>Với MedConnect, bạn có thể:</p>
              <ul>
                <li>Tìm kiếm bác sĩ chuyên khoa</li>
                <li>Đặt lịch khám nhanh chóng</li>
                <li>Tư vấn sức khỏe với AI</li>
                <li>Thanh toán trực tuyến an toàn</li>
              </ul>
              <center>
                <a href="https://medconnect.vn/tim-bac-si" class="button">Tìm bác sĩ ngay</a>
              </center>
              <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
              <p>Trân trọng,<br><strong>Đội ngũ MedConnect</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 MedConnect. All rights reserved.</p>
              <p>📧 support@medconnect.vn | 📞 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmail({
      to: userEmail,
      subject: 'Chào mừng bạn đến với MedConnect! 🎉',
      html,
      text: `Xin chào ${userName}, Cảm ơn bạn đã đăng ký tài khoản tại MedConnect!`,
    });
  };

  // Template: Appointment confirmation
  const sendAppointmentConfirmation = async (userEmail, appointmentDetails) => {
    const { patientName, doctorName, date, time, specialty, location } = appointmentDetails;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: bold; color: #666; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Xác nhận lịch khám</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${patientName}</strong>,</p>
              <p>Lịch khám của bạn đã được xác nhận thành công!</p>
              <div class="info-box">
                <h3 style="margin-top: 0;">Thông tin lịch khám</h3>
                <div class="info-row">
                  <span class="info-label">Bác sĩ:</span>
                  <span>${doctorName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Chuyên khoa:</span>
                  <span>${specialty}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ngày:</span>
                  <span>${date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Giờ:</span>
                  <span>${time}</span>
                </div>
                <div class="info-row" style="border: none;">
                  <span class="info-label">Địa điểm:</span>
                  <span>${location}</span>
                </div>
              </div>
              <p><strong>Lưu ý:</strong> Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.</p>
              <p>Nếu bạn cần hủy hoặc thay đổi lịch hẹn, vui lòng liên hệ với chúng tôi trước 24 giờ.</p>
              <p>Trân trọng,<br><strong>Đội ngũ MedConnect</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 MedConnect. All rights reserved.</p>
              <p>📧 support@medconnect.vn | 📞 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmail({
      to: userEmail,
      subject: `Xác nhận lịch khám - ${date} ${time}`,
      html,
      text: `Xin chào ${patientName}, Lịch khám của bạn với ${doctorName} vào ${date} lúc ${time} đã được xác nhận.`,
    });
  };

  // Template: Password reset
  const sendPasswordReset = async (userEmail, resetLink) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản MedConnect của mình.</p>
              <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
              <center>
                <a href="${resetLink}" class="button">Đặt lại mật khẩu</a>
              </center>
              <div class="warning">
                <strong>⚠️ Lưu ý:</strong> Link này chỉ có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
              </div>
              <p>Nếu nút không hoạt động, copy link sau vào trình duyệt:</p>
              <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
              <p>Trân trọng,<br><strong>Đội ngũ MedConnect</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 MedConnect. All rights reserved.</p>
              <p>📧 support@medconnect.vn | 📞 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmail({
      to: userEmail,
      subject: 'Yêu cầu đặt lại mật khẩu - MedConnect',
      html,
      text: `Bạn đã yêu cầu đặt lại mật khẩu. Truy cập link sau: ${resetLink}`,
    });
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendAppointmentConfirmation,
    sendPasswordReset,
    isLoading,
    error,
  };
};

