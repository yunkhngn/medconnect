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
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(to)
                .subject(subject)
                .html(htmlContent)
                .build();

        CreateEmailResponse response = resend.emails().send(params);
        return response.getId();
    }

    /**
     * Send appointment confirmation email
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
}
