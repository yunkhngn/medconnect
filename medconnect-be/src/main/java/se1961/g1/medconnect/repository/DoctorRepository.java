package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    @Query("SELECT d FROM Doctor d WHERE d.firebaseUid = :uid")
    Optional<Doctor> findByFirebaseUid(@Param("uid") String uid);
//    List<Appointment> findAppointments(Doctor doctor);
}
