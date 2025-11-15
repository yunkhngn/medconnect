package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.Speciality;
import se1961.g1.medconnect.service.SpecialityService;

import jakarta.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/specialties")
@CrossOrigin(origins = "http://localhost:3000")
public class SpecialityController {

    @Autowired
    private SpecialityService specialityService;

    /**
     * Get all specialities with full details (for admin)
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllSpecialities() {
        List<Speciality> specialities = specialityService.getAllSpecialities();
        
        List<Map<String, Object>> result = specialities.stream()
                .map(this::mapSpecialityToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get speciality by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSpecialityById(@PathVariable Integer id) {
        Optional<Speciality> speciality = specialityService.getSpecialityById(id);
        
        if (speciality.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(mapSpecialityToResponse(speciality.get()));
    }

    /**
     * Create new speciality (admin only)
     */
    @PostMapping
    public ResponseEntity<?> createSpeciality(@Valid @RequestBody Map<String, Object> requestBody) {
        try {
            // Validate required fields
            if (!requestBody.containsKey("name") || 
                !requestBody.containsKey("description") ||
                !requestBody.containsKey("onlinePrice") ||
                !requestBody.containsKey("offlinePrice")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields: name, description, onlinePrice, offlinePrice"));
            }

            Speciality speciality = new Speciality();
            speciality.setName((String) requestBody.get("name"));
            speciality.setDescription((String) requestBody.get("description"));
            speciality.setOnlinePrice(((Number) requestBody.get("onlinePrice")).intValue());
            speciality.setOfflinePrice(((Number) requestBody.get("offlinePrice")).intValue());

            Speciality savedSpeciality = specialityService.saveSpeciality(speciality);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapSpecialityToResponse(savedSpeciality));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to create speciality: " + e.getMessage()));
        }
    }

    /**
     * Update speciality (admin only)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSpeciality(
            @PathVariable Integer id, 
            @Valid @RequestBody Map<String, Object> requestBody) {
        try {
            Optional<Speciality> existingSpeciality = specialityService.getSpecialityById(id);
            
            if (existingSpeciality.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Speciality speciality = existingSpeciality.get();
            
            if (requestBody.containsKey("name")) {
                speciality.setName((String) requestBody.get("name"));
            }
            if (requestBody.containsKey("description")) {
                speciality.setDescription((String) requestBody.get("description"));
            }
            if (requestBody.containsKey("onlinePrice")) {
                speciality.setOnlinePrice(((Number) requestBody.get("onlinePrice")).intValue());
            }
            if (requestBody.containsKey("offlinePrice")) {
                speciality.setOfflinePrice(((Number) requestBody.get("offlinePrice")).intValue());
            }

            Speciality updatedSpeciality = specialityService.saveSpeciality(speciality);
            return ResponseEntity.ok(mapSpecialityToResponse(updatedSpeciality));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update speciality: " + e.getMessage()));
        }
    }

    /**
     * Delete speciality (admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSpeciality(@PathVariable Integer id) {
        try {
            Optional<Speciality> speciality = specialityService.getSpecialityById(id);
            
            if (speciality.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Check if speciality has associated doctors
            if (specialityService.hasAssociatedDoctors(id)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cannot delete speciality. There are doctors associated with this speciality."));
            }

            specialityService.deleteSpeciality(id);
            return ResponseEntity.ok(Map.of("message", "Speciality deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete speciality: " + e.getMessage()));
        }
    }

    /**
     * Get specialities for public dropdown (simplified response)
     */
    @GetMapping("/dropdown")
    public ResponseEntity<List<Map<String, Object>>> getSpecialitiesForDropdown() {
        List<Speciality> specialities = specialityService.getAllSpecialities();
        
        List<Map<String, Object>> result = specialities.stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getSpecialityId());
                    map.put("name", s.getName());
                    map.put("onlinePrice", s.getOnlinePrice());
                    map.put("offlinePrice", s.getOfflinePrice());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get specialities with doctor count for homepage/public display
     */
    @GetMapping("/public")
    public ResponseEntity<List<Map<String, Object>>> getSpecialitiesForPublic() {
        List<Speciality> specialities = specialityService.getAllSpecialitiesWithDoctorCount();
        
        List<Map<String, Object>> result = specialities.stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getSpecialityId());
                    map.put("name", s.getName());
                    map.put("description", s.getDescription());
                    map.put("onlinePrice", s.getOnlinePrice());
                    map.put("offlinePrice", s.getOfflinePrice());
                    // Get doctor count for this specialty
                    long doctorCount = specialityService.getDoctorCountBySpecialityId(s.getSpecialityId());
                    map.put("doctorCount", doctorCount);
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    /**
     * Helper method to map Speciality entity to response format
     */
    private Map<String, Object> mapSpecialityToResponse(Speciality s) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", s.getSpecialityId());
        map.put("name", s.getName());
        map.put("description", s.getDescription());
        map.put("onlinePrice", s.getOnlinePrice());
        map.put("offlinePrice", s.getOfflinePrice());
        map.put("createdAt", s.getCreatedAt());
        map.put("updatedAt", s.getUpdatedAt());
        return map;
    }
}

