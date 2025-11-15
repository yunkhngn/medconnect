package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get current logged-in user profile
     * GET /api/user/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            
            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(404).body(error);
            }

            User user = userOpt.get();
            Map<String, Object> profile = new HashMap<>();
            profile.put("name", user.getName());
            profile.put("email", user.getEmail());
            profile.put("phone", user.getPhone());
            profile.put("avatar", user.getAvatarUrl());
            profile.put("role", user.getRole() != null ? user.getRole().name() : null);
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Update current logged-in user profile
     * PUT /api/user/profile
     */
    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateMyProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            
            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(404).body(error);
            }

            User user = userOpt.get();
            
            // Update name if provided
            if (request.containsKey("name") && request.get("name") != null) {
                user.setName(request.get("name").toString());
            }
            
            // Update phone if provided
            if (request.containsKey("phone") && request.get("phone") != null) {
                user.setPhone(request.get("phone").toString());
            }
            
            // Note: Email and avatar are updated via separate endpoints
            
            userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("data", Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "avatar", user.getAvatarUrl()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Update user avatar
     * PUT /api/user/avatar
     */
    @PutMapping("/avatar")
    @Transactional
    public ResponseEntity<?> updateAvatar(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            
            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(404).body(error);
            }

            User user = userOpt.get();
            
            if (request.containsKey("avatarUrl") && request.get("avatarUrl") != null) {
                user.setAvatarUrl(request.get("avatarUrl").toString());
                userRepository.save(user);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Avatar updated successfully");
            response.put("avatarUrl", user.getAvatarUrl());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

