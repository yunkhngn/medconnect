package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.MedicalRecord;
import se1961.g1.medconnect.service.MedicalRecordService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

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

