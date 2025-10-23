package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.service.PatientService;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    /**
     * Get current logged-in patient profile (authenticated)
     * GET /api/patient/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            Patient patient = patientService.getPatientByFirebaseUid(firebaseUid)
                    .orElseThrow(() -> new Exception("Patient not found"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("name", patient.getName());
            profile.put("email", patient.getEmail());
            profile.put("phone", patient.getPhone());
            profile.put("address", patient.getAddress());
            profile.put("gender", patient.getGender());
            profile.put("bloodType", patient.getBloodType());
            profile.put("allergies", patient.getAllergies());
            profile.put("emergencyContactName", patient.getEmergencyContactName());
            profile.put("emergencyContactPhone", patient.getEmergencyContactPhone());
            profile.put("socialInsurance", patient.getSocialInsurance());
            profile.put("citizenship", patient.getCitizenship());
            
            // Format dates
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            if (patient.getDateOfBirth() != null) {
                profile.put("dateOfBirth", sdf.format(patient.getDateOfBirth()));
            }
            if (patient.getInsuranceValidTo() != null) {
                profile.put("insuranceValidTo", sdf.format(patient.getInsuranceValidTo()));
            }
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update current logged-in patient profile (authenticated)
     * PATCH /api/patient/profile
     */
    @PatchMapping("/profile")
    public ResponseEntity<?> updateMyProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            Patient patient = patientService.getPatientByFirebaseUid(firebaseUid)
                    .orElseThrow(() -> new Exception("Patient not found"));

            // Update allowed fields
            if (request.containsKey("name")) {
                patient.setName((String) request.get("name"));
            }
            if (request.containsKey("phone")) {
                patient.setPhone((String) request.get("phone"));
            }
            if (request.containsKey("address")) {
                patient.setAddress((String) request.get("address"));
            }
            if (request.containsKey("gender")) {
                patient.setGender((String) request.get("gender"));
            }
            if (request.containsKey("bloodType")) {
                patient.setBloodType((String) request.get("bloodType"));
            }
            if (request.containsKey("allergies")) {
                patient.setAllergies((String) request.get("allergies"));
            }
            if (request.containsKey("emergencyContactName")) {
                patient.setEmergencyContactName((String) request.get("emergencyContactName"));
            }
            if (request.containsKey("emergencyContactPhone")) {
                patient.setEmergencyContactPhone((String) request.get("emergencyContactPhone"));
            }
            if (request.containsKey("socialInsurance")) {
                patient.setSocialInsurance((String) request.get("socialInsurance"));
            }
            if (request.containsKey("citizenship")) {
                patient.setCitizenship((String) request.get("citizenship"));
            }
            if (request.containsKey("dateOfBirth") && request.get("dateOfBirth") != null) {
                String dateStr = String.valueOf(request.get("dateOfBirth"));
                if (!dateStr.isEmpty() && !dateStr.equals("null")) {
                    try {
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                        sdf.setLenient(false);
                        patient.setDateOfBirth(sdf.parse(dateStr));
                    } catch (Exception e) {
                        throw new Exception("Invalid date format for dateOfBirth. Use yyyy-MM-dd. Error: " + e.getMessage());
                    }
                }
            }
            if (request.containsKey("insuranceValidTo") && request.get("insuranceValidTo") != null) {
                String dateStr = String.valueOf(request.get("insuranceValidTo"));
                if (!dateStr.isEmpty() && !dateStr.equals("null")) {
                    try {
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                        sdf.setLenient(false);
                        patient.setInsuranceValidTo(sdf.parse(dateStr));
                    } catch (Exception e) {
                        throw new Exception("Invalid date format for insuranceValidTo. Use yyyy-MM-dd. Error: " + e.getMessage());
                    }
                }
            }

            patientService.savePatient(patient);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("name", patient.getName());
            response.put("phone", patient.getPhone());
            response.put("address", patient.getAddress());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get patient by user ID (admin only)
     * GET /api/patient/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getPatientByUserId(@PathVariable Long userId) {
        return patientService.getPatientByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update patient (admin only)
     * POST /api/patient/update
     */
    @PostMapping("/update")
    public ResponseEntity<?> updatePatient(@RequestBody Patient patient) {
        Patient saved = patientService.savePatient(patient);
        return ResponseEntity.ok(saved);
    }
}
