package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.enums.AppointmentStatus;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.repository.AppointmentRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

//    public List<Appointment> findByDoctor(Doctor doctor) {
//        return appointmentRepository.findByDoctor(doctor);
//    }

    public List<Appointment> findByDoctorAndStatus(Doctor doctor, AppointmentStatus status) {
        return appointmentRepository.findByDoctorAndStatus(doctor, status);
    }

//    public List<Appointment> findByDoctorAndTime(Doctor doctor) {
//        LocalDate date = LocalDate.now();
//        return appointmentRepository.findByDoctorAndTime(doctor, date);
//    }
}
