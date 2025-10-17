package se1961.g1.medconnect.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import se1961.g1.medconnect.enums.Speciality;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.service.DoctorService;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class DoctorDashBoardTest {
    @Mock
    private DoctorService doctorService;

    @InjectMocks
    private DoctorDashboard doctorDashboard;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetProfileDoctorFound() throws Exception {
        String uid = "doctor123";

        Doctor doctor = new Doctor();
        doctor.setFirebaseUid(uid);
        doctor.setName("Stephen Strange");
        doctor.setEmail("dr.strange@example.com");
        doctor.setPhone("123456789");
        doctor.setSpecialization(Speciality.CARDIOLOGY);
        doctor.setLicenseId("LIC12345");

        // Mock the service to return the doctor
        when(doctorService.getDoctor(uid)).thenReturn(Optional.of(doctor));

        // Mock Authentication object
        var authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(uid, null);

        ResponseEntity<Map<String, Object>> response = doctorDashboard.getProfile(authentication);

        assertEquals(200, response.getStatusCodeValue());
        Map<String, Object> profile = response.getBody();
        assertNotNull(profile);
        assertEquals("Stephen Strange", profile.get("name"));
        assertEquals("dr.strange@example.com", profile.get("email"));
        assertEquals("123456789", profile.get("phone"));
        assertEquals(Speciality.CARDIOLOGY, profile.get("specialization"));
        assertEquals("LIC12345", profile.get("license_id"));
    }

    @Test
    public void testGetProfileDoctorNotFound() throws Exception {
        String uid = "doctor123";

        when(doctorService.getDoctor(uid)).thenReturn(Optional.empty());

        var authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(uid, null);

        Exception exception = assertThrows(Exception.class, () -> doctorDashboard.getProfile(authentication));
        assertEquals("Doctor not found", exception.getMessage());
    }
}
