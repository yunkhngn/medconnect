package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.enums.Speciality;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.service.AppointmentService;
import se1961.g1.medconnect.service.DoctorService;
import se1961.g1.medconnect.service.FirebaseService;
import se1961.g1.medconnect.service.UserService;

import java.util.*;

@RestController
@RequestMapping("/doctor/dashboard")
public class DoctorController {
    @Autowired
    private DoctorService doctorService;
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private FirebaseService firebaseService;
    @Autowired
    private UserService userService;


//    @GetMapping("/")
//    public ResponseEntity<Doctor> getMe(@RequestHeader("Authorization") String token)  throws Exception {
//        Optional<Doctor> doctor = doctorService.getDoctor(token);
//        if (doctor.isPresent()) {
//            return ResponseEntity.ok(doctor.get());
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getAppointments(Authentication authentication) throws Exception {
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid)
                .orElseThrow(() -> new Exception("Doctor not found"));
        List<AppointmentDTO> appointments =  doctorService.getAppointments(doctor);
        return ResponseEntity.ok(appointments);
    }
//    @GetMapping("/schedule")

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) throws Exception {
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid).orElseThrow(() -> new Exception("Doctor not found"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("name", doctor.getName());
            profile.put("email", doctor.getEmail());
            profile.put("phone", doctor.getPhone());
            profile.put("specialization", doctor.getSpecialization());
            profile.put("license_id",  doctor.getLicenseId());
            return ResponseEntity.ok(profile);
    }

    @PatchMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(Authentication authentication, @RequestBody Map<String, Object> request) throws Exception {
        String uid = (String) authentication.getPrincipal();
        Optional<Doctor> doctor = doctorService.getDoctor(uid);

        if(doctor.isEmpty()) {
            throw new Exception("Doctor not found");
        }

        Doctor currDoc = doctor.get();

        if(request.containsKey("phone")) {
            currDoc.setPhone((String) request.get("phone"));
        }

        if(request.containsKey("specialization")) {
            try {
                String specialization = ((String) request.get("specialization")).toUpperCase();
                Speciality speciality = Speciality.valueOf(specialization);
                currDoc.setSpecialization(speciality);
            } catch (IllegalArgumentException e) {
                throw new Exception("Invalid specialization: " +  request.get("specialization"));
            }

            doctorService.saveDoctor(currDoc);
        }

        Map<String, Object> updatedProfile = new HashMap<>();
        updatedProfile.put("message", "Profile updated successfully");
        updatedProfile.put("phone", currDoc.getPhone());
        updatedProfile.put("specialization", currDoc.getSpecialization().name());

        return  ResponseEntity.ok(updatedProfile);
    }
}
