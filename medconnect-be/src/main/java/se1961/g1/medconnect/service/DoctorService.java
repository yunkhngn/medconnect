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
        if (doctor == null || doctor.getAppointments() == null) {
            throw new Exception("Doctor or appointment list not found");
        }

        return doctor.getAppointments()
                .stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    public Doctor saveDoctor(Doctor doctor) throws Exception {
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}
