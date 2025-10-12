package se1961.g1.medconnect.service;

import org.aspectj.lang.annotation.Before;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import se1961.g1.medconnect.enums.Speciality;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.repository.DoctorRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

public class DoctorServiceTest {
    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private DoctorService doctorService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetDoctorFound() throws Exception{
        String uid = "1";

        Doctor doctor = new Doctor();
        doctor.setEmail("email@gmail.com");
        doctor.setSpecialization(Speciality.CARDIOLOGY);
        doctor.setFirebaseUid(uid);

        when(doctorRepository.findByFirebaseUid(uid)).thenReturn(Optional.of(doctor));

        Optional<Doctor> result = doctorService.getDoctor(uid);

        assertTrue(result.isPresent());
        assertEquals("email@gmail.com", result.get().getEmail());
        assertEquals(Speciality.CARDIOLOGY, result.get().getSpecialization());
        assertEquals(uid, result.get().getFirebaseUid());
    }

    @Test
    public void testGetDoctorNotFound() throws Exception{
        String uid = "1";
        when(doctorRepository.findByFirebaseUid(uid)).thenReturn(Optional.empty());

        Optional<Doctor> result = doctorService.getDoctor(uid);

        assertTrue(result.isEmpty());
    }
}
