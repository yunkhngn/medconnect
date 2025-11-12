package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Feedback;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByDoctorOrderByCreatedAtDesc(Doctor doctor);
    
    // Note: Use findByDoctorOrderByCreatedAtDesc and limit in service
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.doctor = :doctor")
    Double findAverageRatingByDoctor(@Param("doctor") Doctor doctor);
    
    @Query("SELECT f FROM Feedback f WHERE f.appointment.appointmentId = :appointmentId")
    Feedback findByAppointmentId(@Param("appointmentId") Long appointmentId);
    
    List<Feedback> findByDoctor(Doctor doctor);
}

