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
import se1961.g1.medconnect.pojo.*;
import se1961.g1.medconnect.service.AdminService;
import se1961.g1.medconnect.service.DoctorService;
import se1961.g1.medconnect.service.SpecialityService;

import java.util.ArrayList;
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
    private SpecialityService specialityService;

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
            doctorData.put("name", doctor.getName());
            doctorData.put("email", doctor.getEmail());
            doctorData.put("phone", doctor.getPhone());
            doctorData.put("specialty", doctor.getSpeciality() != null ? doctor.getSpeciality().getName() : "Chưa có");
            doctorData.put("avatar", doctor.getAvatarUrl());
            doctorData.put("status", doctor.getStatus() != null ? doctor.getStatus().name() : null);

            // Get license number from active license
            License activeLicense = doctor.getActiveLicense();
            doctorData.put("licenseId", activeLicense != null ? activeLicense.getLicenseNumber() : null);

            response.add(doctorData);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createDoctor(@RequestBody DoctorDTO dto) {
        try {
            Doctor saved = doctorService.addDoctor(dto);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody DoctorDTO dto) {
        try {
            Doctor updated = doctorService.updateDoctor(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


    @DeleteMapping("/doctor/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id){
        try{
            doctorService.deleteDoctor(id);
            return ResponseEntity.ok("Doctor deleted successfully");
        } catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
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
}
