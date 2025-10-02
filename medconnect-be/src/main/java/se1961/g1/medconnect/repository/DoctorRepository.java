package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se1961.g1.medconnect.pojo.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Integer>
{
}
