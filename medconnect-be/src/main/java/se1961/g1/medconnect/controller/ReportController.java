package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.Report;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.pojo.Admin;
import se1961.g1.medconnect.repository.UserRepository;
import se1961.g1.medconnect.service.ReportService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long appointmentId = Long.parseLong(request.get("appointmentId").toString());
            Long patientId = user.getUserId();
            String reason = request.get("reason") != null ? request.get("reason").toString() : "";
            
            if (reason.trim().isEmpty()) {
                throw new RuntimeException("Vui lòng điền lý do báo xấu");
            }
            
            Report report = reportService.createReport(appointmentId, patientId, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Báo xấu đã được gửi thành công");
            response.put("data", Map.of("reportId", report.getReportId()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllReports(Authentication authentication) {
        try {
            // Check if user is admin
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!(user instanceof Admin)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Chỉ admin mới có thể xem danh sách báo xấu");
                return ResponseEntity.status(403).body(error);
            }
            
            var reports = reportService.getAllReports();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reports);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getReportsByStatus(@PathVariable String status, Authentication authentication) {
        try {
            // Check if user is admin
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!(user instanceof Admin)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Chỉ admin mới có thể xem danh sách báo xấu");
                return ResponseEntity.status(403).body(error);
            }
            
            Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase());
            var reports = reportService.getReportsByStatus(reportStatus);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reports);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{reportId}/status")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if user is admin
            if (!(user instanceof Admin)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Chỉ admin mới có thể cập nhật trạng thái báo xấu");
                return ResponseEntity.status(403).body(error);
            }
            
            String statusStr = request.get("status").toString().toUpperCase();
            Report.ReportStatus status = Report.ReportStatus.valueOf(statusStr);
            
            Report report = reportService.updateReportStatus(reportId, status, user.getUserId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái thành công");
            response.put("data", Map.of("reportId", report.getReportId(), "status", report.getStatus().name()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId, Authentication authentication) {
        try {
            // Check if user is admin
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!(user instanceof Admin)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Chỉ admin mới có thể xóa báo xấu");
                return ResponseEntity.status(403).body(error);
            }
            
            reportService.deleteReport(reportId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa báo xấu thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

