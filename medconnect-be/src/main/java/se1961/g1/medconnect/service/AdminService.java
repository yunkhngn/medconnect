package se1961.g1.medconnect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import se1961.g1.medconnect.dto.AdminDTO;
import se1961.g1.medconnect.dto.CreateAdminRequest;
import se1961.g1.medconnect.dto.UpdateAdminRequest;
import se1961.g1.medconnect.enums.Role;
import se1961.g1.medconnect.pojo.Admin;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.AdminRepository;
import se1961.g1.medconnect.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FirebaseAuth firebaseAuth;

    /**
     * Lấy danh sách tất cả admin
     */
    public List<AdminDTO> getAllAdmins() {
        List<User> users = userRepository.findAll();
        
        return users.stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin admin theo ID
     */
    public Optional<AdminDTO> getAdminById(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent() && userOpt.get() instanceof Admin) {
            return Optional.of(convertToDTO(userOpt.get()));
        }
        
        return Optional.empty();
    }

    /**
     * Tạo admin mới
     */
    @Transactional
    public AdminDTO createAdmin(CreateAdminRequest request) throws Exception {
        // Kiểm tra email đã tồn tại chưa
        Optional<User> existingUser = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(request.getEmail()))
                .findFirst();
        
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }

        // Tạo user trên Firebase
        UserRecord.CreateRequest firebaseRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setEmailVerified(true);
        
        UserRecord userRecord = firebaseAuth.createUser(firebaseRequest);

        // Tạo admin trong database
        Admin admin = new Admin();
        admin.setEmail(request.getEmail());
        admin.setFirebaseUid(userRecord.getUid());
        admin.setRole(Role.ADMIN);

        Admin savedAdmin = adminRepository.save(admin);
        
        return convertToDTO(savedAdmin);
    }

    /**
     * Cập nhật thông tin admin
     */
    @Transactional
    public AdminDTO updateAdmin(Long userId, UpdateAdminRequest request) throws Exception {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty() || !(userOpt.get() instanceof Admin)) {
            throw new RuntimeException("Admin không tồn tại");
        }

        Admin admin = (Admin) userOpt.get();

        // Cập nhật email trên Firebase nếu thay đổi
        if (request.getEmail() != null && !request.getEmail().equals(admin.getEmail())) {
            UserRecord.UpdateRequest firebaseUpdate = new UserRecord.UpdateRequest(admin.getFirebaseUid())
                    .setEmail(request.getEmail());
            firebaseAuth.updateUser(firebaseUpdate);
            admin.setEmail(request.getEmail());
        }

        Admin updatedAdmin = adminRepository.save(admin);
        
        return convertToDTO(updatedAdmin);
    }

    /**
     * Xóa admin
     */
    @Transactional
    public void deleteAdmin(Long userId) throws Exception {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty() || !(userOpt.get() instanceof Admin)) {
            throw new RuntimeException("Admin không tồn tại");
        }

        User user = userOpt.get();

        // Xóa user trên Firebase
        if (user.getFirebaseUid() != null && !user.getFirebaseUid().isEmpty()) {
            try {
                System.out.println("Deleting Firebase account for admin: " + user.getFirebaseUid());
                firebaseAuth.deleteUser(user.getFirebaseUid());
                System.out.println("✅ Firebase account deleted successfully");
            } catch (Exception e) {
                System.err.println("❌ Failed to delete Firebase user for admin id=" + userId + ": " + e.getMessage());
                e.printStackTrace();
                // Continue with database deletion even if Firebase deletion fails
            }
        } else {
            System.out.println("⚠️ Admin has no Firebase UID, skipping Firebase deletion");
        }

        // Xóa trong database
        userRepository.deleteById(userId);
    }

    /**
     * Khóa/Mở khóa admin
     */
    @Transactional
    public AdminDTO toggleAdminStatus(Long userId, boolean disabled) throws Exception {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty() || !(userOpt.get() instanceof Admin)) {
            throw new RuntimeException("Admin không tồn tại");
        }

        User user = userOpt.get();

        // Cập nhật trạng thái trên Firebase
        UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(user.getFirebaseUid())
                .setDisabled(disabled);
        firebaseAuth.updateUser(updateRequest);

        return convertToDTO(user);
    }

    /**
     * Đổi mật khẩu admin
     */
    @Transactional
    public void changeAdminPassword(Long userId, String newPassword) throws Exception {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty() || !(userOpt.get() instanceof Admin)) {
            throw new RuntimeException("Admin không tồn tại");
        }

        User user = userOpt.get();

        // Cập nhật mật khẩu trên Firebase
        UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(user.getFirebaseUid())
                .setPassword(newPassword);
        firebaseAuth.updateUser(updateRequest);
    }

    /**
     * Convert User entity to AdminDTO
     */
    private AdminDTO convertToDTO(User user) {
        AdminDTO dto = new AdminDTO();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setFirebaseUid(user.getFirebaseUid());
        dto.setRole(user.getRole());

        // Lấy trạng thái từ Firebase
        try {
            UserRecord userRecord = firebaseAuth.getUser(user.getFirebaseUid());
            dto.setStatus(userRecord.isDisabled() ? "blocked" : "active");
        } catch (Exception e) {
            dto.setStatus("unknown");
        }

        return dto;
    }
}
