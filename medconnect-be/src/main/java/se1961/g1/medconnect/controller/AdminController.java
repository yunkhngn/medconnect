package se1961.g1.medconnect.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.AdminDTO;
import se1961.g1.medconnect.dto.CreateAdminRequest;
import se1961.g1.medconnect.dto.UpdateAdminRequest;
import se1961.g1.medconnect.service.AdminService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;

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
}
