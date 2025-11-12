package se1961.g1.medconnect.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.AdminDTO;
import se1961.g1.medconnect.dto.CreateAdminRequest;
import se1961.g1.medconnect.dto.DoctorDTO;
import se1961.g1.medconnect.dto.UpdateAdminRequest;
import se1961.g1.medconnect.enums.AppointmentStatus;
import se1961.g1.medconnect.enums.Slot;
import se1961.g1.medconnect.pojo.*;
import se1961.g1.medconnect.repository.DoctorRepository;
import se1961.g1.medconnect.repository.PaymentRepository;
import se1961.g1.medconnect.repository.VideoCallSessionRepository;
import se1961.g1.medconnect.service.AdminService;
import se1961.g1.medconnect.service.AppointmentService;
import se1961.g1.medconnect.service.DoctorService;
import se1961.g1.medconnect.service.PatientService;
import se1961.g1.medconnect.service.PaymentService;
import se1961.g1.medconnect.service.SpecialityService;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientService patientService;

    @Autowired
    private SpecialityService specialityService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private VideoCallSessionRepository videoCallSessionRepository;

    // ============= DASHBOARD STATS =============
    
    /**
     * Lấy thống kê tổng quan cho dashboard
     * GET /api/admin/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> response = new HashMap<>();
            
            // Đếm tổng số doctors
            long totalDoctors = doctorRepository.count();
            
            // Đếm tổng số patients
            long totalPatients = patientService.getAllPatients().size();
            
            // Đếm appointments
            List<Appointment> allAppointments = appointmentService.getAllAppointments();
            long totalAppointments = allAppointments.size();
            long pendingAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                .count();
            long completedAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.FINISHED)
                .count();
            
            // Tính tổng doanh thu (chỉ tính payments đã paid)
            List<Payment> paidPayments = paymentRepository.findAll().stream()
                .filter(p -> se1961.g1.medconnect.enums.PaymentStatus.PAID.equals(p.getStatus()))
                .collect(Collectors.toList());
            double totalRevenue = paidPayments.stream()
                .mapToDouble(Payment::getAmount)
                .sum();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalDoctors", totalDoctors);
            stats.put("totalPatients", totalPatients);
            stats.put("totalAppointments", totalAppointments);
            stats.put("totalRevenue", totalRevenue);
            stats.put("pendingAppointments", pendingAppointments);
            stats.put("completedAppointments", completedAppointments);
            
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy thống kê: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Lấy danh sách appointments gần đây (10 appointments mới nhất)
     * GET /api/admin/dashboard/recent-appointments
     */
    @GetMapping("/dashboard/recent-appointments")
    public ResponseEntity<Map<String, Object>> getRecentAppointments() {
        try {
            List<Appointment> allAppointments = appointmentService.getAllAppointments();
            
            // Lấy 10 appointments mới nhất, sắp xếp theo createdAt giảm dần
            List<Map<String, Object>> recentAppointments = allAppointments.stream()
                .sorted((a1, a2) -> {
                    LocalDate d1 = a1.getCreatedAt() != null ? a1.getCreatedAt() : LocalDate.MIN;
                    LocalDate d2 = a2.getCreatedAt() != null ? a2.getCreatedAt() : LocalDate.MIN;
                    return d2.compareTo(d1);
                })
                .limit(10)
                .map(appointment -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", appointment.getAppointmentId());
                    data.put("patientName", appointment.getPatient() != null ? appointment.getPatient().getName() : "N/A");
                    data.put("doctorName", appointment.getDoctor() != null ? appointment.getDoctor().getName() : "N/A");
                    data.put("date", appointment.getDate());
                    data.put("slot", appointment.getSlot() != null ? appointment.getSlot().name() : "N/A");
                    data.put("status", appointment.getStatus() != null ? appointment.getStatus().name() : "PENDING");
                    return data;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", recentAppointments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy danh sách appointments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ============= ADMIN MANAGEMENT =============

    /**
     * Lấy danh sách tất cả admin
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllAdmins() {
        try {
            List<AdminDTO> admins = adminService.getAllAdmins();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", admins);
            response.put("total", admins.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy danh sách admin: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy thông tin chi tiết admin theo ID
     * GET /api/admin/users/{id}
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getAdminById(@PathVariable Long id) {
        try {
            return adminService.getAdminById(id)
                    .map(admin -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("data", admin);
                        return ResponseEntity.ok(response);
                    })
                    .orElseGet(() -> {
                        Map<String, Object> error = new HashMap<>();
                        error.put("success", false);
                        error.put("message", "Admin không tồn tại");
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                    });
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy thông tin admin: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Tạo admin mới
     * POST /api/admin/users
     */
    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        try {
            AdminDTO newAdmin = adminService.createAdmin(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo admin thành công");
            response.put("data", newAdmin);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi tạo admin: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật thông tin admin
     * PUT /api/admin/users/{id}
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminRequest request) {
        try {
            AdminDTO updatedAdmin = adminService.updateAdmin(id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật admin thành công");
            response.put("data", updatedAdmin);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi cập nhật admin: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Xóa admin
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteAdmin(@PathVariable Long id) {
        try {
            adminService.deleteAdmin(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa admin thành công");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi xóa admin: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Khóa/Mở khóa admin
     * PATCH /api/admin/users/{id}/status
     */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Map<String, Object>> toggleAdminStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload) {
        try {
            boolean disabled = payload.getOrDefault("disabled", false);
            AdminDTO updatedAdmin = adminService.toggleAdminStatus(id, disabled);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", disabled ? "Đã khóa admin" : "Đã mở khóa admin");
            response.put("data", updatedAdmin);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi thay đổi trạng thái admin: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Đổi mật khẩu admin
     * PATCH /api/admin/users/{id}/password
     */
    @PatchMapping("/users/{id}/password")
    public ResponseEntity<Map<String, Object>> changeAdminPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String newPassword = payload.get("newPassword");
            
            if (newPassword == null || newPassword.length() < 6) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Mật khẩu phải có ít nhất 6 ký tự");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            adminService.changeAdminPassword(id, newPassword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đổi mật khẩu thành công");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi đổi mật khẩu: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/doctor/all")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Doctor doctor : doctors) {
            Map<String, Object> doctorData = new HashMap<>();
            doctorData.put("id", doctor.getUserId());
            doctorData.put("userId", doctor.getUserId());
            doctorData.put("name", doctor.getName());
            doctorData.put("email", doctor.getEmail());
            doctorData.put("phone", doctor.getPhone());
            doctorData.put("specialty", doctor.getSpeciality() != null ? doctor.getSpeciality().getName() : "Chưa có");
            doctorData.put("specialityId", doctor.getSpeciality() != null ? doctor.getSpeciality().getSpecialityId() : null);
            doctorData.put("avatar", doctor.getAvatarUrl());
            doctorData.put("status", doctor.getStatus() != null ? doctor.getStatus().name() : null);
            doctorData.put("experienceYears", doctor.getExperienceYears());
            doctorData.put("educationLevel", doctor.getEducationLevel());
            doctorData.put("bio", doctor.getBio());
            doctorData.put("clinicAddress", doctor.getClinicAddress());
            doctorData.put("provinceCode", doctor.getProvinceCode());
            doctorData.put("districtCode", doctor.getDistrictCode());
            doctorData.put("wardCode", doctor.getWardCode());

            // Get active license with full details
            License activeLicense = doctor.getActiveLicense();
            if (activeLicense != null) {
                doctorData.put("licenseId", activeLicense.getLicenseId());
                doctorData.put("license", mapLicenseToResponse(activeLicense));
            } else {
                doctorData.put("licenseId", null);
                doctorData.put("license", null);
            }

            response.add(doctorData);
        }

        return ResponseEntity.ok(response);
    }
    
    /**
     * Helper method to map License entity to response Map
     */
    private Map<String, Object> mapLicenseToResponse(License license) {
        if (license == null) {
            return null;
        }
        
        Map<String, Object> map = new HashMap<>();
        map.put("license_id", license.getLicenseId());
        map.put("license_number", license.getLicenseNumber());
        map.put("issued_date", license.getIssuedDate());
        map.put("expiry_date", license.getExpiryDate());
        map.put("issued_by", license.getIssuedBy());
        map.put("issuer_title", license.getIssuerTitle());
        map.put("scope_of_practice", license.getScopeOfPractice());
        map.put("is_active", license.getIsActive());
        map.put("notes", license.getNotes());
        map.put("proof_images", license.getProofImages());
        map.put("is_expired", license.isExpired());
        map.put("is_valid", license.isValid());
        map.put("days_until_expiry", license.getDaysUntilExpiry());
        
        return map;
    }

    @PostMapping
    public ResponseEntity<?> createDoctor(@RequestBody DoctorDTO dto) {
        try {
            Doctor saved = doctorService.addDoctor(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo bác sĩ thành công");
            response.put("data", mapDoctorToResponse(saved));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== AdminController.updateDoctor ===");
            System.out.println("Doctor ID: " + id);
            System.out.println("Raw request: " + request);
            
            // Convert Map to DoctorDTO manually to handle status conversion
            DoctorDTO dto = new DoctorDTO();
            if (request.containsKey("name")) dto.setName((String) request.get("name"));
            if (request.containsKey("email")) dto.setEmail((String) request.get("email"));
            if (request.containsKey("phone")) dto.setPhone((String) request.get("phone"));
            if (request.containsKey("specialityId")) {
                Object specId = request.get("specialityId");
                if (specId instanceof Integer) {
                    dto.setSpecialityId((Integer) specId);
                } else if (specId instanceof String) {
                    dto.setSpecialityId(Integer.parseInt((String) specId));
                }
            }
            if (request.containsKey("experienceYears")) {
                Object exp = request.get("experienceYears");
                if (exp instanceof Integer) {
                    dto.setExperienceYears((Integer) exp);
                } else if (exp instanceof String) {
                    dto.setExperienceYears(Integer.parseInt((String) exp));
                }
            }
            if (request.containsKey("educationLevel")) dto.setEducationLevel((String) request.get("educationLevel"));
            if (request.containsKey("bio")) dto.setBio((String) request.get("bio"));
            
            // Handle status conversion from string to enum
            if (request.containsKey("status")) {
                Object statusObj = request.get("status");
                if (statusObj instanceof String) {
                    String statusStr = ((String) statusObj).toUpperCase();
                    try {
                        dto.setStatus(se1961.g1.medconnect.enums.DoctorStatus.valueOf(statusStr));
                    } catch (IllegalArgumentException e) {
                        System.err.println("Invalid status: " + statusStr);
                        dto.setStatus(null);
                    }
                } else if (statusObj instanceof se1961.g1.medconnect.enums.DoctorStatus) {
                    dto.setStatus((se1961.g1.medconnect.enums.DoctorStatus) statusObj);
                }
            }
            
            System.out.println("DTO Status: " + dto.getStatus());
            System.out.println("DTO Name: " + dto.getName());
            System.out.println("DTO Email: " + dto.getEmail());
            
            Doctor updated = doctorService.updateDoctor(id, dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật bác sĩ thành công");
            response.put("data", mapDoctorToResponse(updated));
            
            System.out.println("✅ Doctor updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error updating doctor: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private Map<String, Object> mapDoctorToResponse(Doctor doctor) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", doctor.getUserId());
        response.put("name", doctor.getName());
        response.put("email", doctor.getEmail());
        response.put("phone", doctor.getPhone());
        response.put("userId", doctor.getUserId());
        response.put("status", doctor.getStatus());
        response.put("experienceYears", doctor.getExperienceYears());
        response.put("educationLevel", doctor.getEducationLevel());
        response.put("bio", doctor.getBio());
        response.put("clinicAddress", doctor.getClinicAddress());
        response.put("provinceCode", doctor.getProvinceCode());
        response.put("districtCode", doctor.getDistrictCode());
        response.put("wardCode", doctor.getWardCode());
        
        if (doctor.getSpeciality() != null) {
            response.put("specialty", doctor.getSpeciality().getName());
            response.put("specialityId", doctor.getSpeciality().getSpecialityId());
            response.put("specializationLabel", doctor.getSpeciality().getName());
        }
        
        // Include license information
        License activeLicense = doctor.getActiveLicense();
        if (activeLicense != null) {
            response.put("licenseId", activeLicense.getLicenseId());
            response.put("license", mapLicenseToResponse(activeLicense));
        } else {
            response.put("licenseId", null);
            response.put("license", null);
        }
        
        return response;
    }


    @DeleteMapping("/doctor/{id}")
    public ResponseEntity<Map<String, Object>> deleteDoctor(@PathVariable Long id){
        try{
            doctorService.deleteDoctor(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa bác sĩ thành công");
            
            return ResponseEntity.ok(response);
        } catch(Exception e){
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi xóa bác sĩ: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/speciality/all")
    public ResponseEntity<List<Map<String, Object>>> getAllSpecialities() {
        List<Speciality> specialities = specialityService.getAllSpecialities();

        List<Map<String, Object>> result = specialities.stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getSpecialityId());
                    map.put("name", s.getName());
                    map.put("description", s.getDescription());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ============================================
    // PATIENT MANAGEMENT APIs
    // ============================================

    /**
     * Lấy danh sách tất cả bệnh nhân
     * GET /api/admin/patients
     */
    @GetMapping("/patients")
    public ResponseEntity<Map<String, Object>> getAllPatients() {
        try {
            List<Patient> patients = patientService.getAllPatients();
            List<Map<String, Object>> response = new ArrayList<>();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

            for (Patient patient : patients) {
                Map<String, Object> patientData = new HashMap<>();
                patientData.put("id", patient.getUserId());
                patientData.put("fullName", patient.getName());
                patientData.put("email", patient.getEmail());
                patientData.put("phone", patient.getPhone());
                patientData.put("gender", patient.getGender());
                patientData.put("bloodType", patient.getBloodType());
                patientData.put("status", "active"); // Default status
                patientData.put("avatar", patient.getAvatarUrl());
                
                // Address
                Map<String, Object> addressMap = new HashMap<>();
                addressMap.put("address_detail", patient.getAddress());
                addressMap.put("ward_name", patient.getWardName());
                addressMap.put("province_name", patient.getProvinceName());
                addressMap.put("province_code", patient.getProvinceCode());
                addressMap.put("district_code", patient.getDistrictCode());
                addressMap.put("ward_code", patient.getWardCode());
                patientData.put("address", addressMap);
                
                // Dates
                if (patient.getDateOfBirth() != null) {
                    patientData.put("dateOfBirth", sdf.format(patient.getDateOfBirth()));
                }
                // Use current date as joinDate since createdAt doesn't exist
                patientData.put("joinDate", sdf.format(new Date()));
                
                response.add(patientData);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            result.put("total", patients.size());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy danh sách bệnh nhân: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Tạo bệnh nhân mới với Firebase Authentication
     * POST /api/admin/patients
     */
    @PostMapping("/patients")
    public ResponseEntity<Map<String, Object>> createPatient(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String password = (String) request.get("password");
            String fullName = (String) request.get("fullName");
            String phone = (String) request.get("phone");
            
            // Validate required fields
            if (email == null || email.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Email là bắt buộc");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (password == null || password.length() < 6) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Mật khẩu phải có ít nhất 6 ký tự");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (fullName == null || fullName.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Họ tên là bắt buộc");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (phone == null || phone.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Số điện thoại là bắt buộc");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Create patient
            Patient newPatient = patientService.createPatient(email, password, fullName, phone);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo bệnh nhân thành công");
            response.put("data", mapPatientToResponse(newPatient));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi tạo bệnh nhân: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy thông tin chi tiết bệnh nhân theo ID
     * GET /api/admin/patients/{id}
     */
    @GetMapping("/patients/{id}")
    public ResponseEntity<Map<String, Object>> getPatientById(@PathVariable Long id) {
        try {
            return patientService.getPatientByUserId(id)
                    .map(patient -> {
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                        Map<String, Object> patientData = new HashMap<>();
                        
                        patientData.put("id", patient.getUserId());
                        patientData.put("fullName", patient.getName());
                        patientData.put("email", patient.getEmail());
                        patientData.put("phone", patient.getPhone());
                        patientData.put("gender", patient.getGender());
                        patientData.put("bloodType", patient.getBloodType());
                        patientData.put("allergies", patient.getAllergies());
                        patientData.put("socialInsurance", patient.getSocialInsurance());
                        patientData.put("citizenship", patient.getCitizenship());
                        patientData.put("emergencyContactName", patient.getEmergencyContactName());
                        patientData.put("emergencyContactPhone", patient.getEmergencyContactPhone());
                        patientData.put("emergencyContactRelationship", patient.getEmergencyContactRelationship());
                        patientData.put("status", "active");
                        patientData.put("avatar", patient.getAvatarUrl());
                        
                        // Address
                        Map<String, Object> addressMap = new HashMap<>();
                        addressMap.put("address_detail", patient.getAddress());
                        addressMap.put("ward_name", patient.getWardName());
                        addressMap.put("province_name", patient.getProvinceName());
                        addressMap.put("province_code", patient.getProvinceCode());
                        addressMap.put("district_code", patient.getDistrictCode());
                        addressMap.put("ward_code", patient.getWardCode());
                        patientData.put("address", addressMap);
                        
                        if (patient.getDateOfBirth() != null) {
                            patientData.put("dateOfBirth", sdf.format(patient.getDateOfBirth()));
                        }
                        if (patient.getInsuranceValidTo() != null) {
                            patientData.put("insuranceValidTo", sdf.format(patient.getInsuranceValidTo()));
                        }
                        // Use current date as joinDate since createdAt doesn't exist
                        patientData.put("joinDate", sdf.format(new Date()));

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("data", patientData);
                        return ResponseEntity.ok(response);
                    })
                    .orElseGet(() -> {
                        Map<String, Object> error = new HashMap<>();
                        error.put("success", false);
                        error.put("message", "Bệnh nhân không tồn tại");
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                    });
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy thông tin bệnh nhân: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật thông tin bệnh nhân
     * PUT /api/admin/patients/{id}
     */
    @PutMapping("/patients/{id}")
    public ResponseEntity<Map<String, Object>> updatePatient(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Patient patient = patientService.getPatientByUserId(id)
                    .orElseThrow(() -> new RuntimeException("Bệnh nhân không tồn tại"));

            // Update fields
            if (request.containsKey("fullName")) {
                patient.setName((String) request.get("fullName"));
            }
            if (request.containsKey("phone")) {
                patient.setPhone((String) request.get("phone"));
            }
            if (request.containsKey("gender")) {
                patient.setGender((String) request.get("gender"));
            }
            if (request.containsKey("bloodType")) {
                patient.setBloodType((String) request.get("bloodType"));
            }
            if (request.containsKey("address")) {
                patient.setAddress((String) request.get("address"));
            }
            if (request.containsKey("dateOfBirth")) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                patient.setDateOfBirth(sdf.parse((String) request.get("dateOfBirth")));
            }

            Patient updatedPatient = patientService.savePatient(patient);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật bệnh nhân thành công");
            response.put("data", mapPatientToResponse(updatedPatient));
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi cập nhật bệnh nhân: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Xóa bệnh nhân
     * DELETE /api/admin/patients/{id}
     */
    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Map<String, Object>> deletePatient(@PathVariable Long id) {
        try {
            if (!patientService.getPatientByUserId(id).isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Bệnh nhân không tồn tại");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            patientService.deletePatient(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa bệnh nhân thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi xóa bệnh nhân: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Helper method to map Patient entity to response
     */
    private Map<String, Object> mapPatientToResponse(Patient patient) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Map<String, Object> response = new HashMap<>();
        
        response.put("id", patient.getUserId());
        response.put("fullName", patient.getName());
        response.put("email", patient.getEmail());
        response.put("phone", patient.getPhone());
        response.put("gender", patient.getGender());
        response.put("bloodType", patient.getBloodType());
        response.put("status", "active");
        response.put("avatar", patient.getAvatarUrl());
        
        // Address
        Map<String, Object> addressMap = new HashMap<>();
        addressMap.put("address_detail", patient.getAddress());
        addressMap.put("ward_name", patient.getWardName());
        addressMap.put("province_name", patient.getProvinceName());
        response.put("address", addressMap);
        
        if (patient.getDateOfBirth() != null) {
            response.put("dateOfBirth", sdf.format(patient.getDateOfBirth()));
        }
        // Use current date as joinDate since createdAt doesn't exist
        response.put("joinDate", sdf.format(new Date()));
        
        return response;
    }

    // ============================================
    // APPOINTMENT MANAGEMENT APIs
    // ============================================

    /**
     * Lấy danh sách tất cả lịch hẹn
     * GET /api/admin/appointments
     */
    @GetMapping("/appointments")
    public ResponseEntity<Map<String, Object>> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentService.getAllAppointments();
            
            List<Map<String, Object>> appointmentList = appointments.stream()
                    .map(this::mapAppointmentToResponse)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", appointmentList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy danh sách lịch hẹn: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Tạo lịch hẹn mới
     * POST /api/admin/appointments
     */
    @PostMapping("/appointments")
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody Map<String, Object> request) {
        try {
            Long patientId = Long.parseLong(request.get("patientId").toString());
            Long doctorId = Long.parseLong(request.get("doctorId").toString());
            String appointmentDateStr = request.get("appointmentDate").toString(); // Format: "dd/MM/yyyy"
            String slotName = request.get("slot").toString(); // e.g., "SLOT_1"
            String statusStr = request.get("status") != null ? request.get("status").toString() : "PENDING";
            
            // Parse date
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
            Date appointmentDate = sdf.parse(appointmentDateStr);
            LocalDate localDate = appointmentDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            
            // Get entities
            Patient patient = patientService.getPatientByUserId(patientId)
                .orElseThrow(() -> new Exception("Patient not found"));
            Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new Exception("Doctor not found"));
            Slot slot = Slot.valueOf(slotName.toUpperCase());
            
            // Create appointment
            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setSlot(slot);
            appointment.setDate(localDate);
            appointment.setStatus(AppointmentStatus.valueOf(statusStr.toUpperCase()));
            
            Appointment saved = appointmentService.saveAppointment(appointment);
            
            Map<String, Object> response = mapAppointmentToResponse(saved);
            response.put("success", true);
            response.put("message", "Tạo lịch hẹn thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi tạo lịch hẹn: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật lịch hẹn
     * PUT /api/admin/appointments/{id}
     */
    @PutMapping("/appointments/{id}")
    public ResponseEntity<Map<String, Object>> updateAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Appointment appointment = appointmentService.getAppointmentById(id)
                    .orElseThrow(() -> new RuntimeException("Lịch hẹn không tồn tại"));
            
            // Update status if present
            if (request.containsKey("status")) {
                String statusStr = request.get("status").toString().toUpperCase();
                appointment.setStatus(AppointmentStatus.valueOf(statusStr));
            }
            
            Appointment updated = appointmentService.saveAppointment(appointment);
            
            Map<String, Object> response = mapAppointmentToResponse(updated);
            response.put("success", true);
            response.put("message", "Cập nhật lịch hẹn thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi cập nhật lịch hẹn: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật trạng thái lịch hẹn
     * PUT /api/admin/appointments/{id}/status
     */
    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<Map<String, Object>> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            Appointment appointment = appointmentService.getAppointmentById(id)
                    .orElseThrow(() -> new RuntimeException("Lịch hẹn không tồn tại"));
            
            String statusStr = request.get("status").toUpperCase();
            appointment.setStatus(AppointmentStatus.valueOf(statusStr));
            
            appointmentService.saveAppointment(appointment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái thành công");
            response.put("data", mapAppointmentToResponse(appointment));
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi cập nhật trạng thái: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Xóa lịch hẹn
     * DELETE /api/admin/appointments/{id}
     */
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Map<String, Object>> deleteAppointment(@PathVariable Long id) {
        try {
            if (!appointmentService.getAppointmentById(id).isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Lịch hẹn không tồn tại");
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            appointmentService.deleteAppointment(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa lịch hẹn thành công");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi xóa lịch hẹn: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Helper method to map Appointment to response format
     */
    private Map<String, Object> mapAppointmentToResponse(Appointment appointment) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", appointment.getAppointmentId());
        response.put("patientId", appointment.getPatient().getUserId());
        response.put("patientName", appointment.getPatient().getName());
        response.put("doctorId", appointment.getDoctor().getUserId());
        response.put("doctorName", appointment.getDoctor().getName());
        response.put("appointmentDate", appointment.getDate().toString());
        response.put("slot", appointment.getSlot().name());
        response.put("slotTime", appointment.getSlot().getTimeRange());
        response.put("status", appointment.getStatus().name().toLowerCase());
        response.put("createdAt", appointment.getCreatedAt() != null ? appointment.getCreatedAt().toString() : "");
        
        // Include video call session timestamps when available
        // Fetch VideoCallSession explicitly from repository to avoid lazy loading issues
        try {
            var session = videoCallSessionRepository.findById(appointment.getAppointmentId()).orElse(null);
            if (session != null) {
                response.put("videoCallStart", session.getStartTime() != null ? session.getStartTime().toString() : null);
                response.put("videoCallEnd", session.getEndTime() != null ? session.getEndTime().toString() : null);
            } else {
                response.put("videoCallStart", null);
                response.put("videoCallEnd", null);
            }
        } catch (Exception e) {
            // If there's any error fetching the session, just set to null
            response.put("videoCallStart", null);
            response.put("videoCallEnd", null);
        }
        
        return response;
    }

    // ============================================
    // PAYMENT MANAGEMENT APIs
    // ============================================

    /**
     * Lấy danh sách tất cả thanh toán
     * GET /api/admin/payments
     */
    @GetMapping("/payments")
    public ResponseEntity<Map<String, Object>> getAllPayments() {
        try {
            List<Payment> payments = paymentService.getAllPayments();
            
            List<Map<String, Object>> paymentList = payments.stream()
                    .map(this::mapPaymentToResponse)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy danh sách thanh toán: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật trạng thái thanh toán
     * PUT /api/admin/payments/{id}/status
     */
    @PutMapping("/payments/{id}/status")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            Payment payment = paymentService.getPaymentById(id)
                    .orElseThrow(() -> new RuntimeException("Thanh toán không tồn tại"));
            
            String statusStr = request.get("status").toUpperCase();
            se1961.g1.medconnect.enums.PaymentStatus newStatus = 
                se1961.g1.medconnect.enums.PaymentStatus.valueOf(statusStr);
            
            payment.setStatus(newStatus);
            if (newStatus == se1961.g1.medconnect.enums.PaymentStatus.PAID) {
                payment.setPaidAt(LocalDateTime.now());
            }
            
            paymentRepository.save(payment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái thanh toán thành công");
            response.put("data", mapPaymentToResponse(payment));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi cập nhật trạng thái: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Helper method to map Payment to response format
     */
    private Map<String, Object> mapPaymentToResponse(Payment payment) {
        Map<String, Object> response = new HashMap<>();
        
        response.put("id", payment.getPaymentId());
        response.put("amount", payment.getAmount());
        response.put("status", payment.getStatus().name().toLowerCase());
        response.put("transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "");
        response.put("paymentMethod", payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "");
        response.put("gatewayName", payment.getGatewayName() != null ? payment.getGatewayName() : "");
        
        // Appointment info
        if (payment.getAppointment() != null) {
            Appointment appt = payment.getAppointment();
            response.put("appointmentId", appt.getAppointmentId());
            response.put("patientName", appt.getPatient().getName());
            response.put("doctorName", appt.getDoctor().getName());
            response.put("appointmentDate", appt.getDate().toString());
            response.put("appointmentSlot", appt.getSlot().getTimeRange());
        } else {
            response.put("appointmentId", null);
            response.put("patientName", payment.getPatient() != null ? payment.getPatient().getName() : "");
            response.put("doctorName", "");
            response.put("appointmentDate", "");
            response.put("appointmentSlot", "");
        }
        
        // Timestamps
        response.put("createdAt", payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : "");
        response.put("paidAt", payment.getPaidAt() != null ? payment.getPaidAt().toString() : "");
        
        return response;
    }
}
