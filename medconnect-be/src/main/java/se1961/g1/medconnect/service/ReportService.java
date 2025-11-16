package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.*;
import se1961.g1.medconnect.repository.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    public Report createReport(Long appointmentId, Long patientId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        // Check if report already exists for this appointment
        List<Report> existing = reportRepository.findAll().stream()
                .filter(r -> r.getAppointment() != null && r.getAppointment().getAppointmentId().equals(appointmentId))
                .collect(Collectors.toList());
        
        if (!existing.isEmpty()) {
            throw new RuntimeException("Báo xấu đã tồn tại cho cuộc hẹn này");
        }
        
        Report report = new Report();
        report.setAppointment(appointment);
        report.setPatient(patient);
        report.setDoctor(appointment.getDoctor());
        report.setReason(reason);
        report.setStatus(Report.ReportStatus.PENDING);
        
        return reportRepository.save(report);
    }
    
    public List<Map<String, Object>> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapReportToDTO)
                .collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getReportsByStatus(Report.ReportStatus status) {
        return reportRepository.findByStatus(status).stream()
                .map(this::mapReportToDTO)
                .collect(Collectors.toList());
    }
    
    public Report updateReportStatus(Long reportId, Report.ReportStatus status, Long adminId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        Admin admin = adminRepository.findById(adminId.intValue())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        report.setStatus(status);
        report.setReviewedBy(admin);
        report.setReviewedAt(LocalDateTime.now());
        
        return reportRepository.save(report);
    }
    
    public void deleteReport(Long reportId) {
        reportRepository.deleteById(reportId);
    }
    
    private Map<String, Object> mapReportToDTO(Report report) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("reportId", report.getReportId());
        dto.put("reason", report.getReason());
        dto.put("status", report.getStatus().name());
        dto.put("createdAt", report.getCreatedAt());
        dto.put("reviewedAt", report.getReviewedAt());
        
        if (report.getPatient() != null) {
            dto.put("patientId", report.getPatient().getUserId());
            dto.put("patientName", report.getPatient().getName());
        }
        
        if (report.getDoctor() != null) {
            dto.put("doctorId", report.getDoctor().getUserId());
            dto.put("doctorName", report.getDoctor().getName());
        }
        
        if (report.getAppointment() != null) {
            dto.put("appointmentId", report.getAppointment().getAppointmentId());
            dto.put("appointmentDate", report.getAppointment().getDate());
        }
        
        if (report.getReviewedBy() != null) {
            dto.put("reviewedById", report.getReviewedBy().getUserId());
            dto.put("reviewedByName", report.getReviewedBy().getName());
        }
        
        return dto;
    }
}

