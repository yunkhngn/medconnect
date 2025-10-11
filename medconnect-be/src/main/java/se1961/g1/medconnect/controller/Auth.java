package se1961.g1.medconnect.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.service.FirebaseService;
import se1961.g1.medconnect.service.UserService;

import java.util.Optional;

@RestController
@RequestMapping("api/auth")
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

            FirebaseToken decodedToken = firebaseService.getDecodedToken(token);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();

            Optional<User> userOpt = userService.getUser(uid);

            if(userOpt.isPresent()) {
                return ResponseEntity.ok(userOpt.get());
            } else if(!"password".equals(firebaseService.getProvider(uid))) {
                User newUser = userService.registerUser(uid, email);
                return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestHeader("Authorization") String token) throws Exception {
        if(token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        FirebaseToken decodedToken = firebaseService.getDecodedToken(token);
        String uid = decodedToken.getUid();
        String email = decodedToken.getEmail();

        Optional<User> userOpt = userService.getUser(uid);
        if(userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        }

        User newUser = userService.registerUser(uid, email);

        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }
}
