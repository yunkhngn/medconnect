package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.repository.DoctorRepository;

import java.util.Optional;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;

    public Optional<Doctor> findById(Long userId) {
        return doctorRepository.findById(userId);
    }
}
