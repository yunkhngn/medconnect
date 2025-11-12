package se1961.g1.medconnect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Payment;
import se1961.g1.medconnect.repository.PatientRepository;
import se1961.g1.medconnect.repository.AppointmentRepository;
import se1961.g1.medconnect.repository.PaymentRepository;
import se1961.g1.medconnect.repository.VideoCallSessionRepository;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private FirebaseAuth firebaseAuth;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private VideoCallSessionRepository videoCallSessionRepository;

    @Autowired
    private FirebaseService firebaseService;

    /**
     * Get patient by Firebase UID
     */
    public Optional<Patient> getPatientByFirebaseUid(String firebaseUid) {
        return patientRepository.findByFirebaseUid(firebaseUid);
    }

    /**
     * Get patient by user ID
     */
    public Optional<Patient> getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId);
    }

    /**
     * Get all patients
     */
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    /**
     * Save patient
     */
    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    /**
     * Delete patient by ID with cascade delete of all related data
     */
    @Transactional
    public void deletePatient(Long userId) throws Exception {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // 1. Get all appointments for this patient
        List<Appointment> appointments = appointmentRepository.findByPatient(patient);
        
        // 2. Delete video call sessions (via appointments)
        for (Appointment appointment : appointments) {
            if (appointment.getVideoCallSession() != null) {
                videoCallSessionRepository.deleteByAppointmentId(appointment.getAppointmentId());
            }
        }

        // 3. Delete payments
        List<Payment> payments = paymentRepository.findByPatient(patient);
        paymentRepository.deleteAll(payments);

        // 4. Delete appointments (cascade will handle video call sessions)
        appointmentRepository.deleteAll(appointments);

        // 5. Delete feedbacks - handled by cascade or JPA will handle orphan removal
        // Feedbacks don't have cascade, but Patient entity has @OneToMany with mappedBy

        // 6. Delete MR (MedicalRecord) - handled by cascade in Patient entity (@OneToOne cascade = CascadeType.ALL)

        // 7. Delete Firebase user
        if (patient.getFirebaseUid() != null && !patient.getFirebaseUid().isEmpty()) {
            try {
                System.out.println("Deleting Firebase account for patient: " + patient.getFirebaseUid());
                firebaseService.deleteFirebaseUser(patient.getFirebaseUid());
                System.out.println("✅ Firebase account deleted successfully");
            } catch (Exception e) {
                System.err.println("❌ Failed to delete Firebase user for patient id=" + userId + ": " + e.getMessage());
                e.printStackTrace();
                // Continue with database deletion even if Firebase deletion fails
            }
        } else {
            System.out.println("⚠️ Patient has no Firebase UID, skipping Firebase deletion");
        }

        // 8. Delete patient (this will cascade delete MR due to @OneToOne cascade = CascadeType.ALL)
        patientRepository.delete(patient);
    }

    /**
     * Create new patient with Firebase Authentication
     */
    public Patient createPatient(String email, String password, String fullName, String phone) throws Exception {
        try {
            // 1. Create user in Firebase Authentication
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(password)
                    .setDisplayName(fullName)
                    .setEmailVerified(false);
            
            UserRecord userRecord = firebaseAuth.createUser(request);
            
            // 2. Create patient in database
            Patient patient = new Patient();
            patient.setFirebaseUid(userRecord.getUid());
            patient.setEmail(email);
            patient.setName(fullName);
            patient.setPhone(phone);
            // Set default avatar for patient
            patient.setAvatarUrl("https://img.freepik.com/free-psd/3d-rendering-avatar_23-2150833572.jpg?semt=ais_hybrid&w=740&q=80");
            
            return patientRepository.save(patient);
            
        } catch (Exception e) {
            throw new Exception("Không thể tạo bệnh nhân: " + e.getMessage());
        }
    }
}
