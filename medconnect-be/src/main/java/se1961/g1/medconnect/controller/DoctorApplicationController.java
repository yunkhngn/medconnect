package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.DoctorApplicationDTO;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.service.DoctorService;
import se1961.g1.medconnect.service.EmailService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor-applications")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorApplicationController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private EmailService emailService;

    /**
     * Submit doctor application (public endpoint - no authentication required)
     * Creates a new doctor account with PENDING status
     * Login credentials: email (username) + phone (password)
     */
    @PostMapping
    public ResponseEntity<?> submitApplication(@RequestBody DoctorApplicationDTO dto) {
        try {
            // Validate required fields
            if (dto.getFullName() == null || dto.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Họ tên không được để trống"));
            }
            if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email không được để trống"));
            }
            if (dto.getPhone() == null || dto.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Số điện thoại không được để trống"));
            }
            if (dto.getSpecialtyId() == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Vui lòng chọn chuyên khoa"));
            }

            // Create doctor from application
            Doctor doctor = doctorService.createDoctorFromApplication(dto);

            // Send welcome email with login credentials
            try {
                emailService.sendDoctorApplicationWelcomeEmail(
                    doctor.getEmail(), 
                    doctor.getName(), 
                    dto.getPhone()
                );
            } catch (Exception emailError) {
                System.err.println("Failed to send welcome email: " + emailError.getMessage());
                // Continue even if email fails
            }

            // Return success response with account info
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đơn ứng tuyển đã được gửi thành công! Vui lòng kiểm tra email.");
            response.put("data", Map.of(
                    "doctorId", doctor.getUserId(),
                    "name", doctor.getName(),
                    "email", doctor.getEmail(),
                    "status", doctor.getStatus().toString(),
                    "note", "📧 Chúng tôi đã gửi email xác nhận đến " + doctor.getEmail() + ". " +
                            "Admin sẽ xét duyệt và tạo tài khoản Firebase cho bạn. " +
                            "Thông tin đăng nhập sẽ được gửi qua email sau khi phê duyệt (3-5 ngày làm việc)."
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra khi xử lý đơn ứng tuyển"));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
