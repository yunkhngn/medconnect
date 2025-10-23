package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.repository.PatientRepository;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

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
     * Save patient
     */
    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }
}
