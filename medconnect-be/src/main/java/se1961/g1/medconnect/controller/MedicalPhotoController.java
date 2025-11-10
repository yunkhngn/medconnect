package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import se1961.g1.medconnect.service.CloudinaryService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-photo")
public class MedicalPhotoController {

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Upload medical ID photo (3:4 ratio)
     * POST /api/medical-photo/upload
     * This does NOT update user's avatar
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadMedicalPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            
            // Upload to Cloudinary with medical_photos folder
            String photoUrl = cloudinaryService.uploadMedicalPhoto(file, firebaseUid);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Medical photo uploaded successfully");
            response.put("photoUrl", photoUrl);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload medical photo: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Delete medical photo from Cloudinary
     * DELETE /api/medical-photo
     */
    @DeleteMapping
    public ResponseEntity<?> deleteMedicalPhoto(
            Authentication authentication,
            @RequestParam("photoUrl") String photoUrl) {
        try {
            if (photoUrl != null && photoUrl.contains("cloudinary.com")) {
                cloudinaryService.deleteAvatar(photoUrl); // Reuse delete method
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Medical photo deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

