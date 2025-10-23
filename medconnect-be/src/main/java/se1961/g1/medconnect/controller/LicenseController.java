package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.License;
import se1961.g1.medconnect.repository.LicenseRepository;
import se1961.g1.medconnect.service.DoctorService;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/licenses")
@CrossOrigin(origins = "http://localhost:3000")
public class LicenseController {

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private DoctorService doctorService;

    /**
     * Get all licenses of current doctor
     */
    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyLicenses(Authentication authentication) throws Exception {
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid)
                .orElseThrow(() -> new Exception("Doctor not found"));

        List<License> licenses = licenseRepository.findByDoctorOrderByIssuedDateDesc(doctor);

        List<Map<String, Object>> result = licenses.stream()
                .map(this::mapLicenseToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get active license of current doctor
     */
    @GetMapping("/my/active")
    public ResponseEntity<Map<String, Object>> getMyActiveLicense(Authentication authentication) throws Exception {
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid)
                .orElseThrow(() -> new Exception("Doctor not found"));

        Optional<License> license = licenseRepository.findActiveLicenseByDoctor(doctor);

        if (license.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "No active license found"));
        }

        return ResponseEntity.ok(mapLicenseToResponse(license.get()));
    }

    /**
     * Create new license for current doctor
     */
    @PostMapping("/my")
    public ResponseEntity<Map<String, Object>> createLicense(
            Authentication authentication,
            @RequestBody Map<String, Object> request) throws Exception {
        
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid)
                .orElseThrow(() -> new Exception("Doctor not found"));

        License license = new License();
        license.setDoctor(doctor);
        license.setLicenseNumber((String) request.get("license_number"));
        license.setIssuedDate(LocalDate.parse((String) request.get("issued_date")));
        
        if (request.containsKey("expiry_date") && request.get("expiry_date") != null) {
            license.setExpiryDate(LocalDate.parse((String) request.get("expiry_date")));
        }
        
        license.setIssuedBy((String) request.get("issued_by"));
        license.setIssuerTitle((String) request.get("issuer_title"));
        license.setScopeOfPractice((String) request.get("scope_of_practice"));
        license.setIsActive(true);
        
        if (request.containsKey("notes")) {
            license.setNotes((String) request.get("notes"));
        }

        License saved = licenseRepository.save(license);

        return ResponseEntity.ok(mapLicenseToResponse(saved));
    }

    /**
     * Update license
     */
    @PatchMapping("/my/{licenseId}")
    public ResponseEntity<Map<String, Object>> updateLicense(
            Authentication authentication,
            @PathVariable Integer licenseId,
            @RequestBody Map<String, Object> request) throws Exception {
        
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid)
                .orElseThrow(() -> new Exception("Doctor not found"));

        License license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new Exception("License not found"));

        // Check ownership
        if (!license.getDoctor().getUserId().equals(doctor.getUserId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }

        // Update fields
        if (request.containsKey("license_number")) {
            license.setLicenseNumber((String) request.get("license_number"));
        }
        if (request.containsKey("issued_date")) {
            license.setIssuedDate(LocalDate.parse((String) request.get("issued_date")));
        }
        if (request.containsKey("expiry_date")) {
            String expiryDateStr = (String) request.get("expiry_date");
            license.setExpiryDate(expiryDateStr != null ? LocalDate.parse(expiryDateStr) : null);
        }
        if (request.containsKey("issued_by")) {
            license.setIssuedBy((String) request.get("issued_by"));
        }
        if (request.containsKey("issuer_title")) {
            license.setIssuerTitle((String) request.get("issuer_title"));
        }
        if (request.containsKey("scope_of_practice")) {
            license.setScopeOfPractice((String) request.get("scope_of_practice"));
        }
        if (request.containsKey("is_active")) {
            license.setIsActive((Boolean) request.get("is_active"));
        }
        if (request.containsKey("notes")) {
            license.setNotes((String) request.get("notes"));
        }

        License updated = licenseRepository.save(license);

        return ResponseEntity.ok(mapLicenseToResponse(updated));
    }

    /**
     * Delete license
     */
    @DeleteMapping("/my/{licenseId}")
    public ResponseEntity<Map<String, Object>> deleteLicense(
            Authentication authentication,
            @PathVariable Integer licenseId) throws Exception {
        
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid)
                .orElseThrow(() -> new Exception("Doctor not found"));

        License license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new Exception("License not found"));

        // Check ownership
        if (!license.getDoctor().getUserId().equals(doctor.getUserId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }

        licenseRepository.delete(license);

        return ResponseEntity.ok(Map.of("message", "License deleted successfully"));
    }

    /**
     * Helper method to map License to response
     */
    private Map<String, Object> mapLicenseToResponse(License license) {
        Map<String, Object> map = new HashMap<>();
        map.put("license_id", license.getLicenseId());
        map.put("license_number", license.getLicenseNumber());
        map.put("issued_date", license.getIssuedDate());
        map.put("expiry_date", license.getExpiryDate());
        map.put("issued_by", license.getIssuedBy());
        map.put("issuer_title", license.getIssuerTitle());
        map.put("scope_of_practice", license.getScopeOfPractice());
        map.put("is_active", license.getIsActive());
        map.put("notes", license.getNotes());
        map.put("is_expired", license.isExpired());
        map.put("is_valid", license.isValid());
        map.put("days_until_expiry", license.getDaysUntilExpiry());
        map.put("created_at", license.getCreatedAt());
        map.put("updated_at", license.getUpdatedAt());
        return map;
    }
}

