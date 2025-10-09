package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.service.DoctorService;

import java.util.List;

@RestController
@RequestMapping("/doctor/dashboard")
public class Doctor {
    @Autowired
    private DoctorService doctorService;

    @GetMapping("/")
    @GetMapping("/dashboard/appointments")
    @GetMapping("/dashboard/schedule")
    public List<Appointment> getAllAppointments() {

    }
    @GetMapping("/dashboard/me")
}
