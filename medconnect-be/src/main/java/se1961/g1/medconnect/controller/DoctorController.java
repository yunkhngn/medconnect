package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.dto.ScheduleDTO;
import se1961.g1.medconnect.enums.ScheduleStatus;
import se1961.g1.medconnect.pojo.*;
import se1961.g1.medconnect.repository.SpecialityRepository;
import se1961.g1.medconnect.service.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/doctor/dashboard")
public class DoctorController {
    @Autowired
    private DoctorService doctorService;
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private ScheduleService scheduleService;
    @Autowired
    private SpecialityRepository specialityRepository;

    /**
     * Get all doctors (Public - for patient booking)
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Doctor doctor : doctors) {
            Map<String, Object> doctorData = new HashMap<>();
            doctorData.put("id", doctor.getUserId());
            doctorData.put("name", doctor.getName());
            doctorData.put("email", doctor.getEmail());
            doctorData.put("phone", doctor.getPhone());
            doctorData.put("specialty", doctor.getSpeciality() != null ? doctor.getSpeciality().getName() : "Chưa có");
            doctorData.put("avatar", doctor.getAvatarUrl());
            doctorData.put("status", doctor.getStatus() != null ? doctor.getStatus().name() : null);
            doctorData.put("experienceYears", doctor.getExperienceYears());
            doctorData.put("bio", doctor.getBio());
            doctorData.put("education_level", doctor.getEducationLevel());
            doctorData.put("clinicAddress", doctor.getClinicAddress());
            doctorData.put("province_code", doctor.getProvinceCode());
            doctorData.put("province_name", doctor.getProvinceName());
            doctorData.put("district_code", doctor.getDistrictCode());
            doctorData.put("ward_code", doctor.getWardCode());
            
            // Get license number from active license
            License activeLicense = doctor.getActiveLicense();
            doctorData.put("licenseId", activeLicense != null ? activeLicense.getLicenseNumber() : null);
            
            response.add(doctorData);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getAppointments(Authentication authentication) throws Exception {
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid)
                .orElseThrow(() -> new Exception("Doctor not found"));
        List<AppointmentDTO> appointments =  doctorService.getAppointments(doctor);
        return ResponseEntity.ok(appointments);
    }

    @PatchMapping("/appointments/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointments(
            @PathVariable String id,
            @RequestBody AppointmentDTO appointmentDTO)
            throws Exception {
        Long appointmentId = Long.parseLong(id.replace("APT", ""));
        AppointmentDTO updated = appointmentService.updateAppointment(appointmentId, appointmentDTO);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/schedule")
    public ResponseEntity<List<ScheduleDTO>> getScheduleWeekly(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate end)
            throws Exception {
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid)
                .orElseThrow(() -> new Exception("Doctor not found"));
        Long userId = doctor.getUserId();
        List<ScheduleDTO> schedules = scheduleService.getWeeklySchedule(userId, start, end);
        return ResponseEntity.ok(schedules);
    }

    @PatchMapping("/schedule/{id}")
    public ResponseEntity<ScheduleDTO> updateScheduleWeekly(
            @PathVariable Long id,
            @RequestParam String status)
    throws Exception {
        ScheduleStatus scheduleStatus = ScheduleStatus.valueOf(status.toUpperCase());
            ScheduleDTO updated = scheduleService.updateSchedule(id, scheduleStatus);
            return ResponseEntity.ok(updated);
    }

    @PostMapping("/schedule")
    public ResponseEntity<ScheduleDTO> addSchedule(
            Authentication authentication,
            @RequestBody ScheduleDTO dto)
            throws Exception {
            String uid = (String) authentication.getPrincipal();
            Doctor doctor = doctorService.getDoctor(uid)
                    .orElseThrow(() -> new Exception("Doctor not found"));

            ScheduleDTO created = scheduleService.addSchedule(dto, doctor.getUserId());
            return ResponseEntity.ok(created);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) throws Exception {
        String uid = (String) authentication.getPrincipal();
        Doctor doctor = doctorService.getDoctor(uid).orElseThrow(
                () -> new Exception("Doctor not found"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("name", doctor.getName());
            profile.put("email", doctor.getEmail());
            profile.put("phone", doctor.getPhone());
            profile.put("avatar", doctor.getAvatarUrl());
            profile.put("specialization", doctor.getSpeciality() != null ? doctor.getSpeciality().getName() : null);
            profile.put("speciality_id", doctor.getSpeciality() != null ? doctor.getSpeciality().getSpecialityId() : null);
            profile.put("experience_years", doctor.getExperienceYears());
            profile.put("education_level", doctor.getEducationLevel());
            profile.put("bio", doctor.getBio());
            profile.put("clinic_address", doctor.getClinicAddress());
            
            // Address fields
            profile.put("province_code", doctor.getProvinceCode());
            profile.put("province_name", doctor.getProvinceName());
            profile.put("district_code", doctor.getDistrictCode());
            profile.put("ward_code", doctor.getWardCode());
            
            // Get active license info
            se1961.g1.medconnect.pojo.License activeLicense = doctor.getActiveLicense();
            if (activeLicense != null) {
                Map<String, Object> licenseInfo = new HashMap<>();
                licenseInfo.put("license_id", activeLicense.getLicenseId());
                licenseInfo.put("license_number", activeLicense.getLicenseNumber());
                licenseInfo.put("issued_date", activeLicense.getIssuedDate());
                licenseInfo.put("expiry_date", activeLicense.getExpiryDate());
                licenseInfo.put("is_expired", activeLicense.isExpired());
                licenseInfo.put("days_until_expiry", activeLicense.getDaysUntilExpiry());
                profile.put("active_license", licenseInfo);
            } else {
                profile.put("active_license", null);
            }
            
            return ResponseEntity.ok(profile);
    }

    @PatchMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(Authentication authentication, @RequestBody Map<String, Object> request) throws Exception {
        String uid = (String) authentication.getPrincipal();
        System.out.println("[DoctorController] Update profile request from UID: " + uid);
        System.out.println("[DoctorController] Authorities: " + authentication.getAuthorities());
        System.out.println("[DoctorController] Request body: " + request);
        
        Doctor currDoc = doctorService.getDoctor(uid).orElseThrow(
                () -> new Exception("Doctor not found"));

        if(request.containsKey("phone")) {
            currDoc.setPhone((String) request.get("phone"));
        }

        if(request.containsKey("speciality_id")) {
            // Update by speciality ID
            Integer specialityId = (Integer) request.get("speciality_id");
            Speciality speciality = specialityRepository.findById(specialityId)
                    .orElseThrow(() -> new Exception("Speciality not found with ID: " + specialityId));
            currDoc.setSpeciality(speciality);
        } else if(request.containsKey("specialization")) {
            // Update by speciality name (for backward compatibility)
            String specialityName = (String) request.get("specialization");
            Speciality speciality = specialityRepository.findByNameIgnoreCase(specialityName)
                    .orElseThrow(() -> new Exception("Speciality not found: " + specialityName));
            currDoc.setSpeciality(speciality);
        }
        
        if(request.containsKey("experience_years")) {
            // Update experience years (manual input)
            currDoc.setExperienceYears((Integer) request.get("experience_years"));
        }
        
        if(request.containsKey("education_level")) {
            currDoc.setEducationLevel((String) request.get("education_level"));
        }
        
        if(request.containsKey("bio")) {
            currDoc.setBio((String) request.get("bio"));
        }
        
        if(request.containsKey("clinic_address")) {
            currDoc.setClinicAddress((String) request.get("clinic_address"));
        }
        
        // Address fields
        if(request.containsKey("province_code")) {
            currDoc.setProvinceCode((Integer) request.get("province_code"));
        }
        if(request.containsKey("province_name")) {
            currDoc.setProvinceName((String) request.get("province_name"));
        }
        if(request.containsKey("district_code")) {
            currDoc.setDistrictCode((Integer) request.get("district_code"));
        }
        if(request.containsKey("ward_code")) {
            currDoc.setWardCode((Integer) request.get("ward_code"));
        }
        

        doctorService.saveDoctor(currDoc);

        Map<String, Object> updatedProfile = new HashMap<>();
        updatedProfile.put("message", "Profile updated successfully");
        updatedProfile.put("phone", currDoc.getPhone());
        updatedProfile.put("specialization", currDoc.getSpeciality() != null ? currDoc.getSpeciality().getName() : null);
        updatedProfile.put("speciality_id", currDoc.getSpeciality() != null ? currDoc.getSpeciality().getSpecialityId() : null);
        updatedProfile.put("experience_years", currDoc.getExperienceYears());
        updatedProfile.put("education_level", currDoc.getEducationLevel());
        updatedProfile.put("bio", currDoc.getBio());
        updatedProfile.put("clinic_address", currDoc.getClinicAddress());
        updatedProfile.put("province_code", currDoc.getProvinceCode());
        updatedProfile.put("province_name", currDoc.getProvinceName());
        updatedProfile.put("district_code", currDoc.getDistrictCode());
        updatedProfile.put("ward_code", currDoc.getWardCode());

        return  ResponseEntity.ok(updatedProfile);
    }
}
