package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.MedicalRecord;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.PatientRepository;
import se1961.g1.medconnect.repository.UserRepository;
import se1961.g1.medconnect.service.AppointmentService;
import se1961.g1.medconnect.service.MedicalRecordService;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentService appointmentService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get my EMR profile (patient)
     */
    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String firebaseUid = authentication.getName();
            MedicalRecord record = medicalRecordService.getByPatientFirebaseUid(firebaseUid);
            
            if (record == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No medical record found"));
            }
            
            System.out.println("=== GET EMR DEBUG ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Detail (first 200 chars): " + record.getDetail().substring(0, Math.min(200, record.getDetail().length())));
            System.out.println("Detail starts with: " + record.getDetail().substring(0, Math.min(50, record.getDetail().length())));
            System.out.println("=== END DEBUG ===");
            
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create new EMR (patient)
     */
    @PostMapping
    public ResponseEntity<?> createMedicalRecord(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String firebaseUid = authentication.getName();
            String detail = (String) request.get("detail");
            
            System.out.println("=== CREATE EMR DEBUG ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Detail received (first 200 chars): " + detail.substring(0, Math.min(200, detail.length())));
            System.out.println("Detail length: " + detail.length());
            
            MedicalRecord record = medicalRecordService.createForPatient(firebaseUid, detail);
            
            System.out.println("Saved detail (first 200 chars): " + record.getDetail().substring(0, Math.min(200, record.getDetail().length())));
            System.out.println("=== END DEBUG ===");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Medical record created successfully",
                "record", record
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update EMR profile (patient can only update patient_profile part)
     */
    @PatchMapping("/my-profile")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String firebaseUid = authentication.getName();
            String detail = (String) request.get("detail");
            
            MedicalRecord updated = medicalRecordService.updatePatientProfile(firebaseUid, detail);
            
            return ResponseEntity.ok(Map.of(
                "message", "Medical record updated successfully",
                "record", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get patient's EMR by doctor (for consultation)
     */
    @GetMapping("/patient/{patientUserId}")
    public ResponseEntity<?> getPatientRecord(
            @PathVariable Long patientUserId,
            Authentication authentication) {
        try {
            // TODO: Verify doctor has active appointment with this patient
            MedicalRecord record = medicalRecordService.getByPatientUserId(patientUserId);
            
            if (record == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No medical record found"));
            }
            
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Return only entries array from EMR detail for easier consumption by FE
     * Patient can only access their own entries
     */
    @GetMapping("/patient/{patientUserId}/entries")
    public ResponseEntity<?> getPatientEntries(
            @PathVariable Long patientUserId,
            Authentication authentication) {
        try {
            String firebaseUid = authentication.getName();
            
            // Find patient from authenticated user
            User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElse(null);
            
            // Check if authenticated user is the patient themselves
            // If not a patient, check if they're a doctor (doctors can access patient records)
            boolean isAuthorized = false;
            if (patient != null && patient.getUserId().equals(patientUserId)) {
                // Patient accessing their own record
                isAuthorized = true;
            } else if (user.getRole() != null && user.getRole().name().equals("DOCTOR")) {
                // Doctor accessing patient record (for consultation)
                isAuthorized = true;
            } else if (user.getRole() != null && user.getRole().name().equals("ADMIN")) {
                // Admin can access all records
                isAuthorized = true;
            }
            
            if (!isAuthorized) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. You can only access your own medical records."));
            }
            
            MedicalRecord record = medicalRecordService.getByPatientUserId(patientUserId);
            if (record == null || record.getDetail() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No medical record found"));
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> emr = objectMapper.readValue(record.getDetail(), Map.class);
            Object entries = emr.get("medical_records");
            if (!(entries instanceof List<?>)) {
                entries = new ArrayList<>();
            }
            return ResponseEntity.ok(entries);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get medical record entries by appointment ID
     * Patient can only access their own appointments
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getMedicalRecordByAppointment(
            @PathVariable Long appointmentId,
            Authentication authentication) {
        try {
            String firebaseUid = authentication.getName();
            
            // Find user from authenticated firebaseUid
            User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            // Get appointment
            Appointment appointment = appointmentService.getAppointmentById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            
            // Check if authenticated user is authorized to access this appointment
            Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElse(null);
            
            boolean isAuthorized = false;
            if (patient != null && appointment.getPatient() != null 
                && appointment.getPatient().getUserId().equals(patient.getUserId())) {
                // Patient accessing their own appointment
                isAuthorized = true;
            } else if (user.getRole() != null && user.getRole().name().equals("DOCTOR")) {
                // Doctor can access appointments for consultation
                isAuthorized = true;
            } else if (user.getRole() != null && user.getRole().name().equals("ADMIN")) {
                // Admin can access all appointments
                isAuthorized = true;
            }
            
            if (!isAuthorized) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. You can only access your own appointments."));
            }
            
            // Get patient from appointment
            Patient appointmentPatient = appointment.getPatient();
            if (appointmentPatient == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Patient not found for this appointment"));
            }
            
            // Get medical record entries
            MedicalRecord record = medicalRecordService.getByPatientUserId(appointmentPatient.getUserId());
            if (record == null || record.getDetail() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No medical record found"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> emr = objectMapper.readValue(record.getDetail(), Map.class);
            Object entries = emr.get("medical_records");
            if (!(entries instanceof List<?>)) {
                entries = new ArrayList<>();
            }
            
            // Find entry matching this appointment
            // Try to match by appointment_id or visit_id
            List<Map<String, Object>> matchingEntries = new ArrayList<>();
            if (entries instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> entriesList = (List<Map<String, Object>>) entries;
                for (Map<String, Object> entry : entriesList) {
                    // Check if entry has appointment_id matching
                    if (entry.containsKey("appointment_id") 
                        && entry.get("appointment_id") != null
                        && entry.get("appointment_id").equals(appointmentId)) {
                        matchingEntries.add(entry);
                        break;
                    }
                }
            }
            
            // If no exact match, return the most recent entry (as fallback)
            if (matchingEntries.isEmpty() && entries instanceof List<?> && !((List<?>) entries).isEmpty()) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> entriesList = (List<Map<String, Object>>) entries;
                if (!entriesList.isEmpty()) {
                    matchingEntries.add(entriesList.get(entriesList.size() - 1));
                }
            }
            
            // Return prescription data in format expected by frontend
            if (!matchingEntries.isEmpty()) {
                Map<String, Object> entry = matchingEntries.get(0);
                Map<String, Object> response = new HashMap<>();
                response.put("medications", entry.get("prescriptions"));
                response.put("note", entry.get("notes"));
                response.put("diagnosis", entry.get("diagnosis"));
                return ResponseEntity.ok(response);
            } else {
                // No matching entry found, return empty
                Map<String, Object> response = new HashMap<>();
                response.put("medications", new ArrayList<>());
                response.put("note", "");
                response.put("diagnosis", null);
                return ResponseEntity.ok(response);
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add medical record entry by doctor
     */
    @PostMapping("/patient/{patientUserId}/add-entry")
    public ResponseEntity<?> addMedicalEntry(
            @PathVariable Long patientUserId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            // String firebaseUid = authentication.getName();
            Object entryData = request.get("entry");
            
            // TODO: Verify doctor has permission
            
            MedicalRecord updated = medicalRecordService.addMedicalRecordEntry(
                patientUserId, 
                entryData
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Medical entry added successfully",
                "record", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete my EMR (patient)
     */
    @DeleteMapping("/my-profile")
    public ResponseEntity<?> deleteMyProfile(Authentication authentication) {
        try {
            String firebaseUid = authentication.getName();
            medicalRecordService.deleteByPatientFirebaseUid(firebaseUid);
            
            System.out.println("=== DELETE EMR ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("EMR deleted successfully");
            
            return ResponseEntity.ok(Map.of(
                "message", "Medical record deleted successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all medical records (Admin only)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllRecords() {
        try {
            List<MedicalRecord> records = medicalRecordService.getAllRecords();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}

