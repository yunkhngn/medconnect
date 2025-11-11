package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.VideoCallSession;

import java.util.Optional;

public interface VideoCallSessionRepository extends JpaRepository<VideoCallSession, Long> {
    Optional<VideoCallSession> findByAppointment(Appointment appointment);
    void deleteByAppointment(Appointment appointment);
    void deleteByAppointmentId(Long appointmentId);
}

