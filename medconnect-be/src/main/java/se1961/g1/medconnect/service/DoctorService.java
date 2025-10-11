package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.DoctorRepository;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private FirebaseService firebaseService;

    public Optional<Doctor> getDoctor(String uid) throws Exception {
        Optional<User> userOpt = userService.getUser(uid);
        if(userOpt.isPresent()) {
            User user = userOpt.get();
            if(user instanceof Doctor doctor) {
                return Optional.of(doctor);
            }
        }
        throw new Exception("Doctor Not Found");
    }

    public List<Appointment> getAppointments() throws Exception {
        return getAppointments();
    }

    public Doctor saveDoctor(Doctor doctor) throws Exception {
        return doctorRepository.save(doctor);
    }
}
