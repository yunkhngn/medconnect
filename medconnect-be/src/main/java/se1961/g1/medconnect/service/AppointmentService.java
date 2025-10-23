package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.dto.CreateAppointmentRequest;
import se1961.g1.medconnect.enums.AppointmentStatus;
import se1961.g1.medconnect.enums.AppointmentType;
import se1961.g1.medconnect.enums.Slot;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.pojo.Schedule;
import se1961.g1.medconnect.repository.AppointmentRepository;
import se1961.g1.medconnect.repository.DoctorRepository;
import se1961.g1.medconnect.repository.PatientRepository;
import se1961.g1.medconnect.repository.ScheduleRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private ScheduleRepository scheduleRepository;

    public Optional<Appointment> getAppointmentById(long id) throws Exception {
        return appointmentRepository.findById(id);
    }
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
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
    
    public AppointmentDTO updateAppointmentStatus(Long id, String status) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));

        try {
            appointment.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status);
        }

        appointmentRepository.save(appointment);

        AppointmentDTO result = new AppointmentDTO();
        result.setStatus(appointment.getStatus().name());
        return result;
    }

    public List<Appointment> findByDoctorUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end) {
        return appointmentRepository.findByDoctorUserIdAndDateBetween(userId, start, end);
    }
    
    public List<Appointment> getAppointmentsByPatientFirebaseUid(String firebaseUid) throws Exception {
        Patient patient = patientRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new Exception("Patient not found"));
        return appointmentRepository.findByPatient(patient);
    }
    
    public List<Appointment> getAppointmentsByDoctorFirebaseUid(String firebaseUid, LocalDate startDate, LocalDate endDate) throws Exception {
        Doctor doctor = doctorRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new Exception("Doctor not found"));
        return appointmentRepository.findByDoctorAndDateBetween(doctor, startDate, endDate);
    }
    
    public List<String> getAvailableSlots(Long doctorId, LocalDate date) throws Exception {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new Exception("Doctor not found"));
        
        // Get doctor's schedule for the date
        List<Schedule> schedules = scheduleRepository.findByUserAndDate(doctor, date);
        
        if (schedules.isEmpty()) {
            return new ArrayList<>(); // Doctor not available on this date
        }
        
        // Get available slots from schedule
        List<String> availableSlots = schedules.stream()
                .map(s -> s.getSlot().name())
                .collect(Collectors.toList());
        
        // Get booked appointments for the date
        List<Appointment> bookedAppointments = appointmentRepository.findByDoctorAndDate(doctor, date);
        List<String> bookedSlots = bookedAppointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED && a.getStatus() != AppointmentStatus.DENIED)
                .map(a -> a.getSlot().name())
                .collect(Collectors.toList());
        
        // Remove booked slots from available slots
        availableSlots.removeAll(bookedSlots);
        
        return availableSlots;
    }
    
    public Appointment createAppointment(String firebaseUid, CreateAppointmentRequest request) throws Exception {
        // Validate patient
        Patient patient = patientRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new Exception("Patient not found"));
        
        // Validate doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new Exception("Doctor not found"));
        
        // Validate slot
        Slot slot;
        try {
            slot = Slot.valueOf(request.getSlot().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new Exception("Invalid slot: " + request.getSlot());
        }
        
        // Check if slot is available
        List<String> availableSlots = getAvailableSlots(request.getDoctorId(), request.getDate());
        if (!availableSlots.contains(slot.name())) {
            throw new Exception("Slot is not available");
        }
        
        // Validate type
        AppointmentType type;
        try {
            type = AppointmentType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new Exception("Invalid appointment type: " + request.getType());
        }
        
        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDate(request.getDate());
        appointment.setSlot(slot);
        appointment.setType(type);
        appointment.setStatus(AppointmentStatus.PENDING); // Default status
        
        return appointmentRepository.save(appointment);
    }
    
    public void cancelAppointment(Long id) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }
    
    public void deleteAppointment(Long id) throws Exception {
        if (!appointmentRepository.existsById(id)) {
            throw new Exception("Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }
    
    public Appointment confirmAppointment(Long id) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new Exception("Only pending appointments can be confirmed");
        }
        
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return appointmentRepository.save(appointment);
    }
    
    public Appointment denyAppointment(Long id) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new Exception("Only pending appointments can be denied");
        }
        
        appointment.setStatus(AppointmentStatus.DENIED);
        return appointmentRepository.save(appointment);
    }
    
    public Appointment startAppointment(Long id) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new Exception("Only confirmed appointments can be started");
        }
        
        appointment.setStatus(AppointmentStatus.ONGOING);
        return appointmentRepository.save(appointment);
    }
    
    public Appointment finishAppointment(Long id) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.ONGOING) {
            throw new Exception("Only ongoing appointments can be finished");
        }
        
        appointment.setStatus(AppointmentStatus.FINISHED);
        return appointmentRepository.save(appointment);
    }
}
