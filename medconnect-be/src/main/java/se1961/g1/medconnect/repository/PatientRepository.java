package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import se1961.g1.medconnect.pojo.Patient;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(Long userId);
    Optional<Patient> findByFirebaseUid(String firebaseUid);
}
