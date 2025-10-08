package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.enums.Role;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.UserRepository;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Optional<User> getUser(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    //default as Patient
    public User registerUser(String firebaseUid, String email) {
        if(userRepository.findByFirebaseUid(firebaseUid).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        Patient patient = new Patient();
        patient.setEmail(email);
        patient.setFirebaseUid(firebaseUid);
        patient.setRole(Role.PATIENT);
        return userRepository.save(patient);
    }
}
