/**
 * Email Templates for MedConnect
 * Professional HTML email templates
 */

export const generateWelcomeEmail = (userName, userEmail) => {
  return {
    subject: 'Chào mừng đến với MedConnect! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
            ul { line-height: 2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🏥 Chào mừng đến với MedConnect!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Xin chào <strong>${userName}</strong>,</p>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>MedConnect</strong> - nền tảng đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam.</p>
              <p><strong>Thông tin tài khoản của bạn:</strong></p>
              <ul style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                <li>📧 Email: <strong>${userEmail}</strong></li>
                <li>👤 Họ tên: <strong>${userName}</strong></li>
              </ul>
              <p><strong>Với MedConnect, bạn có thể:</strong></p>
              <ul>
                <li>🔍 Tìm kiếm bác sĩ chuyên khoa uy tín</li>
                <li>📅 Đặt lịch khám nhanh chóng, tiện lợi</li>
                <li>💬 Tư vấn sức khỏe với AI chatbot</li>
                <li>💳 Thanh toán trực tuyến an toàn</li>
                <li>🎥 Khám bệnh từ xa qua video call</li>
              </ul>
              <center>
                <a href="http://localhost:3000/tim-bac-si" class="button" style="color: white;">Tìm bác sĩ ngay</a>
              </center>
              <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email hoặc hotline.</p>
              <p>Chúc bạn có trải nghiệm tuyệt vời!</p>
              <p style="margin-top: 30px;">Trân trọng,<br><strong style="color: #667eea;">Đội ngũ MedConnect</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 MedConnect. All rights reserved.</p>
              <p>📧 support@medconnect.vn | 📞 1900-xxxx | 🌐 www.medconnect.vn</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

export const generatePasswordResetEmail = (userName, resetLink) => {
  return {
    subject: '🔐 Yêu cầu đặt lại mật khẩu - MedConnect',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ef4444; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
            .code-box { background: white; padding: 15px; border-radius: 8px; border: 2px dashed #ef4444; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔐 Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Xin chào <strong>${userName}</strong>,</p>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản MedConnect của bạn.</p>
              <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
              <center>
                <a href="${resetLink}" class="button" style="color: white;">Đặt lại mật khẩu</a>
              </center>
              <div class="warning">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul style="margin: 10px 0;">
                  <li>Link này chỉ có hiệu lực trong <strong>1 giờ</strong></li>
                  <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                  <li>Không chia sẻ link này với bất kỳ ai</li>
                </ul>
              </div>
              <p>Nếu nút không hoạt động, copy link sau vào trình duyệt:</p>
              <div class="code-box">
                <p style="word-break: break-all; color: #ef4444; margin: 0; font-size: 12px;">${resetLink}</p>
              </div>
              <p style="margin-top: 30px;">Trân trọng,<br><strong style="color: #ef4444;">Đội ngũ MedConnect</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 MedConnect. All rights reserved.</p>
              <p>📧 support@medconnect.vn | 📞 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

export const generateDoctorApprovalEmail = (doctorName, email, tempPassword) => {
  return {
    subject: '🎉 Chúc mừng! Tài khoản bác sĩ của bạn đã được duyệt',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .credential { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 10px 0; border: 1px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Chúc mừng, Bác sĩ ${doctorName}!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Kính gửi <strong>BS. ${doctorName}</strong>,</p>
              <p>Chúng tôi vui mừng thông báo rằng hồ sơ đăng ký bác sĩ của bạn đã được <strong style="color: #10b981;">PHÊ DUYỆT THÀNH CÔNG</strong>! 🎊</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #10b981;">📋 Thông tin đăng nhập</h3>
                <div class="credential">
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                </div>
                <div class="credential">
                  <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px; color: #ef4444; font-size: 16px;">${tempPassword}</code></p>
                </div>
                <p style="margin-top: 15px; color: #dc2626; font-size: 14px;">
                  ⚠️ <strong>Quan trọng:</strong> Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để bảo mật tài khoản.
                </p>
              </div>

              <center>
                <a href="http://localhost:3000/dang-nhap" class="button" style="color: white;">Đăng nhập ngay</a>
              </center>

              <p><strong>Bước tiếp theo:</strong></p>
              <ol style="line-height: 2;">
                <li>Đăng nhập vào hệ thống bằng thông tin trên</li>
                <li>Đổi mật khẩu mới an toàn hơn</li>
                <li>Hoàn thiện hồ sơ cá nhân và lịch làm việc</li>
                <li>Bắt đầu tiếp nhận lịch hẹn từ bệnh nhân</li>
              </ol>

              <p>Cảm ơn bạn đã tham gia cùng MedConnect. Chúng tôi mong muốn hợp tác lâu dài với bạn!</p>
              
              <p style="margin-top: 30px;">Trân trọng,<br><strong style="color: #10b981;">Ban quản trị MedConnect</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 MedConnect. All rights reserved.</p>
              <p>📧 doctor-support@medconnect.vn | 📞 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

/**
 * Email for PENDING appointment (yellow status) - sent after successful payment
 */
export const generateAppointmentPendingEmail = (appointmentDetails) => {
  const { patientName, doctorName, date, time, specialty, type, appointmentId } = appointmentDetails;
  
  return {
    subject: `⏳ Đặt lịch thành công - Chờ bác sĩ xác nhận`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { color: #111; text-align: right; }
            .button { display: inline-block; background: #f59e0b; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .status-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 15px 0; }
            .notice { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">⏳ Đặt lịch thành công!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Xin chào <strong>${patientName}</strong>,</p>
              <p>Cảm ơn bạn đã đặt lịch khám tại MedConnect. Thanh toán của bạn đã được xác nhận thành công! 💳</p>
              
              <center>
                <span class="status-badge">⏳ ĐANG CHỜ BÁC SĨ XÁC NHẬN</span>
              </center>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #f59e0b;">📋 Thông tin lịch khám</h3>
                <div class="info-row">
                  <span class="info-label">Mã lịch hẹn:</span>
                  <span class="info-value"><strong>#${appointmentId}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Bác sĩ:</span>
                  <span class="info-value">${doctorName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Chuyên khoa:</span>
                  <span class="info-value">${specialty}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Hình thức:</span>
                  <span class="info-value">${type === 'ONLINE' ? '🎥 Khám online' : '🏥 Khám tại phòng khám'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ngày khám:</span>
                  <span class="info-value"><strong style="color: #f59e0b;">${date}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Giờ khám:</span>
                  <span class="info-value"><strong style="color: #f59e0b;">${time}</strong></span>
                </div>
              </div>

              <center>
                <a href="http://localhost:3000/nguoi-dung/lich-hen" class="button" style="color: white;">Xem chi tiết lịch hẹn</a>
              </center>

              <div class="notice">
                <strong>📌 Điều gì sẽ xảy ra tiếp theo?</strong>
                <ul style="margin: 10px 0; line-height: 1.8;">
                  <li>Bác sĩ sẽ xem xét và xác nhận lịch hẹn trong <strong>24 giờ</strong></li>
                  <li>Bạn sẽ nhận được email thông báo ngay khi bác sĩ xác nhận</li>
                  <li>Nếu có thay đổi, chúng tôi sẽ liên hệ với bạn qua email/số điện thoại</li>
                  <li>Bạn có thể theo dõi trạng thái lịch hẹn trong mục "Lịch hẹn của tôi"</li>
                </ul>
              </div>

              <p>Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi qua hotline hoặc email.</p>
              
              <p style="margin-top: 30px;">Trân trọng,<br><strong style="color: #f59e0b;">Đội ngũ MedConnect</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 MedConnect. All rights reserved.</p>
              <p>📧 support@medconnect.vn | 📞 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

/**
 * Email for CONFIRMED appointment (green status) - sent when doctor confirms
 */
export const generateAppointmentConfirmationEmail = (appointmentDetails) => {
  const { patientName, doctorName, date, time, specialty, type, appointmentId } = appointmentDetails;
  
  return {
    subject: `✅ Bác sĩ đã xác nhận lịch khám - ${date} ${time}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { color: #111; text-align: right; }
            .button { display: inline-block; background: #10b981; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .status-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 15px 0; }
            .notice { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✅ Bác sĩ đã xác nhận!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Xin chào <strong>${patientName}</strong>,</p>
              <p>Tin tốt! Bác sĩ <strong>${doctorName}</strong> đã xác nhận lịch khám của bạn. 🎉</p>
              
              <center>
                <span class="status-badge">✅ ĐÃ XÁC NHẬN</span>
              </center>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #10b981;">📋 Thông tin lịch khám</h3>
                <div class="info-row">
                  <span class="info-label">Mã lịch hẹn:</span>
                  <span class="info-value"><strong>#${appointmentId}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Bác sĩ:</span>
                  <span class="info-value">${doctorName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Chuyên khoa:</span>
                  <span class="info-value">${specialty}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Hình thức:</span>
                  <span class="info-value">${type === 'ONLINE' ? '🎥 Khám online' : '🏥 Khám tại phòng khám'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ngày khám:</span>
                  <span class="info-value"><strong style="color: #10b981;">${date}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Giờ khám:</span>
                  <span class="info-value"><strong style="color: #10b981;">${time}</strong></span>
                </div>
              </div>

              <center>
                <a href="http://localhost:3000/nguoi-dung/lich-hen" class="button" style="color: white;">Xem chi tiết lịch hẹn</a>
              </center>

              <div class="notice">
                <strong>📌 Lưu ý quan trọng:</strong>
                <ul style="margin: 10px 0; line-height: 1.8;">
                  <li>Vui lòng đến trước giờ hẹn <strong>15 phút</strong> để làm thủ tục</li>
                  <li>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
                  <li>Chuẩn bị sẵn các kết quả xét nghiệm/hình ảnh liên quan (nếu có)</li>
                  <li>Nếu cần hủy hoặc đổi lịch, vui lòng thông báo trước <strong>24 giờ</strong></li>
                  ${type === 'ONLINE' ? '<li>Link video call sẽ được gửi trước giờ hẹn 10 phút qua email</li>' : '<li>Địa chỉ: Phòng khám MedConnect - 123 Đường ABC, Quận XYZ</li>'}
                </ul>
              </div>

              <p>Chúng tôi rất mong được phục vụ bạn. Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
              
              <p style="margin-top: 30px;">Chúc bạn sức khỏe!<br><strong style="color: #10b981;">Đội ngũ MedConnect</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 MedConnect. All rights reserved.</p>
              <p>📧 support@medconnect.vn | 📞 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};
