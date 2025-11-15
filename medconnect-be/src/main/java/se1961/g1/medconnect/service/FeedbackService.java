package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Feedback;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.repository.AppointmentRepository;
import se1961.g1.medconnect.repository.DoctorRepository;
import se1961.g1.medconnect.repository.FeedbackRepository;
import se1961.g1.medconnect.repository.PatientRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedbackService {
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    public Feedback createFeedback(Long appointmentId, Long patientId, int rating, String comment) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        // Check if feedback already exists for this appointment
        Feedback existing = feedbackRepository.findByAppointmentId(appointmentId);
        if (existing != null) {
            throw new RuntimeException("Feedback already exists for this appointment");
        }
        
        Feedback feedback = new Feedback();
        feedback.setAppointment(appointment);
        feedback.setPatient(patient);
        feedback.setDoctor(appointment.getDoctor());
        feedback.setRating(rating);
        feedback.setComment(comment);
        
        return feedbackRepository.save(feedback);
    }
    
    public Feedback getFeedbackByAppointment(Long appointmentId) {
        return feedbackRepository.findByAppointmentId(appointmentId);
    }
    
    public List<Map<String, Object>> getRecentFeedbacksByDoctor(Long doctorId, int limit) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        List<Feedback> feedbacks = feedbackRepository.findByDoctorOrderByCreatedAtDesc(doctor);
        
        return feedbacks.stream()
                .limit(limit)
                .map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("feedbackId", f.getFeedbackId());
                    map.put("rating", f.getRating());
                    map.put("comment", f.getComment());
                    map.put("createdAt", f.getCreatedAt());
                    map.put("patientName", f.getPatient() != null ? 
                            (f.getPatient().getName() != null ? f.getPatient().getName() : "Bệnh nhân") : "Bệnh nhân");
                    return map;
                })
                .collect(Collectors.toList());
    }
    
    public Double getAverageRatingByDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        Double avg = feedbackRepository.findAverageRatingByDoctor(doctor);
        return avg != null ? avg : 0.0;
    }
    
    public Map<String, Object> getDoctorFeedbackSummary(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        List<Feedback> allFeedbacks = feedbackRepository.findByDoctor(doctor);
        Double avgRating = feedbackRepository.findAverageRatingByDoctor(doctor);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", avgRating != null ? avgRating : 0.0);
        summary.put("totalFeedbacks", allFeedbacks.size());
        
        List<Map<String, Object>> recentFeedbacks = allFeedbacks.stream()
                .sorted((f1, f2) -> f2.getCreatedAt().compareTo(f1.getCreatedAt()))
                .limit(3)
                .map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("feedbackId", f.getFeedbackId());
                    map.put("rating", f.getRating());
                    map.put("comment", f.getComment());
                    map.put("createdAt", f.getCreatedAt());
                    map.put("patientName", f.getPatient() != null ? 
                            (f.getPatient().getName() != null ? f.getPatient().getName() : "Bệnh nhân") : "Bệnh nhân");
                    return map;
                })
                .collect(Collectors.toList());
        
        summary.put("recentFeedbacks", recentFeedbacks);
        
        return summary;
    }
    
    /**
     * Get recent feedbacks for homepage testimonials
     */
    public List<Map<String, Object>> getRecentFeedbacks(int limit) {
        List<Feedback> feedbacks = feedbackRepository.findAll().stream()
                .sorted((f1, f2) -> {
                    if (f1.getCreatedAt() == null && f2.getCreatedAt() == null) return 0;
                    if (f1.getCreatedAt() == null) return 1;
                    if (f2.getCreatedAt() == null) return -1;
                    return f2.getCreatedAt().compareTo(f1.getCreatedAt());
                })
                .filter(f -> f.getComment() != null && !f.getComment().trim().isEmpty())
                .limit(limit)
                .collect(Collectors.toList());
        
        return feedbacks.stream()
                .map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("feedbackId", f.getFeedbackId());
                    map.put("rating", f.getRating());
                    map.put("comment", f.getComment());
                    map.put("createdAt", f.getCreatedAt());
                    
                    // Patient info
                    if (f.getPatient() != null) {
                        map.put("patientName", f.getPatient().getName() != null ? 
                                f.getPatient().getName() : "Bệnh nhân");
                        map.put("patientAvatar", f.getPatient().getAvatarUrl());
                    } else {
                        map.put("patientName", "Bệnh nhân");
                        map.put("patientAvatar", null);
                    }
                    
                    return map;
                })
                .collect(Collectors.toList());
    }
}

