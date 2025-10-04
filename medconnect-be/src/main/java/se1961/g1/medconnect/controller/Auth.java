package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.service.FirebaseService;
import se1961.g1.medconnect.service.UserService;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class Auth {
    @Autowired
    private UserService userService;

    @Autowired
    private FirebaseService firebaseService;

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestHeader("Authorization") String token) throws Exception {
        if(token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        String uid = firebaseService.verifyIdToken(token);

        Optional<User> userOpt = userService.getUser(uid);

        if(userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(userOpt.get());
    }
}
