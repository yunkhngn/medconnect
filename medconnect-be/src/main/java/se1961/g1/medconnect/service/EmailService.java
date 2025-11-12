package se1961.g1.medconnect.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.util.EmailTemplateLoader;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private final Resend resend;
    
    @Autowired
    private EmailTemplateLoader templateLoader;

    @Value("${resend.from-email}")
    private String fromEmail;

    public EmailService(@Value("${resend.api-key}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    /**
     * Send a simple text email
     */
    public String sendEmail(String to, String subject, String htmlContent) throws ResendException {
        System.out.println("=== EmailService.sendEmail ===");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("HTML Content Length: " + (htmlContent != null ? htmlContent.length() : 0));
        
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent)
                    .build();

            System.out.println("Sending email via Resend...");
            CreateEmailResponse response = resend.emails().send(params);
            String emailId = response.getId();
            System.out.println("✅ Email sent successfully! Email ID: " + emailId);
            return emailId;
        } catch (ResendException e) {
            System.err.println("❌ ResendException: " + e.getMessage());
            System.err.println("Error details: " + e.toString());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Unexpected error in sendEmail: " + e.getMessage());
            e.printStackTrace();
            throw new ResendException("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Send appointment PENDING confirmation email (ORANGE/CAM - After Payment)
     * Sent after payment is successful, waiting for doctor confirmation
     */
    public String sendAppointmentPendingConfirmation(
            String to,
            String patientName,
            String doctorName,
            String appointmentDate,
            String appointmentTime,
            String appointmentType
    ) throws ResendException {
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put("patientName", patientName);
            variables.put("doctorName", doctorName);
            variables.put("appointmentDate", appointmentDate);
            variables.put("appointmentTime", appointmentTime);
            variables.put("appointmentType", appointmentType);
            
            String html = templateLoader.loadTemplate("appointment-pending", variables);
            String subject = "Đơn đặt lịch đang chờ xác nhận - MedConnect";
            
            return sendEmail(to, subject, html);
        } catch (IOException e) {
            throw new ResendException("Failed to load email template: " + e.getMessage());
        }
    }

    /**
     * Send appointment CONFIRMED email (GREEN/XANH - After Doctor Confirms)
     * Sent when doctor confirms the appointment
     */
    public String sendAppointmentConfirmation(
            String to,
            String patientName,
            String doctorName,
            String appointmentDate,
            String appointmentTime,
            String specialization
    ) throws ResendException {
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put("patientName", patientName);
            variables.put("doctorName", doctorName);
            variables.put("appointmentDate", appointmentDate);
            variables.put("appointmentTime", appointmentTime);
            variables.put("specialization", specialization);
            
            String html = templateLoader.loadTemplate("appointment-confirmation", variables);
            String subject = "Xác nhận đặt lịch khám - MedConnect";
            
            return sendEmail(to, subject, html);
        } catch (IOException e) {
            throw new ResendException("Failed to load email template: " + e.getMessage());
        }
    }

    /**
     * Send appointment reminder email
     */
    public String sendAppointmentReminder(
            String to,
            String patientName,
            String doctorName,
            String appointmentDate,
            String appointmentTime
    ) throws ResendException {
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put("patientName", patientName);
            variables.put("doctorName", doctorName);
            variables.put("appointmentDate", appointmentDate);
            variables.put("appointmentTime", appointmentTime);
            
            String html = templateLoader.loadTemplate("appointment-reminder", variables);
            String subject = "Nhắc nhở: Lịch khám sắp tới - MedConnect";
            
            return sendEmail(to, subject, html);
        } catch (IOException e) {
            throw new ResendException("Failed to load email template: " + e.getMessage());
        }
    }

    /**
     * Send password reset email
     */
    public String sendPasswordResetEmail(
            String to,
            String userName,
            String resetLink
    ) throws ResendException {
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put("userName", userName);
            variables.put("resetLink", resetLink);
            
            String html = templateLoader.loadTemplate("password-reset", variables);
            String subject = "Đặt lại mật khẩu - MedConnect";
            
            return sendEmail(to, subject, html);
        } catch (IOException e) {
            throw new ResendException("Failed to load email template: " + e.getMessage());
        }
    }

    /**
     * Send welcome email
     */
    public String sendWelcomeEmail(
            String to,
            String userName
    ) throws ResendException {
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put("userName", userName);
            
            String html = templateLoader.loadTemplate("welcome", variables);
            String subject = "Chào mừng đến với MedConnect!";
            
            return sendEmail(to, subject, html);
        } catch (IOException e) {
            throw new ResendException("Failed to load email template: " + e.getMessage());
        }
    }

    /**
     * Send doctor application welcome email
     */
    public void sendDoctorApplicationWelcomeEmail(String toEmail, String doctorName, String phone) {
        try {
            String htmlContent = buildDoctorWelcomeEmailHtml(doctorName, toEmail, phone);
            sendEmail(toEmail, "Chào mừng bạn đến với MedConnect - Thông tin tài khoản", htmlContent);
        } catch (ResendException e) {
            System.err.println("Failed to send doctor welcome email: " + e.getMessage());
            // Don't throw - email failure shouldn't break registration
        }
    }

    /**
     * Send doctor approval email with login credentials
     */
    public void sendDoctorApprovalEmail(String toEmail, String doctorName, String password) {
        try {
            System.out.println("=== Sending Doctor Approval Email ===");
            System.out.println("To: " + toEmail);
            System.out.println("Doctor Name: " + doctorName);
            System.out.println("Password: " + password);
            
            String htmlContent = buildDoctorApprovalEmailHtml(doctorName, toEmail, password);
            System.out.println("Email HTML content generated, length: " + htmlContent.length());
            
            String emailId = sendEmail(toEmail, "Chúc mừng! Hồ sơ bác sĩ đã được phê duyệt - MedConnect", htmlContent);
            System.out.println("✅ Email sent successfully! Email ID: " + emailId);
        } catch (ResendException e) {
            System.err.println("❌ Failed to send doctor approval email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email phê duyệt: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Unexpected error sending doctor approval email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email phê duyệt: " + e.getMessage());
        }
    }

    private String buildDoctorWelcomeEmailHtml(String doctorName, String email, String phone) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                        .credential { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
                        .credential strong { color: #1976d2; }
                        .status-badge { display: inline-block; background: #fff3cd; color: #856404; padding: 8px 15px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                        ul { padding-left: 20px; }
                        li { margin: 8px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Chào mừng đến với MedConnect!</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>Cảm ơn bạn đã ứng tuyển trở thành bác sĩ trên nền tảng MedConnect. Đơn ứng tuyển của bạn đã được ghi nhận thành công!</p>
                            
                            <div class="info-box">
                                <h3>📧 Thông tin đăng nhập của bạn:</h3>
                                <div class="credential">
                                    <strong>Email đăng ký:</strong> %s
                                </div>
                                <div class="credential">
                                    <strong>Số điện thoại:</strong> %s
                                </div>
                                <p style="color: #e74c3c; margin-top: 15px;">
                                    ⚠️ <strong>Quan trọng:</strong> Admin sẽ tạo tài khoản Firebase cho bạn khi phê duyệt. 
                                    Thông tin đăng nhập chính thức sẽ được gửi qua email sau khi tài khoản được kích hoạt.
                                </p>
                            </div>

                            <div class="info-box">
                                <h3>⏳ Trạng thái tài khoản:</h3>
                                <span class="status-badge">ĐANG CHỜ DUYỆT (PENDING)</span>
                                <p>Tài khoản của bạn đang chờ Admin xét duyệt. Thời gian xử lý thường từ <strong>3-5 ngày làm việc</strong>.</p>
                            </div>

                            <div class="info-box">
                                <h3>📋 Quy trình tiếp theo:</h3>
                                <ul>
                                    <li>✅ <strong>Bước 1:</strong> Admin xem xét hồ sơ ứng tuyển của bạn</li>
                                    <li>✅ <strong>Bước 2:</strong> Xác minh thông tin và chứng chỉ hành nghề</li>
                                    <li>✅ <strong>Bước 3:</strong> Admin tạo tài khoản Firebase và phê duyệt</li>
                                    <li>✅ <strong>Bước 4:</strong> Bạn nhận email với thông tin đăng nhập chính thức</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="http://localhost:3000/dang-nhap" class="button">Đăng nhập (sau khi được duyệt)</a>
                            </div>

                            <p style="color: #666; font-size: 14px;">
                                💡 <strong>Lưu ý:</strong> Bạn sẽ nhận được email thông tin đăng nhập sau khi Admin phê duyệt tài khoản. 
                                Vui lòng kiểm tra email thường xuyên.
                            </p>

                            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@medconnect.vn">support@medconnect.vn</a></p>

                            <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ MedConnect</strong></p>
                        </div>
                        <div class="footer">
                            <p>© 2025 MedConnect. All rights reserved.</p>
                            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(doctorName, email, phone);
    }

    private String buildDoctorApprovalEmailHtml(String doctorName, String email, String password) {
        // Escape special characters in password to prevent HTML injection
        String escapedPassword = password
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
        
        String escapedEmail = email
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;");
        
        String escapedName = doctorName
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;");
        
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
                        .wrapper { background: #f3f4f6; padding: 40px 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #10b981 0%%, #059669 50%%, #14b8a6 100%%); color: white; padding: 50px 30px; text-align: center; position: relative; }
                        .header h1 { margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
                        .content { padding: 45px 35px; }
                        .greeting { font-size: 18px; color: #111827; margin-bottom: 20px; }
                        .greeting strong { color: #10b981; font-weight: 700; }
                        .success-badge { background: rgba(255, 255, 255, 0.25); border-radius: 50%%; width: 100px; height: 100px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; }
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
                        .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
                        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; }
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="container">
                            <div class="header">
                                <div class="success-badge">✓</div>
                                <h1>Chúc mừng! Hồ sơ đã được phê duyệt</h1>
                            </div>
                            <div class="content">
                                <p class="greeting">Xin chào <strong>%s</strong>,</p>
                                
                                <p>Chúng tôi rất vui mừng thông báo rằng hồ sơ ứng tuyển bác sĩ của bạn đã được phê duyệt thành công!</p>
                                
                                <div class="credentials-card">
                                    <h3>🔐 Thông tin đăng nhập của bạn:</h3>
                                    <div class="credential-row">
                                        <p><span class="label">Email:</span></p>
                                        <p class="value">%s</p>
                                    </div>
                                    <div class="password-box">
                                        <p style="margin: 0; color: #92400e; font-weight: 700;">Mật khẩu tạm thời:</p>
                                        <div class="password">%s</div>
                                        <p style="margin: 10px 0 0 0; color: #78350f; font-size: 14px;">⚠️ Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên</p>
                                    </div>
                                </div>
                                
                                <div class="warning-box">
                                    <strong>⚠️ Lưu ý quan trọng:</strong>
                                    <ul>
                                        <li>Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để bảo mật tài khoản</li>
                                        <li>Không chia sẻ thông tin đăng nhập với bất kỳ ai</li>
                                        <li>Nếu bạn quên mật khẩu, vui lòng sử dụng chức năng "Quên mật khẩu"</li>
                                    </ul>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="http://localhost:3000/dang-nhap" class="cta-button">Đăng nhập ngay</a>
                                </div>
                                
                                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                    💡 <strong>Bước tiếp theo:</strong> Sau khi đăng nhập, bạn có thể cập nhật thông tin cá nhân, 
                                    quản lý lịch làm việc và bắt đầu nhận lịch hẹn từ bệnh nhân.
                                </p>
                                
                                <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@medconnect.vn">support@medconnect.vn</a></p>
                                
                                <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ MedConnect</strong></p>
                            </div>
                            <div class="footer">
                                <p>© 2025 MedConnect. All rights reserved.</p>
                                <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """, escapedName, escapedEmail, escapedPassword);
    }
}
