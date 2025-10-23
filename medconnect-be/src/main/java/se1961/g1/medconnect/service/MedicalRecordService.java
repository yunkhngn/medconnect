package se1961.g1.medconnect.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.MedicalRecord;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.MedicalRecordRepository;
import se1961.g1.medconnect.repository.PatientRepository;
import se1961.g1.medconnect.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get medical record by patient's Firebase UID
     */
    public MedicalRecord getByPatientFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid)
                .flatMap(user -> patientRepository.findByUserId(user.getUserId()))
                .flatMap(medicalRecordRepository::findByPatient)
                .orElse(null);
    }

    /**
     * Get medical record by patient's user ID
     */
    public MedicalRecord getByPatientUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .flatMap(medicalRecordRepository::findByPatient)
                .orElse(null);
    }

    /**
     * Create new medical record for patient
     * Auto-sync basic info from Patient entity
     */
    public MedicalRecord createForPatient(String firebaseUid, String detail) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        // Check if already exists
        if (medicalRecordRepository.findByPatient(patient).isPresent()) {
            throw new IllegalStateException("Medical record already exists for this patient");
        }

        // Parse incoming detail and merge with Patient data
        try {
            Map<String, Object> emrData = objectMapper.readValue(detail, Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> patientProfile = (Map<String, Object>) emrData.get("patient_profile");
            
            // Auto-fill from Patient entity (overwrite if exists)
            if (patientProfile != null) {
                patientProfile.put("full_name", patient.getName() != null ? patient.getName() : patientProfile.get("full_name"));
                patientProfile.put("dob", patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : patientProfile.get("dob"));
                patientProfile.put("gender", patient.getGender() != null ? patient.getGender() : patientProfile.get("gender"));
                patientProfile.put("address", patient.getAddress() != null ? patient.getAddress() : patientProfile.get("address"));
                patientProfile.put("blood_type", patient.getBloodType() != null ? patient.getBloodType() : patientProfile.get("blood_type"));
                patientProfile.put("phone", patient.getPhone() != null ? patient.getPhone() : patientProfile.get("phone"));
                patientProfile.put("email", patient.getEmail() != null ? patient.getEmail() : patientProfile.get("email"));
                patientProfile.put("citizenship", patient.getCitizenship() != null ? patient.getCitizenship() : patientProfile.get("citizenship"));
                patientProfile.put("allergies", patient.getAllergies() != null ? patient.getAllergies() : patientProfile.get("allergies"));
                patientProfile.put("insurance_number", patient.getSocialInsurance() != null ? patient.getSocialInsurance() : patientProfile.get("insurance_number"));
                patientProfile.put("insurance_valid_to", patient.getInsuranceValidTo() != null ? patient.getInsuranceValidTo().toString() : patientProfile.get("insurance_valid_to"));
                
                // Emergency contact
                @SuppressWarnings("unchecked")
                Map<String, Object> emergencyContact = (Map<String, Object>) patientProfile.get("emergency_contact");
                if (emergencyContact != null) {
                    if (patient.getEmergencyContactName() != null) {
                        emergencyContact.put("name", patient.getEmergencyContactName());
                    }
                    if (patient.getEmergencyContactPhone() != null) {
                        emergencyContact.put("phone", patient.getEmergencyContactPhone());
                    }
                    if (patient.getEmergencyContactRelationship() != null) {
                        emergencyContact.put("relation", patient.getEmergencyContactRelationship());
                    }
                }
            }
            
            // Convert back to JSON
            detail = objectMapper.writeValueAsString(emrData);
        } catch (Exception e) {
            System.err.println("Warning: Could not auto-sync patient data: " + e.getMessage());
            // Continue with original detail if sync fails
        }

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setDetail(detail);
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());

        return medicalRecordRepository.save(record);
    }

    /**
     * Update patient profile section only
     */
    public MedicalRecord updatePatientProfile(String firebaseUid, String newDetail) {
        MedicalRecord record = getByPatientFirebaseUid(firebaseUid);
        if (record == null) {
            throw new IllegalArgumentException("Medical record not found");
        }

        record.setDetail(newDetail);
        record.setUpdatedAt(LocalDateTime.now());

        return medicalRecordRepository.save(record);
    }

    /**
     * Add a new medical record entry (doctor adds after consultation)
     */
    @SuppressWarnings("unchecked")
    public MedicalRecord addMedicalRecordEntry(Long patientUserId, Object entryData) {
        MedicalRecord record = getByPatientUserId(patientUserId);
        if (record == null) {
            throw new IllegalArgumentException("Medical record not found");
        }

        try {
            // Parse existing detail
            String currentDetail = record.getDetail();
            Map<String, Object> emrData = objectMapper.readValue(currentDetail, Map.class);

            // Get medical_records array
            List<Object> medicalRecords = (List<Object>) emrData.get("medical_records");
            if (medicalRecords == null) {
                medicalRecords = new java.util.ArrayList<>();
                emrData.put("medical_records", medicalRecords);
            }

            // Add new entry
            medicalRecords.add(entryData);

            // Convert back to JSON
            String updatedDetail = objectMapper.writeValueAsString(emrData);
            record.setDetail(updatedDetail);
            record.setUpdatedAt(LocalDateTime.now());

            return medicalRecordRepository.save(record);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add medical record entry", e);
        }
    }

    /**
     * Get all medical records (Admin)
     */
    public List<MedicalRecord> getAllRecords() {
        return medicalRecordRepository.findAll();
    }

    /**
     * Delete medical record
     */
    public void deleteRecord(Long recordId) {
        medicalRecordRepository.deleteById(recordId);
    }

    /**
     * Delete EMR by patient Firebase UID
     */
    public void deleteByPatientFirebaseUid(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Patient patient = patientRepository.findById(user.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        MedicalRecord mr = medicalRecordRepository.findByPatient(patient)
            .orElseThrow(() -> new IllegalArgumentException("Medical record not found"));

        medicalRecordRepository.delete(mr);
    }
}

