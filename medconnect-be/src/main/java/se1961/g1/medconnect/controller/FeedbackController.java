package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.Feedback;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.UserRepository;
import se1961.g1.medconnect.service.FeedbackService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    
    @Autowired
    private FeedbackService feedbackService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<?> createFeedback(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            // Get email from authentication details (set by FirebaseFilter)
            String email = (String) authentication.getDetails();
            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Email not found in authentication");
            }
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long appointmentId = Long.parseLong(request.get("appointmentId").toString());
            Long patientId = user.getUserId();
            int rating = Integer.parseInt(request.get("rating").toString());
            String comment = request.get("comment") != null ? request.get("comment").toString() : "";
            
            Feedback feedback = feedbackService.createFeedback(appointmentId, patientId, rating, comment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Feedback created successfully");
            response.put("data", Map.of(
                    "feedbackId", feedback.getFeedbackId(),
                    "rating", feedback.getRating(),
                    "comment", feedback.getComment()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getFeedbackByAppointment(@PathVariable Long appointmentId) {
        try {
            Feedback feedback = feedbackService.getFeedbackByAppointment(appointmentId);
            
            if (feedback == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", null);
                return ResponseEntity.ok(response);
            }
            
            Map<String, Object> feedbackData = new HashMap<>();
            feedbackData.put("feedbackId", feedback.getFeedbackId());
            feedbackData.put("rating", feedback.getRating());
            feedbackData.put("comment", feedback.getComment());
            feedbackData.put("createdAt", feedback.getCreatedAt());
            feedbackData.put("patientName", feedback.getPatient() != null ? 
                    (feedback.getPatient().getName() != null ? feedback.getPatient().getName() : "Bệnh nhân") : "Bệnh nhân");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", feedbackData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/doctor/{doctorId}/summary")
    public ResponseEntity<?> getDoctorFeedbackSummary(@PathVariable Long doctorId) {
        try {
            Map<String, Object> summary = feedbackService.getDoctorFeedbackSummary(doctorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", summary);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get recent public feedbacks for homepage testimonials
     * GET /api/feedback/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentFeedbacks(@RequestParam(defaultValue = "6") int limit) {
        try {
            List<Map<String, Object>> feedbacks = feedbackService.getRecentFeedbacks(limit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", feedbacks);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

