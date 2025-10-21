package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.enums.AppointmentStatus;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.repository.AppointmentRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

    public Optional<Appointment> getAppointmentById(long id) throws Exception {
        return appointmentRepository.findById(id);
    }

    public AppointmentDTO updateAppointment(Long id, AppointmentDTO updated) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("appointment not found"));

        if(updated.getStatus() != null) {
            try {
                appointment.setStatus(AppointmentStatus.valueOf(updated.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status value: " + updated.getStatus());
            }
        }

        appointmentRepository.save(appointment);

        AppointmentDTO result = new AppointmentDTO();
        result.setStatus(appointment.getStatus().name());
        return result;
    }

    public List<Appointment> findByDoctorUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end) {
        return appointmentRepository.findByDoctorUserIdAndDateBetween(userId, start, end);
    }
}
