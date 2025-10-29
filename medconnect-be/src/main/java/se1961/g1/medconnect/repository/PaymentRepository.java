package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se1961.g1.medconnect.enums.PaymentStatus;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Payment;
import se1961.g1.medconnect.pojo.Patient;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByAppointment(Appointment appointment);
    Optional<Payment> findByAppointmentAppointmentId(Long appoimentId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByPatient(Patient patient);
    List<Payment> findByPatientAndStatus(Patient patient, PaymentStatus status);
    List<Payment> findByStatus(PaymentStatus status);
}

