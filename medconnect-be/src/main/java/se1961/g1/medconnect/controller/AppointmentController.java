package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.dto.CreateAppointmentRequest;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.service.AppointmentService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;

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
            
            // Doctor details
            if (appointment.getDoctor() != null) {
                Map<String, Object> doctorInfo = new HashMap<>();
                doctorInfo.put("id", appointment.getDoctor().getUserId());
                doctorInfo.put("name", appointment.getDoctor().getName());
                doctorInfo.put("email", appointment.getDoctor().getEmail());
                doctorInfo.put("phone", appointment.getDoctor().getPhone());
                doctorInfo.put("specialization", appointment.getDoctor().getSpecialization() != null 
                    ? appointment.getDoctor().getSpecialization().name() : null);
                doctorInfo.put("avatar", appointment.getDoctor().getAvatarUrl());
                response.put("doctor", doctorInfo);
            }
            
            // Patient details
            if (appointment.getPatient() != null) {
                Map<String, Object> patientInfo = new HashMap<>();
                patientInfo.put("id", appointment.getPatient().getUserId());
                patientInfo.put("name", appointment.getPatient().getName());
                patientInfo.put("email", appointment.getPatient().getEmail());
                patientInfo.put("phone", appointment.getPatient().getPhone());
                response.put("patient", patientInfo);
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
    public ResponseEntity<?> getMyAppointments(Authentication authentication) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            List<Appointment> appointments = appointmentService.getAppointmentsByPatientFirebaseUid(firebaseUid);
            
            // Convert to safe response format
            List<Map<String, Object>> response = appointments.stream()
                .map(appointment -> {
                    Map<String, Object> apt = new HashMap<>();
                    apt.put("appointmentId", appointment.getAppointmentId());
                    apt.put("status", appointment.getStatus().name());
                    apt.put("date", appointment.getDate().toString());
                    apt.put("slot", appointment.getSlot().name());
                    apt.put("type", appointment.getType().name());
                    apt.put("createdAt", appointment.getCreatedAt());
                    
                    // Doctor info
                    if (appointment.getDoctor() != null) {
                        Map<String, Object> doctor = new HashMap<>();
                        doctor.put("id", appointment.getDoctor().getUserId());
                        doctor.put("name", appointment.getDoctor().getName());
                        doctor.put("specialization", appointment.getDoctor().getSpecialization() != null 
                            ? appointment.getDoctor().getSpecialization().name() : null);
                        doctor.put("avatar", appointment.getDoctor().getAvatarUrl());
                        apt.put("doctor", doctor);
                    }
                    
                    return apt;
                })
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get doctor's appointments
     */
    @GetMapping("/doctor")
    public ResponseEntity<?> getDoctorAppointments(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            
            if (startDate == null) {
                startDate = LocalDate.now();
            }
            if (endDate == null) {
                endDate = startDate.plusDays(30);
            }
            
            List<Appointment> appointments = appointmentService.getAppointmentsByDoctorFirebaseUid(
                    firebaseUid, startDate, endDate);
            
            // Convert to safe response format
            List<Map<String, Object>> response = appointments.stream()
                .map(appointment -> {
                    Map<String, Object> apt = new HashMap<>();
                    apt.put("appointmentId", appointment.getAppointmentId());
                    apt.put("status", appointment.getStatus().name());
                    apt.put("date", appointment.getDate().toString());
                    apt.put("slot", appointment.getSlot().name());
                    apt.put("type", appointment.getType().name());
                    apt.put("createdAt", appointment.getCreatedAt());
                    
                    // Patient info
                    if (appointment.getPatient() != null) {
                        Map<String, Object> patient = new HashMap<>();
                        patient.put("id", appointment.getPatient().getUserId());
                        patient.put("name", appointment.getPatient().getName());
                        patient.put("email", appointment.getPatient().getEmail());
                        patient.put("phone", appointment.getPatient().getPhone());
                        apt.put("patient", patient);
                    }
                    
                    return apt;
                })
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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

