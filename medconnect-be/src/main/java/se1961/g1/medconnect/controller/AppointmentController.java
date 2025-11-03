package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.dto.CreateAppointmentRequest;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.MedicalRecord;
import se1961.g1.medconnect.service.AppointmentService;
import se1961.g1.medconnect.service.MedicalRecordService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private MedicalRecordService medicalRecordService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Helper method to build patient info with ID photo from EMR
     */
    private Map<String, Object> buildPatientInfo(se1961.g1.medconnect.pojo.Patient patient) {
        Map<String, Object> patientInfo = new HashMap<>();
        patientInfo.put("id", patient.getUserId());
        patientInfo.put("firebaseUid", patient.getFirebaseUid());
        patientInfo.put("name", patient.getName());
        patientInfo.put("email", patient.getEmail());
        patientInfo.put("phone", patient.getPhone());
        patientInfo.put("dateOfBirth", patient.getDateOfBirth());
        patientInfo.put("address", patient.getAddress());
        patientInfo.put("avatar", patient.getAvatarUrl());
        
        // Fetch ID photo from EMR
        try {
            MedicalRecord record = medicalRecordService.getByPatientFirebaseUid(patient.getFirebaseUid());
            if (record != null && record.getDetail() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> emrData = objectMapper.readValue(record.getDetail(), Map.class);
                if (emrData.containsKey("patient_profile")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> profile = (Map<String, Object>) emrData.get("patient_profile");
                    if (profile != null && profile.containsKey("id_photo_url")) {
                        patientInfo.put("idPhotoUrl", profile.get("id_photo_url"));
                    }
                }
            }
        } catch (Exception e) {
            // Ignore EMR fetch errors, just don't include ID photo
            System.err.println("Failed to fetch ID photo from EMR: " + e.getMessage());
        }
        
        return patientInfo;
    }

    /**
     * Get all appointments (Admin only)
     */
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get appointment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentService.getAppointmentById(id)
                    .orElseThrow(() -> new Exception("Appointment not found"));
            
            // Build response with doctor and patient details
            Map<String, Object> response = new HashMap<>();
            response.put("appointmentId", appointment.getAppointmentId());
            response.put("status", appointment.getStatus().name());
            response.put("date", appointment.getDate().toString());
            response.put("slot", appointment.getSlot().name());
            response.put("type", appointment.getType().name());
            response.put("createdAt", appointment.getCreatedAt());
            response.put("reason", appointment.getReason());
            
            // Doctor details
            if (appointment.getDoctor() != null) {
                Map<String, Object> doctorInfo = new HashMap<>();
                doctorInfo.put("id", appointment.getDoctor().getUserId());
                doctorInfo.put("name", appointment.getDoctor().getName());
                doctorInfo.put("email", appointment.getDoctor().getEmail());
                doctorInfo.put("phone", appointment.getDoctor().getPhone());
                doctorInfo.put("specialization", appointment.getDoctor().getSpeciality() != null 
                    ? appointment.getDoctor().getSpeciality().getName() : null);
                doctorInfo.put("avatar", appointment.getDoctor().getAvatarUrl());
                response.put("doctor", doctorInfo);
            }
            
            // Patient details (with ID photo from EMR)
            if (appointment.getPatient() != null) {
                response.put("patient", buildPatientInfo(appointment.getPatient()));
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get my appointments (Patient)
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyAppointments(
            Authentication authentication,
            @RequestParam(required = false) String type) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            System.out.println("[AppointmentController] /api/appointments/my for firebaseUid=" + firebaseUid + ", type=" + type);
            List<Appointment> appointments = appointmentService.getAppointmentsByPatientFirebaseUid(firebaseUid);
            System.out.println("[AppointmentController] Found " + appointments.size() + " appointments for patient");
            
            // Filter by type if provided
            if (type != null && !type.isEmpty()) {
                try {
                    se1961.g1.medconnect.enums.AppointmentType appointmentType = 
                        se1961.g1.medconnect.enums.AppointmentType.valueOf(type.toUpperCase());
                    appointments = appointments.stream()
                        .filter(apt -> apt.getType() == appointmentType)
                        .toList();
                    System.out.println("[AppointmentController] After type filter (" + type + "): " + appointments.size() + " appointments");
                } catch (IllegalArgumentException e) {
                    System.out.println("[AppointmentController] Invalid type: " + type);
                }
            }
            
            // Convert to safe response format
            List<Map<String, Object>> response = appointments.stream()
                .map(appointment -> {
                    Map<String, Object> apt = new HashMap<>();
                    apt.put("id", appointment.getAppointmentId());
                    apt.put("appointmentId", appointment.getAppointmentId());
                    apt.put("status", appointment.getStatus().name());
                    apt.put("date", appointment.getDate().toString());
                    apt.put("appointmentDate", appointment.getDate().toString());
                    apt.put("slot", appointment.getSlot().name());
                    apt.put("type", appointment.getType().name());
                    apt.put("createdAt", appointment.getCreatedAt());
                    apt.put("reason", appointment.getReason());
                    
                    // Doctor info
                    if (appointment.getDoctor() != null) {
                        Map<String, Object> doctor = new HashMap<>();
                        doctor.put("id", appointment.getDoctor().getUserId());
                        doctor.put("firebaseUid", appointment.getDoctor().getFirebaseUid());
                        doctor.put("name", appointment.getDoctor().getName());
                        doctor.put("doctorName", appointment.getDoctor().getName());
                        doctor.put("email", appointment.getDoctor().getEmail());
                        doctor.put("phone", appointment.getDoctor().getPhone());
                        doctor.put("specialization", appointment.getDoctor().getSpeciality() != null 
                            ? appointment.getDoctor().getSpeciality().getName() : null);
                        doctor.put("specialty", appointment.getDoctor().getSpeciality() != null 
                            ? appointment.getDoctor().getSpeciality().getName() : null);
                        doctor.put("avatar", appointment.getDoctor().getAvatarUrl());
                        doctor.put("doctorAvatar", appointment.getDoctor().getAvatarUrl());
                        apt.put("doctor", doctor);
                    }
                    
                    return apt;
                })
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[AppointmentController] Error in /my: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get doctor's appointments
     */
    @GetMapping("/doctor")
    public ResponseEntity<?> getDoctorAppointments(
            Authentication authentication,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            System.out.println("[AppointmentController] Get doctor appointments for firebaseUid: " + firebaseUid + ", type=" + type);
            
            // For online appointments, get ALL (past + future), otherwise use default range
            if (type != null && type.equalsIgnoreCase("ONLINE")) {
                startDate = LocalDate.now().minusYears(1); // 1 year ago
                endDate = LocalDate.now().plusYears(1); // 1 year ahead
            } else {
                if (startDate == null) {
                    startDate = LocalDate.now().minusMonths(1); // Include past month
                }
                if (endDate == null) {
                    endDate = startDate.plusDays(60); // 60 days ahead
                }
            }
            
            System.out.println("[AppointmentController] Date range: " + startDate + " to " + endDate);
            
            List<Appointment> appointments = appointmentService.getAppointmentsByDoctorFirebaseUid(
                    firebaseUid, startDate, endDate);
            
            System.out.println("[AppointmentController] Found " + appointments.size() + " appointments before type filter");
            
            // Filter by type if provided
            if (type != null && !type.isEmpty()) {
                try {
                    se1961.g1.medconnect.enums.AppointmentType appointmentType = 
                        se1961.g1.medconnect.enums.AppointmentType.valueOf(type.toUpperCase());
                    appointments = appointments.stream()
                        .filter(apt -> apt.getType() == appointmentType)
                        .toList();
                    System.out.println("[AppointmentController] After type filter (" + type + "): " + appointments.size() + " appointments");
                } catch (IllegalArgumentException e) {
                    System.out.println("[AppointmentController] Invalid type: " + type);
                }
            }
            
            // Convert to safe response format
            List<Map<String, Object>> response = appointments.stream()
                .map(appointment -> {
                    Map<String, Object> apt = new HashMap<>();
                    apt.put("id", appointment.getAppointmentId());
                    apt.put("appointmentId", appointment.getAppointmentId());
                    apt.put("status", appointment.getStatus().name());
                    apt.put("date", appointment.getDate().toString());
                    apt.put("appointmentDate", appointment.getDate().toString());
                    apt.put("slot", appointment.getSlot().name());
                    apt.put("type", appointment.getType().name());
                    apt.put("createdAt", appointment.getCreatedAt());
                    apt.put("reason", appointment.getReason());
                    
                    // Patient info (with ID photo from EMR)
                    if (appointment.getPatient() != null) {
                        Map<String, Object> patientInfo = buildPatientInfo(appointment.getPatient());
                        apt.put("patient", patientInfo);
                        apt.put("patientName", patientInfo.get("name"));
                        apt.put("patientEmail", patientInfo.get("email"));
                        apt.put("patientPhone", patientInfo.get("phone"));
                        apt.put("patientAvatar", patientInfo.get("avatar"));
                    }
                    
                    return apt;
                })
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[AppointmentController] Error in /doctor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get available slots for a doctor on a specific date
     */
    @GetMapping("/doctor/{doctorId}/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        try {
            List<String> availableSlots = appointmentService.getAvailableSlots(doctorId, date);
            return ResponseEntity.ok(Map.of("availableSlots", availableSlots));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create new appointment
     */
    @PostMapping
    public ResponseEntity<?> createAppointment(
            Authentication authentication,
            @RequestBody CreateAppointmentRequest request
    ) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            Appointment appointment = appointmentService.createAppointment(firebaseUid, request);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update appointment status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            String status = body.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            AppointmentDTO updated = appointmentService.updateAppointmentStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel appointment
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            appointmentService.cancelAppointment(id);
            return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete appointment (Admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok(Map.of("message", "Appointment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Confirm appointment (Doctor only)
     */
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentService.confirmAppointment(id);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Deny appointment (Doctor only)
     */
    @PatchMapping("/{id}/deny")
    public ResponseEntity<?> denyAppointment(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentService.denyAppointment(id);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Start appointment (Doctor only)
     */
    @PatchMapping("/{id}/start")
    public ResponseEntity<?> startAppointment(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentService.startAppointment(id);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Finish appointment (Doctor only)
     */
    @PatchMapping("/{id}/finish")
    public ResponseEntity<?> finishAppointment(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentService.finishAppointment(id);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

