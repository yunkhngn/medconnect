package se1961.g1.medconnect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.repository.PatientRepository;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private FirebaseAuth firebaseAuth;

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
     * Delete patient by ID
     */
    public void deletePatient(Long userId) {
        patientRepository.deleteById(userId);
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
            
            return patientRepository.save(patient);
            
        } catch (Exception e) {
            throw new Exception("Không thể tạo bệnh nhân: " + e.getMessage());
        }
    }
}
