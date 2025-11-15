package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.dto.DoctorApplicationDTO;
import se1961.g1.medconnect.dto.DoctorDTO;
import se1961.g1.medconnect.enums.Role;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Speciality;
import se1961.g1.medconnect.repository.AppointmentRepository;
import se1961.g1.medconnect.repository.DoctorRepository;
import se1961.g1.medconnect.repository.LicenseRepository;
import se1961.g1.medconnect.repository.PaymentRepository;
import se1961.g1.medconnect.repository.ScheduleRepository;
import se1961.g1.medconnect.repository.SpecialityRepository;
import se1961.g1.medconnect.repository.UserRepository;
import se1961.g1.medconnect.repository.VideoCallSessionRepository;
import se1961.g1.medconnect.pojo.License;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private SpecialityRepository specialityRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FirebaseService firebaseService;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private VideoCallSessionRepository videoCallSessionRepository;
    @Autowired
    private ScheduleRepository scheduleRepository;
    @Autowired
    private LicenseRepository licenseRepository;
    @Autowired
    private EmailService emailService;

    public Optional<Doctor> getDoctor(String uid) throws Exception {
        return doctorRepository.findByFirebaseUid(uid);
    }

    public List<AppointmentDTO> getAppointments(Doctor doctor) throws Exception {
        if (doctor == null || doctor.getAppointments() == null) {
            throw new Exception("Doctor or appointment list not found");
        }

        return doctor.getAppointments()
                .stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor addDoctor(DoctorDTO dto) {
        // Check if email already exists
        if (dto.getEmail() != null && userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }
        
        // Check if phone already exists
        if (dto.getPhone() != null && userRepository.findByPhone(dto.getPhone()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }
        
        String firebaseUid;
        try {
            // Create Firebase account with phone as initial password
            firebaseUid = firebaseService.createFirebaseUser(
                dto.getEmail(),
                dto.getPhone(), // Use phone as initial password
                dto.getName()
            );
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo tài khoản Firebase: " + e.getMessage());
        }
        
        // Create Doctor (which extends User, so it is also a User)
        Doctor doctor = new Doctor();
        doctor.setEmail(dto.getEmail());
        doctor.setName(dto.getName());
        doctor.setPhone(dto.getPhone());
        doctor.setRole(Role.DOCTOR);
        doctor.setFirebaseUid(firebaseUid); // Use real Firebase UID
        // Set default avatar for doctor
        doctor.setAvatarUrl("https://thumbs.dreamstime.com/b/d-avatar-doctor-portrait-medical-uniform-white-background-327426936.jpg");
        
        mapDtoToDoctor(dto, doctor);
        Doctor savedDoctor = doctorRepository.save(doctor);
        
        // Send account creation email with password
        try {
            emailService.sendAccountCreatedEmail(
                dto.getEmail(),
                dto.getName(),
                dto.getPhone(), // Password is phone number
                "Bác sĩ"
            );
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send account creation email: " + e.getMessage());
            // Don't throw - email failure shouldn't break account creation
        }
        
        return savedDoctor;
    }

    public Doctor updateDoctor(Long id, DoctorDTO dto) {
        Doctor existing = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        // Store original status before update
        se1961.g1.medconnect.enums.DoctorStatus originalStatus = existing.getStatus();
        
        System.out.println("=== Doctor Update Request ===");
        System.out.println("Doctor ID: " + id);
        System.out.println("Original status: " + originalStatus);
        System.out.println("Requested status: " + dto.getStatus());
        
        // Validate status transition rules
        if (dto.getStatus() != null && originalStatus != null) {
            // Rule 1: Cannot change from ACTIVE to PENDING
            if (originalStatus == se1961.g1.medconnect.enums.DoctorStatus.ACTIVE 
                    && dto.getStatus() == se1961.g1.medconnect.enums.DoctorStatus.PENDING) {
                throw new RuntimeException("Không thể chuyển bác sĩ từ trạng thái ACTIVE về PENDING");
            }
            
            // Rule 2: From PENDING, only allow transition to ACTIVE
            if (originalStatus == se1961.g1.medconnect.enums.DoctorStatus.PENDING 
                    && dto.getStatus() != se1961.g1.medconnect.enums.DoctorStatus.ACTIVE) {
                throw new RuntimeException("Bác sĩ đang ở trạng thái PENDING chỉ có thể được chuyển sang ACTIVE");
            }
        }
        
        // Update User info if provided
        if (dto.getName() != null) {
            existing.setName(dto.getName());
        }
        if (dto.getPhone() != null) {
            existing.setPhone(dto.getPhone());
        }
        // Email không được thay đổi
        
        // Map DTO to Doctor (this will set the new status)
        mapDtoToDoctor(dto, existing);
        
        // Check if doctor is being approved (PENDING -> ACTIVE) AFTER mapping
        boolean isBeingApproved = originalStatus == se1961.g1.medconnect.enums.DoctorStatus.PENDING 
                && existing.getStatus() == se1961.g1.medconnect.enums.DoctorStatus.ACTIVE;
        
        System.out.println("Status after mapping: " + existing.getStatus());
        System.out.println("Is being approved: " + isBeingApproved);
        
        // If being approved, create Firebase account and send email
        if (isBeingApproved) {
            System.out.println("=== Starting Doctor Approval Process ===");
            System.out.println("Doctor email: " + existing.getEmail());
            System.out.println("Doctor name: " + existing.getName());
            
            try {
                // Generate random password
                String tempPassword = generateRandomPassword();
                System.out.println("Generated password: " + tempPassword);
                
                // Check if Firebase account already exists (if firebaseUid is not a placeholder)
                if (existing.getFirebaseUid() != null && !existing.getFirebaseUid().startsWith("pending-")) {
                    System.out.println("Firebase account already exists: " + existing.getFirebaseUid());
                    // Update password instead of creating new account
                    try {
                        firebaseService.updateFirebaseUserPassword(existing.getFirebaseUid(), tempPassword);
                        System.out.println("Updated Firebase password successfully");
                    } catch (Exception e) {
                        System.err.println("Failed to update Firebase password: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    // Check if email already exists in Firebase
                    System.out.println("Checking if email already exists in Firebase...");
                    String foundUid = firebaseService.getFirebaseUserByEmail(existing.getEmail());
                    
                    if (foundUid != null) {
                        // Email already exists, update password instead
                        System.out.println("Email already exists in Firebase. UID: " + foundUid);
                        System.out.println("Updating password for existing Firebase account...");
                        try {
                            firebaseService.updateFirebaseUserPassword(foundUid, tempPassword);
                            existing.setFirebaseUid(foundUid);
                            System.out.println("Updated Firebase password successfully");
                        } catch (Exception e) {
                            System.err.println("Failed to update Firebase password: " + e.getMessage());
                            e.printStackTrace();
                            // Continue with approval even if password update fails
                            existing.setFirebaseUid(foundUid);
                        }
                    } else {
                        // Create new Firebase account
                        System.out.println("Creating new Firebase account...");
                        try {
                            String firebaseUid = firebaseService.createFirebaseUser(
                                existing.getEmail(),
                                tempPassword,
                                existing.getName()
                            );
                            existing.setFirebaseUid(firebaseUid);
                            System.out.println("Firebase account created: " + firebaseUid);
                        } catch (Exception e) {
                            // If creation fails due to EMAIL_EXISTS, try to get existing user
                            if (e.getMessage() != null && e.getMessage().contains("EMAIL_EXISTS")) {
                                System.out.println("Email exists error caught. Trying to get existing user...");
                                String foundUidOnError = firebaseService.getFirebaseUserByEmail(existing.getEmail());
                                if (foundUidOnError != null) {
                                    System.out.println("Found existing Firebase user. UID: " + foundUidOnError);
                                    try {
                                        firebaseService.updateFirebaseUserPassword(foundUidOnError, tempPassword);
                                        existing.setFirebaseUid(foundUidOnError);
                                        System.out.println("Updated Firebase password successfully");
                                    } catch (Exception updateEx) {
                                        System.err.println("Failed to update Firebase password: " + updateEx.getMessage());
                                        existing.setFirebaseUid(foundUidOnError); // Still set UID even if password update fails
                                    }
                                } else {
                                    throw new RuntimeException("Không thể tạo tài khoản Firebase: " + e.getMessage());
                                }
                            } else {
                                throw new RuntimeException("Không thể tạo tài khoản Firebase: " + e.getMessage());
                            }
                        }
                    }
                }
                
                // Send approval email with password
                System.out.println("Sending approval email to: " + existing.getEmail());
                try {
                    emailService.sendDoctorApprovalEmail(
                        existing.getEmail(),
                        existing.getName(),
                        tempPassword
                    );
                    System.out.println("✅ Approval email sent successfully!");
                } catch (Exception emailException) {
                    System.err.println("❌ ERROR: Failed to send approval email");
                    System.err.println("Email error: " + emailException.getMessage());
                    emailException.printStackTrace();
                    // Don't throw - email failure shouldn't block approval
                    // Log warning but continue with approval
                    System.err.println("⚠️ WARNING: Doctor approved but email notification failed. Please notify doctor manually.");
                }
                
            } catch (RuntimeException e) {
                // Re-throw RuntimeException (including our custom exceptions)
                throw e;
            } catch (Exception e) {
                System.err.println("❌ ERROR: Failed to create Firebase account");
                System.err.println("Error message: " + e.getMessage());
                e.printStackTrace();
                // Continue with approval even if Firebase fails, but throw if email fails
                throw new RuntimeException("Không thể tạo tài khoản Firebase: " + e.getMessage(), e);
            }
        }
        
        return doctorRepository.save(existing);
    }
    
    /**
     * Generate random password for doctor approval
     */
    private String generateRandomPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return password.toString();
    }

    @Transactional
    public void deleteDoctor(Long id) throws Exception {
        Doctor existing = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Clean up schedules
        scheduleRepository.deleteByUser(existing);

        // Clean up appointments and associated records
        List<Appointment> appointments = appointmentRepository.findByDoctor(existing);
        for (Appointment appointment : appointments) {
            // delete payment if any
            paymentRepository.deleteByAppointment(appointment);
            // delete video call session if any
            videoCallSessionRepository.deleteByAppointment(appointment);
        }
        if (!appointments.isEmpty()) {
            appointmentRepository.deleteAll(appointments);
        }

        // Delete Firebase account
        if (existing.getFirebaseUid() != null && !existing.getFirebaseUid().isEmpty() && !existing.getFirebaseUid().startsWith("pending-")) {
        try {
                System.out.println("Deleting Firebase account for doctor: " + existing.getFirebaseUid());
            firebaseService.deleteFirebaseUser(existing.getFirebaseUid());
                System.out.println("✅ Firebase account deleted successfully");
        } catch (Exception e) {
            // Log and continue deletion to keep DB consistent
                System.err.println("❌ Failed to delete Firebase user for doctor id=" + id + ": " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("⚠️ Doctor has no valid Firebase UID (or is pending), skipping Firebase deletion");
        }

        doctorRepository.delete(existing);
    }

    /**
     * Save or update a Doctor entity directly (for profile updates)
     */
    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    private void mapDtoToDoctor(DoctorDTO dto, Doctor doctor) {
        // Set status - default to ACTIVE if not provided
        if (dto.getStatus() != null) {
            doctor.setStatus(dto.getStatus());
        } else {
            doctor.setStatus(se1961.g1.medconnect.enums.DoctorStatus.ACTIVE);
        }
        
        doctor.setExperienceYears(dto.getExperienceYears());
        doctor.setEducationLevel(dto.getEducationLevel());
        doctor.setBio(dto.getBio());
        doctor.setClinicAddress(dto.getClinicAddress());
        doctor.setProvinceCode(dto.getProvinceCode());
        doctor.setProvinceName(dto.getProvinceName());
        doctor.setDistrictCode(dto.getDistrictCode());
        doctor.setWardCode(dto.getWardCode());

        if (dto.getSpecialityId() != null) {
            Speciality speciality = specialityRepository.findById(dto.getSpecialityId())
                    .orElseThrow(() -> new RuntimeException("Speciality not found"));
            doctor.setSpeciality(speciality);
        } else {
            doctor.setSpeciality(null);
        }
    }

    /**
     * Create doctor from application form (without Firebase initially)
     * Firebase account will be created by Admin when approving
     * Status: PENDING by default
     */
    public Doctor createDoctorFromApplication(DoctorApplicationDTO dto) {
        // Validate email uniqueness
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Validate phone uniqueness
        if (userRepository.findByPhone(dto.getPhone()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        // Create Doctor entity (includes User data via inheritance)
        Doctor doctor = new Doctor();
        
        // User info
        doctor.setName(dto.getFullName());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());
        doctor.setRole(Role.DOCTOR);
        // Set default avatar for doctor
        doctor.setAvatarUrl("https://thumbs.dreamstime.com/b/d-avatar-doctor-portrait-medical-uniform-white-background-327426936.jpg");
        
        // Generate temporary firebase_uid placeholder
        // Admin will update this with real Firebase UID when approving
        doctor.setFirebaseUid("pending-" + System.currentTimeMillis());
        
        // Note: No password stored in DB - using Firebase Authentication
        // When admin approves, they will create Firebase account with:
        // - Email: dto.getEmail()
        // - Password: dto.getPhone() (or auto-generated)
        
        // Doctor-specific info
        doctor.setStatus(se1961.g1.medconnect.enums.DoctorStatus.PENDING);  // Default PENDING for applications
        doctor.setExperienceYears(dto.getExperience());
        doctor.setEducationLevel(dto.getEducation());
        doctor.setBio(dto.getBio());
        doctor.setClinicAddress(dto.getClinicAddress());
        
        // Set specialty
        if (dto.getSpecialtyId() != null) {
            Speciality speciality = specialityRepository.findById(dto.getSpecialtyId())
                    .orElseThrow(() -> new RuntimeException("Chuyên khoa không tồn tại"));
            doctor.setSpeciality(speciality);
        }
        
        // Save doctor first to get ID
        doctor = doctorRepository.save(doctor);
        
        // Parse and save certifications as License records
        if (dto.getCertifications() != null && !dto.getCertifications().trim().isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                List<Map<String, Object>> certifications = objectMapper.readValue(
                    dto.getCertifications(), 
                    new TypeReference<List<Map<String, Object>>>() {}
                );
                
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                
                for (Map<String, Object> cert : certifications) {
                    License license = new License();
                    license.setDoctor(doctor);
                    license.setLicenseNumber((String) cert.get("certificateNumber"));
                    
                    // Parse issue date
                    if (cert.get("issueDate") != null) {
                        license.setIssuedDate(LocalDate.parse((String) cert.get("issueDate"), dateFormatter));
                    }
                    
                    // Parse expiry date (optional)
                    if (cert.get("expiryDate") != null && !((String) cert.get("expiryDate")).isEmpty()) {
                        license.setExpiryDate(LocalDate.parse((String) cert.get("expiryDate"), dateFormatter));
                    }
                    
                    license.setIssuedBy((String) cert.get("issuingAuthority"));
                    license.setIssuerTitle((String) cert.get("issuerPosition"));
                    license.setScopeOfPractice((String) cert.get("scope"));
                    license.setNotes((String) cert.get("notes"));
                    license.setIsActive(true);
                    
                    // Handle base64 image - store as JSON array string
                    if (cert.get("base64Image") != null) {
                        // Store base64 image as JSON array
                        String base64Image = (String) cert.get("base64Image");
                        license.setProofImages("[\"" + base64Image + "\"]");
                    }
                    
                    licenseRepository.save(license);
                }
            } catch (Exception e) {
                System.err.println("Failed to parse certifications: " + e.getMessage());
                // Continue even if license parsing fails
            }
        }
        
        return doctor;
    }
}
