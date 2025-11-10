package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.service.CloudinaryService;
import se1961.g1.medconnect.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/avatar")
public class AvatarController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserService userService;

    /**
     * Upload avatar for current user
     * POST /api/avatar/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            
            // Get user
            User user = userService.getUser(firebaseUid)
                    .orElseThrow(() -> new Exception("User not found"));

            // Delete old avatar from Cloudinary if exists
            if (user.getAvatarUrl() != null && user.getAvatarUrl().contains("cloudinary.com")) {
                cloudinaryService.deleteAvatar(user.getAvatarUrl());
            }

            // Upload new avatar
            String avatarUrl = cloudinaryService.uploadAvatar(file, firebaseUid);

            // Update user avatar URL
            user.setAvatarUrl(avatarUrl);
            userService.saveUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Avatar uploaded successfully");
            response.put("avatarUrl", avatarUrl);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload avatar: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Get avatar URL for current user
     * GET /api/avatar
     */
    @GetMapping
    public ResponseEntity<?> getAvatar(Authentication authentication) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            
            User user = userService.getUser(firebaseUid)
                    .orElseThrow(() -> new Exception("User not found"));

            Map<String, String> response = new HashMap<>();
            response.put("avatarUrl", user.getAvatarUrl());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Delete avatar for current user
     * DELETE /api/avatar
     */
    @DeleteMapping
    public ResponseEntity<?> deleteAvatar(Authentication authentication) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            
            User user = userService.getUser(firebaseUid)
                    .orElseThrow(() -> new Exception("User not found"));

            // Delete from Cloudinary
            if (user.getAvatarUrl() != null && user.getAvatarUrl().contains("cloudinary.com")) {
                cloudinaryService.deleteAvatar(user.getAvatarUrl());
            }

            // Remove from database
            user.setAvatarUrl(null);
            userService.saveUser(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Avatar deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

