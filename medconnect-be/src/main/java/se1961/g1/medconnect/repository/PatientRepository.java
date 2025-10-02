package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se1961.g1.medconnect.pojo.Patient;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
}
