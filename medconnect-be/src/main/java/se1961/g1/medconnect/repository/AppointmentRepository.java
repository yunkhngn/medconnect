package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se1961.g1.medconnect.enums.AppointmentStatus;
import se1961.g1.medconnect.enums.Slot;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Patient;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByDoctorAndStatus(Doctor doctor, AppointmentStatus status);
    List<Appointment> findByDoctorUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctorAndDateBetween(Doctor doctor, LocalDate startDate, LocalDate endDate);
    List<Appointment> findByDoctorAndDate(Doctor doctor, LocalDate date);
    // Check if patient has appointment in same date and slot (to prevent double booking)
    List<Appointment> findByPatientAndDateAndSlot(Patient patient, LocalDate date, Slot slot);
}
