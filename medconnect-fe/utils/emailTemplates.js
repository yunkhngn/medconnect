/**
 * Email Templates for MedConnect
 * Modern, Professional HTML email templates with clean design
 */

export const generateWelcomeEmail = (userName, userEmail) => {
  return {
    subject: 'Chào mừng đến với MedConnect - Sức khỏe trong tầm tay!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
            .wrapper { background: #f3f4f6; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #14b8a6 100%); color: white; padding: 50px 30px; text-align: center; position: relative; }
            .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="2" fill="white" opacity="0.1"/></svg>') repeat; opacity: 0.3; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 700; position: relative; z-index: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.2); letter-spacing: -0.5px; }
            .header .subtitle { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; position: relative; z-index: 1; }
            .content { padding: 45px 35px; }
            .greeting { font-size: 18px; color: #111827; margin-bottom: 20px; }
            .greeting strong { color: #667eea; font-weight: 700; }
            .info-card { background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%); border-left: 5px solid #667eea; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .info-card h3 { margin: 0 0 15px 0; color: #4338ca; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-card p { margin: 8px 0; font-size: 15px; }
            .info-card strong { color: #4338ca; }
            .features { background: #f9fafb; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .features h3 { color: #111827; margin-top: 0; font-size: 18px; font-weight: 700; }
            .feature-item { display: flex; align-items: start; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
            .feature-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-right: 15px; flex-shrink: 0; color: white; font-weight: bold; }
            .feature-text { flex: 1; }
            .feature-text strong { color: #111827; display: block; margin-bottom: 3px; font-size: 15px; }
            .feature-text span { color: #6b7280; font-size: 14px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s; }
            .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 30px 0; }
            .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; }
            .footer-links { margin: 15px 0; }
            .footer-links a { color: #667eea; text-decoration: none; margin: 0 10px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>Chào mừng đến với MedConnect</h1>
                <p class="subtitle">Sức khỏe trong tầm tay bạn</p>
              </div>
              
              <div class="content">
                <p class="greeting">Xin chào <strong>${userName}</strong>,</p>
                
                <p>Chúng tôi vô cùng vui mừng chào đón bạn đến với <strong>MedConnect</strong> - nền tảng chăm sóc sức khỏe trực tuyến thông minh và hiện đại nhất Việt Nam!</p>
                
                <div class="info-card">
                  <h3>Thông tin tài khoản</h3>
                  <p><strong>Email:</strong> ${userEmail}</p>
                  <p><strong>Tên hiển thị:</strong> ${userName}</p>
                  <p style="margin-bottom: 0;"><strong>Vai trò:</strong> Bệnh nhân</p>
                </div>
                
                <div class="features">
                  <h3>Trải nghiệm dịch vụ tuyệt vời với MedConnect</h3>
                  
                  <div class="feature-item">
                    <div class="feature-icon">1</div>
                    <div class="feature-text">
                      <strong>Tìm bác sĩ chuyên khoa</strong>
                      <span>Hệ thống bác sĩ uy tín, chuyên môn cao từ các bệnh viện hàng đầu</span>
                    </div>
                  </div>
                  
                  <div class="feature-item">
                    <div class="feature-icon">2</div>
                    <div class="feature-text">
                      <strong>Đặt lịch khám nhanh chóng</strong>
                      <span>Chỉ với vài thao tác đơn giản, lịch khám của bạn được xác nhận ngay</span>
                    </div>
                  </div>
                  
                  <div class="feature-item">
                    <div class="feature-icon">3</div>
                    <div class="feature-text">
                      <strong>Khám bệnh từ xa</strong>
                      <span>Video call HD với bác sĩ, tiết kiệm thời gian di chuyển</span>
                    </div>
                  </div>
                  
                  <div class="feature-item">
                    <div class="feature-icon">4</div>
                    <div class="feature-text">
                      <strong>Tư vấn AI Chatbot</strong>
                      <span>Hỗ trợ 24/7, giải đáp thắc mắc sức khỏe mọi lúc mọi nơi</span>
                    </div>
                  </div>
                  
                  <div class="feature-item">
                    <div class="feature-icon">5</div>
                    <div class="feature-text">
                      <strong>Thanh toán an toàn</strong>
                      <span>Hỗ trợ đa dạng phương thức: VNPay, Momo, thẻ ATM/Credit</span>
                    </div>
                  </div>
                </div>
                
                <center>
                  <a href="http://localhost:3000/tim-bac-si" class="cta-button">Tìm bác sĩ ngay</a>
                </center>
                
                <div class="divider"></div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn sàng giúp đỡ bạn!<br>
                  Liên hệ: <a href="mailto:support@medconnect.vn" style="color: #667eea; text-decoration: none; font-weight: 600;">support@medconnect.vn</a> hoặc hotline <strong>1900-xxxx</strong>
                </p>
                
                <p style="margin-top: 30px; color: #9ca3af; font-size: 14px;">
                  Trân trọng,<br>
                  <strong style="color: #667eea;">Đội ngũ MedConnect</strong>
                </p>
              </div>
              
              <div class="footer">
                <div class="footer-links">
                  <a href="http://localhost:3000">Trang chủ</a> •
                  <a href="http://localhost:3000/bang-gia">Bảng giá</a> •
                  <a href="http://localhost:3000/chinh-sach">Chính sách</a>
                </div>
                <p style="margin: 15px 0 5px 0; color: #9ca3af;">© 2025 MedConnect. All rights reserved.</p>
                <p style="margin: 5px 0; color: #9ca3af;">Chăm sóc sức khỏe - An tâm mọi lúc</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

export const generatePasswordResetEmail = (userName, resetLink) => {
  return {
    subject: 'Yêu cầu đặt lại mật khẩu - MedConnect',
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
              <h1 style="margin: 0; font-size: 28px;">Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Xin chào <strong>${userName}</strong>,</p>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản MedConnect của bạn.</p>
              <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
              <center>
                <a href="${resetLink}" class="button" style="color: white;">Đặt lại mật khẩu</a>
              </center>
              <div class="warning">
                <strong>Lưu ý quan trọng:</strong>
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
              <p>support@medconnect.vn | 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

export const generateDoctorApprovalEmail = (doctorName, email, tempPassword) => {
  return {
    subject: 'Chúc mừng! Hồ sơ bác sĩ đã được phê duyệt - MedConnect',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
            .wrapper { background: #f3f4f6; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #14b8a6 100%); color: white; padding: 50px 30px; text-align: center; position: relative; }
            .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="2" fill="white" opacity="0.1"/></svg>') repeat; opacity: 0.3; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 700; position: relative; z-index: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.2); letter-spacing: -0.5px; }
            .content { padding: 45px 35px; }
            .greeting { font-size: 18px; color: #111827; margin-bottom: 20px; }
            .greeting strong { color: #10b981; font-weight: 700; }
            .success-badge { background: rgba(255, 255, 255, 0.25); border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; position: relative; z-index: 1; backdrop-filter: blur(10px); }
            .credentials-card { background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0; }
            .credentials-card h3 { color: #065f46; margin-top: 0; font-size: 18px; font-weight: 700; }
            .credential-row { background: white; padding: 15px; border-radius: 8px; margin: 12px 0; border-left: 4px solid #10b981; }
            .credential-row p { margin: 5px 0; }
            .credential-row .label { color: #6b7280; font-size: 14px; }
            .credential-row .value { color: #111827; font-weight: 700; font-size: 16px; }
            .password-box { background: #fef2f2; border: 3px dashed #ef4444; padding: 20px; border-radius: 12px; text-align: center; margin: 15px 0; }
            .password-box .password { color: #dc2626; font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 2px; padding: 10px; background: white; border-radius: 8px; display: inline-block; margin: 10px 0; }
            .warning-box { background: #fef3c7; border-left: 5px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .warning-box strong { color: #92400e; }
            .warning-box ul { margin: 10px 0; padding-left: 20px; }
            .warning-box li { color: #78350f; margin: 8px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
            .steps-list { background: #f9fafb; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .steps-list h3 { color: #111827; margin-top: 0; font-size: 18px; font-weight: 700; }
            .steps-list ol { padding-left: 25px; }
            .steps-list li { color: #4b5563; margin: 12px 0; line-height: 1.6; }
            .steps-list li strong { color: #111827; }
            .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 30px 0; }
            .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="success-badge">✓</div>
                <h1>Chúc mừng, BS. ${doctorName}!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Hồ sơ của bạn đã được phê duyệt</p>
              </div>
              
              <div class="content">
                <p class="greeting">Kính gửi <strong>Bác sĩ ${doctorName}</strong>,</p>
                
                <p>Chúc mừng! Hồ sơ đăng ký bác sĩ của quý vị đã được Ban quản trị MedConnect xem xét và <strong style="color: #10b981;">phê duyệt thành công</strong>!</p>
                
                <p>Từ giờ, quý vị có thể bắt đầu tiếp nhận và khám chữa bệnh cho bệnh nhân thông qua nền tảng MedConnect.</p>
                
                <div class="credentials-card">
                  <h3>Thông tin đăng nhập hệ thống</h3>
                  
                  <div class="credential-row">
                    <p class="label">Tên đăng nhập (Email)</p>
                    <p class="value">${email}</p>
                  </div>
                  
                  <div class="password-box">
                    <p style="margin: 0 0 10px 0; color: #dc2626; font-weight: 600;">Mật khẩu tạm thời</p>
                    <div class="password">${tempPassword}</div>
                  </div>
                </div>
                
                <div class="warning-box">
                  <strong>Quan trọng - Vui lòng đọc kỹ:</strong>
                  <ul>
                    <li><strong>Đổi mật khẩu ngay</strong> sau lần đăng nhập đầu tiên để bảo mật tài khoản</li>
                    <li><strong>Không chia sẻ</strong> mật khẩu này với bất kỳ ai</li>
                    <li>Mật khẩu phải có ít nhất <strong>8 ký tự</strong>, bao gồm chữ hoa, chữ thường và số</li>
                    <li>Lưu mật khẩu ở nơi an toàn hoặc sử dụng trình quản lý mật khẩu</li>
                  </ul>
                </div>
                
                <center>
                  <a href="http://localhost:3000/dang-nhap" class="cta-button">Đăng nhập ngay</a>
                </center>
                
                <div class="steps-list">
                  <h3>Các bước tiếp theo</h3>
                  <ol>
                    <li><strong>Đăng nhập</strong> vào hệ thống bằng email và mật khẩu tạm thời ở trên</li>
                    <li><strong>Đổi mật khẩu mới</strong> ngay tại trang Cài đặt tài khoản</li>
                    <li><strong>Hoàn thiện hồ sơ</strong> cá nhân: thêm ảnh đại diện, thông tin liên hệ, học vấn</li>
                    <li><strong>Thiết lập lịch làm việc</strong> để bệnh nhân có thể đặt lịch khám</li>
                    <li><strong>Bắt đầu tiếp nhận</strong> lịch hẹn từ bệnh nhân</li>
                  </ol>
                </div>
                
                <div class="divider"></div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Cần hỗ trợ? Liên hệ với chúng tôi:<br>
                  <a href="mailto:doctor-support@medconnect.vn" style="color: #10b981; text-decoration: none; font-weight: 600;">doctor-support@medconnect.vn</a><br>
                  Hotline: <strong>1900-xxxx</strong> (Ext: 2)
                </p>
                
                <p style="margin-top: 30px; color: #9ca3af; font-size: 14px;">
                  Trân trọng,<br>
                  <strong style="color: #10b981;">Ban Quản trị MedConnect</strong>
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 15px 0 5px 0; color: #9ca3af;">© 2025 MedConnect. All rights reserved.</p>
                <p style="margin: 5px 0; color: #9ca3af;">Nền tảng chăm sóc sức khỏe trực tuyến hàng đầu Việt Nam</p>
              </div>
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
    subject: `Đặt lịch thành công - Chờ bác sĩ xác nhận`,
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
              <h1 style="margin: 0; font-size: 28px;">Đặt lịch thành công!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Xin chào <strong>${patientName}</strong>,</p>
              <p>Cảm ơn bạn đã đặt lịch khám tại MedConnect. Thanh toán của bạn đã được xác nhận thành công!</p>
              
              <center>
                <span class="status-badge">ĐANG CHỜ BÁC SĨ XÁC NHẬN</span>
              </center>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #f59e0b;">Thông tin lịch khám</h3>
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
                  <span class="info-value">${type === 'ONLINE' ? 'Khám online' : 'Khám tại phòng khám'}</span>
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
                <strong>Điều gì sẽ xảy ra tiếp theo?</strong>
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
              <p>support@medconnect.vn | 1900-xxxx</p>
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
    subject: `Bác sĩ đã xác nhận lịch khám - ${date} ${time}`,
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
              <h1 style="margin: 0; font-size: 28px;">Bác sĩ đã xác nhận!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Xin chào <strong>${patientName}</strong>,</p>
              <p>Tin tốt! Bác sĩ <strong>${doctorName}</strong> đã xác nhận lịch khám của bạn.</p>
              
              <center>
                <span class="status-badge">ĐÃ XÁC NHẬN</span>
              </center>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #10b981;">Thông tin lịch khám</h3>
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
                  <span class="info-value">${type === 'ONLINE' ? 'Khám online' : 'Khám tại phòng khám'}</span>
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
                <strong>Lưu ý quan trọng:</strong>
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
              <p>support@medconnect.vn | 1900-xxxx</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};
