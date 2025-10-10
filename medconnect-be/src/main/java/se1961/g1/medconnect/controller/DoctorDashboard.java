package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.service.AppointmentService;
import se1961.g1.medconnect.service.DoctorService;
import se1961.g1.medconnect.service.FirebaseService;
import se1961.g1.medconnect.service.UserService;

import java.util.*;

@RestController
@RequestMapping("/doctor/dashboard")
public class DoctorDashboard {
    @Autowired
    private DoctorService doctorService;
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private FirebaseService firebaseService;
    @Autowired
    private UserService userService;


    @GetMapping("/me")
    public ResponseEntity<Doctor> getMe(@RequestHeader("Authorization") String token)  throws Exception {
        Optional<Doctor> doctor = doctorService.getDoctor(token);
        if (doctor.isPresent()) {
            return ResponseEntity.ok(doctor.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

//    @GetMapping("/me/appointments")
//    public ResponseEntity<List<Appointment>> getAppointments(@RequestHeader("Authorization") String token) throws Exception {
//        Optional<Doctor> doctor = doctorService.getDoctor(token);
//        List<Appointment> appointments =  new ArrayList<>();
//        if (doctor.isPresent()) {
//            appointments = appointmentService.findByDoctor(doctor.get());
//        }
//        return ResponseEntity.ok(appointments);
//    }
//    @GetMapping("/me/schedule")

    @GetMapping("/me/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestHeader("Authorization") String token) throws Exception {
        Optional<Doctor> doctor = doctorService.getDoctor(token);
        if (doctor.isPresent()) {
            Doctor currDoc = doctor.get();
            Map<String, Object> profile = new HashMap<>();
            profile.put("name", currDoc.getFirstName() + " " + currDoc.getLastName());
            profile.put("email", currDoc.getEmail());
            profile.put("phone", currDoc.getPhone());
            profile.put("specialization", currDoc.getSpecialization());
            profile.put("license_id",  currDoc.getLicenseId());
            return ResponseEntity.ok(profile);
        }
        throw new Exception("Doctor not found");
    }
}
