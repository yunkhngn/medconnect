package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.repository.DoctorRepository;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;

    public Optional<Doctor> getDoctor(String uid) throws Exception {
        return doctorRepository.findByFirebaseUid(uid);
    }

    public List<AppointmentDTO> getAppointments(Doctor doctor) throws Exception {
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        return doctor.getAppointments().stream()
                .map(app -> {
                    Patient patient = app.getPatient();
                    AppointmentDTO dto = new AppointmentDTO();
                    dto.setId("APT" + String.format("%03d", app.getAppointmentId()));
                    dto.setPatientName(patient.getName());
                    dto.setPatientEmail(patient.getEmail());
                    dto.setPatientPhone(patient.getPhone());
                    dto.setDate(app.getDate().format(dateFmt));
                    dto.setTime(app.getDate().format(timeFmt));
                    dto.setType(app.getType().name());
                    dto.setStatus(app.getStatus().name());
                    dto.setCreatedAt(app.getCreatedAt().format(dateFmt));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public Doctor saveDoctor(Doctor doctor) throws Exception {
        return doctorRepository.save(doctor);
    }
}
