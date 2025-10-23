package se1961.g1.medconnect.controller;

import com.resend.core.exception.ResendException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.service.EmailService;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    /**
     * Send a test email
     * POST /api/email/test
     */
    @PostMapping("/test")
    public ResponseEntity<?> sendTestEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String subject = request.getOrDefault("subject", "Test Email from MedConnect");
            String content = request.getOrDefault("content", "<h1>Hello from MedConnect!</h1><p>This is a test email.</p>");
            
            if (to == null || to.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email address is required"));
            }
            
            String emailId = emailService.sendEmail(to, subject, content);
            
            return ResponseEntity.ok(Map.of(
                "message", "Email sent successfully",
                "emailId", emailId,
                "to", to
            ));
        } catch (ResendException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }

    /**
     * Send appointment confirmation email
     * POST /api/email/appointment/confirmation
     */
    @PostMapping("/appointment/confirmation")
    public ResponseEntity<?> sendAppointmentConfirmation(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String to = request.get("to");
            String patientName = request.get("patientName");
            String doctorName = request.get("doctorName");
            String appointmentDate = request.get("appointmentDate");
            String appointmentTime = request.get("appointmentTime");
            String specialization = request.get("specialization");
            
            // Validation
            if (to == null || patientName == null || doctorName == null || 
                appointmentDate == null || appointmentTime == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields"));
            }
            
            String emailId = emailService.sendAppointmentConfirmation(
                to, patientName, doctorName, appointmentDate, appointmentTime, 
                specialization != null ? specialization : "Khám tổng quát"
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Appointment confirmation email sent successfully",
                "emailId", emailId
            ));
        } catch (ResendException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }

    /**
     * Send appointment reminder email
     * POST /api/email/appointment/reminder
     */
    @PostMapping("/appointment/reminder")
    public ResponseEntity<?> sendAppointmentReminder(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String to = request.get("to");
            String patientName = request.get("patientName");
            String doctorName = request.get("doctorName");
            String appointmentDate = request.get("appointmentDate");
            String appointmentTime = request.get("appointmentTime");
            
            if (to == null || patientName == null || doctorName == null || 
                appointmentDate == null || appointmentTime == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields"));
            }
            
            String emailId = emailService.sendAppointmentReminder(
                to, patientName, doctorName, appointmentDate, appointmentTime
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Appointment reminder email sent successfully",
                "emailId", emailId
            ));
        } catch (ResendException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }

    /**
     * Send password reset email
     * POST /api/email/password-reset
     */
    @PostMapping("/password-reset")
    public ResponseEntity<?> sendPasswordReset(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String userName = request.get("userName");
            String resetLink = request.get("resetLink");
            
            if (to == null || userName == null || resetLink == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields"));
            }
            
            String emailId = emailService.sendPasswordResetEmail(to, userName, resetLink);
            
            return ResponseEntity.ok(Map.of(
                "message", "Password reset email sent successfully",
                "emailId", emailId
            ));
        } catch (ResendException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }

    /**
     * Send welcome email
     * POST /api/email/welcome
     */
    @PostMapping("/welcome")
    public ResponseEntity<?> sendWelcome(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String userName = request.get("userName");
            
            if (to == null || userName == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields: to, userName"));
            }
            
            String emailId = emailService.sendWelcomeEmail(to, userName);
            
            return ResponseEntity.ok(Map.of(
                "message", "Welcome email sent successfully",
                "emailId", emailId
            ));
        } catch (ResendException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }
}

