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
import se1961.g1.medconnect.repository.PaymentRepository;
import se1961.g1.medconnect.repository.ScheduleRepository;
import se1961.g1.medconnect.repository.SpecialityRepository;
import se1961.g1.medconnect.repository.UserRepository;
import se1961.g1.medconnect.repository.VideoCallSessionRepository;

import java.util.List;
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
        
        mapDtoToDoctor(dto, doctor);
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, DoctorDTO dto) {
        Doctor existing = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        // Update User info if provided
        if (dto.getName() != null) {
            existing.setName(dto.getName());
        }
        if (dto.getPhone() != null) {
            existing.setPhone(dto.getPhone());
        }
        // Email không được thay đổi
        
        mapDtoToDoctor(dto, existing);
        return doctorRepository.save(existing);
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
        try {
            firebaseService.deleteFirebaseUser(existing.getFirebaseUid());
        } catch (Exception e) {
            // Log and continue deletion to keep DB consistent
            System.err.println("Failed to delete Firebase user for doctor id=" + id + ": " + e.getMessage());
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
        
        return doctorRepository.save(doctor);
    }
}
