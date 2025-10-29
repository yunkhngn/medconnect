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

    // ============================================
    // GET APPOINTMENTS
    // ============================================
    
    public Optional<Appointment> getAppointmentById(long id) {
        return appointmentRepository.findById(id);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsByPatientFirebaseUid(String firebaseUid) throws Exception {
        Patient patient = patientRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new Exception("Patient not found"));
        return appointmentRepository.findByPatient(patient);
    }
    
    public List<Appointment> getAppointmentsByDoctorFirebaseUid(String firebaseUid, LocalDate startDate, LocalDate endDate) throws Exception {
        System.out.println("[getAppointmentsByDoctorFirebaseUid] ========== START ==========");
        System.out.println("[getAppointmentsByDoctorFirebaseUid] Firebase UID: " + firebaseUid);
        System.out.println("[getAppointmentsByDoctorFirebaseUid] Date range: " + startDate + " to " + endDate);
        
        Doctor doctor = doctorRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new Exception("Doctor not found"));
        
        System.out.println("[getAppointmentsByDoctorFirebaseUid] Doctor found: " + doctor.getName() + " (UserID: " + doctor.getUserId() + ")");
        
        List<Appointment> appointments = appointmentRepository.findByDoctorAndDateBetween(doctor, startDate, endDate);
        
        System.out.println("[getAppointmentsByDoctorFirebaseUid] Found " + appointments.size() + " appointments");
        System.out.println("[getAppointmentsByDoctorFirebaseUid] ========== END ==========");
        
        return appointments;
    }
    
    public List<Appointment> findByDoctorUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end) {
        System.out.println("[findByDoctorUserIdAndDateBetween] Called with userId: " + userId + ", start: " + start + ", end: " + end);
        List<Appointment> result = appointmentRepository.findByDoctorUserIdAndDateBetween(userId, start, end);
        System.out.println("[findByDoctorUserIdAndDateBetween] Found " + result.size() + " appointments");
        
        if (!result.isEmpty()) {
            System.out.println("[findByDoctorUserIdAndDateBetween] Appointment details:");
            result.forEach(a -> {
                System.out.println("  - ID: " + a.getAppointmentId() + 
                                 ", Date: " + a.getDate() + 
                                 ", Slot: " + a.getSlot() + 
                                 ", Status: " + a.getStatus() +
                                 ", Doctor: " + (a.getDoctor() != null ? a.getDoctor().getName() : "null") +
                                 ", Doctor UserID: " + (a.getDoctor() != null ? a.getDoctor().getUserId() : "null"));
            });
        }
        
        return result;
    }

    public List<Appointment> findByDoctorAndDateBetween(Doctor doctor, LocalDate start, LocalDate end) {
        System.out.println("[findByDoctorAndDateBetween] Doctor UserID: " + (doctor != null ? doctor.getUserId() : null)
                + ", start: " + start + ", end: " + end);
        List<Appointment> result = appointmentRepository.findByDoctorAndDateBetween(doctor, start, end);
        System.out.println("[findByDoctorAndDateBetween] Found " + result.size() + " appointments");
        return result;
    }

    // ============================================
    // GET AVAILABLE SLOTS FOR BOOKING
    // ============================================
    
    public List<String> getAvailableSlots(Long doctorId, LocalDate date) throws Exception {
        System.out.println("[getAvailableSlots] ========== START ==========");
        System.out.println("[getAvailableSlots] Doctor ID: " + doctorId);
        System.out.println("[getAvailableSlots] Date: " + date);
        
        // 1. Get doctor
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new Exception("Doctor not found"));
        System.out.println("[getAvailableSlots] Doctor: " + doctor.getName());
        
        // 2. Get doctor's schedules for this date (slots doctor has opened)
        List<Schedule> schedules = scheduleRepository.findByUserAndDate(doctor, date);
        System.out.println("[getAvailableSlots] Doctor has opened " + schedules.size() + " slots for this date");
        
        if (schedules.isEmpty()) {
            System.out.println("[getAvailableSlots] No schedules - returning empty");
            return new ArrayList<>();
        }
        
        // 3. Get all slot names from schedules
        List<String> openSlots = schedules.stream()
                .map(s -> s.getSlot().name())
                .collect(Collectors.toList());
        System.out.println("[getAvailableSlots] Open slots: " + openSlots);
        
        // 4. Get already booked appointments for this doctor on this date
        List<Appointment> appointments = appointmentRepository.findByDoctorAndDate(doctor, date);
        System.out.println("[getAvailableSlots] Found " + appointments.size() + " appointments for this date");
        
        // 5. Get booked slot names (excluding cancelled/denied)
        List<String> bookedSlots = appointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED && a.getStatus() != AppointmentStatus.DENIED)
                .map(a -> a.getSlot().name())
                .collect(Collectors.toList());
        System.out.println("[getAvailableSlots] Booked slots: " + bookedSlots);
        
        // 6. Available = Open - Booked
        openSlots.removeAll(bookedSlots);
        System.out.println("[getAvailableSlots] Final available slots: " + openSlots);
        System.out.println("[getAvailableSlots] ========== END ==========");
        
        return openSlots;
    }

    // ============================================
    // CREATE APPOINTMENT (PATIENT BOOKING)
    // ============================================
    
    public Appointment createAppointment(String patientFirebaseUid, CreateAppointmentRequest request) throws Exception {
        System.out.println("[createAppointment] ========== START ==========");
        System.out.println("[createAppointment] Patient Firebase UID: " + patientFirebaseUid);
        System.out.println("[createAppointment] Doctor ID: " + request.getDoctorId());
        System.out.println("[createAppointment] Date: " + request.getDate());
        System.out.println("[createAppointment] Slot: " + request.getSlot());
        System.out.println("[createAppointment] Type: " + request.getType());
        System.out.println("[createAppointment] Reason: " + request.getReason());
        
        // 1. Validate patient
        Patient patient = patientRepository.findByFirebaseUid(patientFirebaseUid)
                .orElseThrow(() -> new Exception("Patient not found"));
        System.out.println("[createAppointment] Patient: " + patient.getName() + " (ID: " + patient.getUserId() + ")");
        
        // 2. Validate doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new Exception("Doctor not found"));
        System.out.println("[createAppointment] Doctor: " + doctor.getName() + " (UserID: " + doctor.getUserId() + ")");
        
        // 3. Parse slot
        Slot slot;
        try {
            slot = Slot.valueOf(request.getSlot().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new Exception("Invalid slot: " + request.getSlot());
        }
        System.out.println("[createAppointment] Slot parsed: " + slot);
        
        // 4. Parse type
        AppointmentType type;
        try {
            type = AppointmentType.valueOf(request.getType().toUpperCase());
            } catch (IllegalArgumentException e) {
            throw new Exception("Invalid type: " + request.getType());
        }
        System.out.println("[createAppointment] Type parsed: " + type);
        
        // 5. Check if slot is available
        List<String> availableSlots = getAvailableSlots(request.getDoctorId(), request.getDate());
        if (!availableSlots.contains(slot.name())) {
            System.out.println("[createAppointment] ❌ Slot not available!");
            throw new Exception("Slot is not available");
        }
        System.out.println("[createAppointment] ✅ Slot is available");
        
        // 6. Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDate(request.getDate());
        appointment.setSlot(slot);
        appointment.setType(type);
        appointment.setReason(request.getReason());
        appointment.setStatus(AppointmentStatus.PENDING);
        
        System.out.println("[createAppointment] Doctor set in appointment: " + appointment.getDoctor().getName());
        System.out.println("[createAppointment] Doctor user_id in appointment: " + appointment.getDoctor().getUserId());
        
        // 7. Save
        Appointment saved = appointmentRepository.save(appointment);
        
        System.out.println("[createAppointment] ✅ Appointment created!");
        System.out.println("[createAppointment] Appointment ID: " + saved.getAppointmentId());
        System.out.println("[createAppointment] Status: " + saved.getStatus());
        System.out.println("[createAppointment] ========== END ==========");
        
        return saved;
    }

    // ============================================
    // UPDATE APPOINTMENT STATUS
    // ============================================
    
    public Appointment updateAppointment(Long id, AppointmentStatus status) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
    
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO dto) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));

        if (dto.getStatus() != null) {
            try {
                appointment.setStatus(AppointmentStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new Exception("Invalid status: " + dto.getStatus());
            }
        }
        
        Appointment saved = appointmentRepository.save(appointment);
        return new AppointmentDTO(saved);
    }
    
    public AppointmentDTO updateAppointmentStatus(Long id, String statusStr) throws Exception {
        AppointmentStatus status;
        try {
            status = AppointmentStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new Exception("Invalid status: " + statusStr);
        }
        Appointment updated = updateAppointment(id, status);
        return new AppointmentDTO(updated);
    }
    
    public void cancelAppointment(Long id) throws Exception {
        Appointment appointment = getAppointmentById(id)
                .orElseThrow(() -> new Exception("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
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
    
    public void deleteAppointment(Long id) throws Exception {
        if (!appointmentRepository.existsById(id)) {
            throw new Exception("Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }
}
