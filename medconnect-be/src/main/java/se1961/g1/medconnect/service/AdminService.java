package se1961.g1.medconnect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
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

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private TransactionTemplate transactionTemplate;

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
    public AdminDTO createAdmin(CreateAdminRequest request) throws Exception {
        // Kiểm tra email đã tồn tại chưa
        Optional<User> existingUser = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(request.getEmail()))
                .findFirst();
        
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }

        UserRecord userRecord = null;
        final String[] firebaseUidHolder = {null};
        
        try {
            // Tạo user trên Firebase trước (ngoài transaction)
            UserRecord.CreateRequest firebaseRequest = new UserRecord.CreateRequest()
                    .setEmail(request.getEmail())
                    .setPassword(request.getPassword())
                    .setEmailVerified(true);
            
            userRecord = firebaseAuth.createUser(firebaseRequest);
            final String firebaseUid = userRecord.getUid();
            firebaseUidHolder[0] = firebaseUid;
            
            // Tạo admin trong database (trong transaction riêng)
            Admin savedAdmin = transactionTemplate.execute(status -> {
                Admin admin = new Admin();
                admin.setEmail(request.getEmail());
                admin.setFirebaseUid(firebaseUid);
                admin.setRole(Role.ADMIN);
                // Set default avatar for admin
                admin.setAvatarUrl("https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?semt=ais_hybrid&w=740&q=80");
                
                return adminRepository.save(admin);
            });
            
            // Send account creation email with password
            try {
                // Extract name from email (part before @) or use "Admin"
                String userName = request.getEmail().split("@")[0];
                emailService.sendAccountCreatedEmail(
                    request.getEmail(),
                    userName,
                    request.getPassword(),
                    "Admin"
                );
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send account creation email: " + e.getMessage());
                // Don't throw - email failure shouldn't break account creation
            }
            
            return convertToDTO(savedAdmin);
            
        } catch (Exception e) {
            // Nếu đã tạo Firebase user nhưng lưu database thất bại, xóa Firebase user
            if (firebaseUidHolder[0] != null) {
                try {
                    System.out.println("⚠️ Database save failed, cleaning up Firebase user: " + firebaseUidHolder[0]);
                    firebaseAuth.deleteUser(firebaseUidHolder[0]);
                    System.out.println("✅ Firebase user cleaned up successfully");
                } catch (Exception cleanupError) {
                    System.err.println("❌ Failed to cleanup Firebase user: " + cleanupError.getMessage());
                    // Log but don't throw - original exception is more important
                }
            }
            // Re-throw original exception
            throw e;
        }
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
     * Reset password for doctor or patient
     * @param userId User ID
     * @param sendEmail Whether to send email with new password
     * @return New password
     */
    @Transactional
    public String resetUserPassword(Long userId, boolean sendEmail) throws Exception {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User không tồn tại");
        }

        User user = userOpt.get();
        
        // Generate new random password
        String newPassword = generateRandomPassword();
        
        // Update password on Firebase
        if (user.getFirebaseUid() != null && !user.getFirebaseUid().isEmpty()) {
            UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(user.getFirebaseUid())
                    .setPassword(newPassword);
            firebaseAuth.updateUser(updateRequest);
        } else {
            throw new RuntimeException("User không có Firebase UID");
        }
        
        // Send email if requested
        if (sendEmail) {
            try {
                String roleName = user.getRole() == Role.DOCTOR ? "Bác sĩ" : 
                                 user.getRole() == Role.PATIENT ? "Bệnh nhân" : "Người dùng";
                String userName = user.getName() != null ? user.getName() : 
                                user.getEmail().split("@")[0];
                emailService.sendAccountCreatedEmail(
                    user.getEmail(),
                    userName,
                    newPassword,
                    roleName
                );
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send password reset email: " + e.getMessage());
                // Don't throw - password reset should succeed even if email fails
            }
        }
        
        return newPassword;
    }
    
    /**
     * Generate random password
     */
    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder password = new StringBuilder();
        java.util.Random random = new java.util.Random();
        
        // Ensure at least one uppercase, one lowercase, one digit, one special char
        password.append("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(random.nextInt(26)));
        password.append("abcdefghijklmnopqrstuvwxyz".charAt(random.nextInt(26)));
        password.append("0123456789".charAt(random.nextInt(10)));
        password.append("!@#$%^&*".charAt(random.nextInt(8)));
        
        // Add remaining characters
        for (int i = 4; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        // Shuffle the password
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
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
