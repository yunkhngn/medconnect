package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.service.DoctorService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PublicController {
    
    @Autowired
    private DoctorService doctorService;

    /**
     * Lấy danh sách tất cả bác sĩ (cho dropdown - không cần auth)
     * GET /api/doctors
     */
    @GetMapping("/doctors")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
        try {
            List<Doctor> doctors = doctorService.getAllDoctors();
            
            List<Map<String, Object>> response = doctors.stream().map(doctor -> {
                Map<String, Object> doctorData = new HashMap<>();
                doctorData.put("id", doctor.getUserId());
                doctorData.put("name", doctor.getName());
                doctorData.put("speciality", doctor.getSpecializationName());
                return doctorData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }
}
