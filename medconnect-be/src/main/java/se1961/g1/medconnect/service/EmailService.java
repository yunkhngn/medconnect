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
            
            // Load template from resources
            Map<String, String> variables = new HashMap<>();
            variables.put("doctorName", doctorName != null ? escapeHtml(doctorName) : "");
            variables.put("email", toEmail != null ? escapeHtml(toEmail) : "");
            variables.put("password", password != null ? escapeHtml(password) : "");
            
            String htmlContent = templateLoader.loadTemplate("doctor-approval", variables);
            System.out.println("Email HTML content loaded from template, length: " + htmlContent.length());
            
            String emailId = sendEmail(toEmail, "Chúc mừng! Hồ sơ bác sĩ đã được phê duyệt - MedConnect", htmlContent);
            System.out.println("✅ Email sent successfully! Email ID: " + emailId);
        } catch (IOException e) {
            System.err.println("❌ Failed to load doctor approval email template: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể tải template email phê duyệt: " + e.getMessage());
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
    
    /**
     * Escape HTML special characters to prevent injection
     */
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
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

}
