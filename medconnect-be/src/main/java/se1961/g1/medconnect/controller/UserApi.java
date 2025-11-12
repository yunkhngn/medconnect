package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.service.UserService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserApi {
    @Autowired
    private UserService userService;

    @GetMapping("/role")
    public ResponseEntity<Map<String, Object>> getUserRole(Authentication authentication) {
        String uid = (String) authentication.getPrincipal();
        Optional<User> userOpt = userService.getUser(uid);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("role", String.valueOf(user.getRole()));
        response.put("email", user.getEmail());
        
        // If user is a doctor, include status
        if (user instanceof Doctor) {
            Doctor doctor = (Doctor) user;
            response.put("status", doctor.getStatus() != null ? doctor.getStatus().name() : null);
        }
        
        return ResponseEntity.ok(response);
    }
}
