package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.dto.AppointmentDTO;
import se1961.g1.medconnect.dto.ScheduleDTO;
import se1961.g1.medconnect.enums.ScheduleStatus;
import se1961.g1.medconnect.enums.Slot;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Schedule;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.ScheduleRepository;
import se1961.g1.medconnect.repository.DoctorRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Get weekly schedule with appointments merged in
     */
    public List<ScheduleDTO> getWeeklySchedule(Long userId, LocalDate start, LocalDate end) throws Exception {
        System.out.println("[getWeeklySchedule] ========== START ==========");
        System.out.println("[getWeeklySchedule] Doctor UserID: " + userId);
        System.out.println("[getWeeklySchedule] Date range: " + start + " to " + end);
        
        // 1. Validate user exists
        if (!userService.findById(userId).isPresent()) {
            throw new Exception("User not found");
        }

        // 2. Get doctor's schedules (slots doctor has opened)
        List<Schedule> scheduleList = scheduleRepository.findByUserUserIdAndDateBetween(userId, start, end);
        System.out.println("[getWeeklySchedule] Found " + scheduleList.size() + " schedules (opened slots)");
        
        // 3. Get doctor's appointments
        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() -> new Exception("Doctor not found"));
        List<Appointment> appointmentList = appointmentService.findByDoctorAndDateBetween(doctor, start, end);
        System.out.println("[getWeeklySchedule] Found " + appointmentList.size() + " appointments");
        
        if (!appointmentList.isEmpty()) {
            System.out.println("[getWeeklySchedule] Appointment details:");
            appointmentList.forEach(a -> {
                System.out.println("  - ID: " + a.getAppointmentId() + 
                                 ", Date: " + a.getDate() + 
                                 ", Slot: " + a.getSlot() + 
                                 ", Status: " + a.getStatus() +
                                 ", Patient: " + (a.getPatient() != null ? a.getPatient().getName() : "null"));
            });
        }
        
        // 4. Generate full week grid (7 days x 12 slots)
        List<LocalDate> dates = start.datesUntil(end.plusDays(1)).toList();
        List<Slot> slots = Arrays.asList(Slot.values());
        List<ScheduleDTO> fullWeek = new ArrayList<>();
        
        System.out.println("[getWeeklySchedule] Generating grid for " + dates.size() + " days x " + slots.size() + " slots");
        
        for (LocalDate date : dates) {
            for (Slot slot : slots) {
                // Check if doctor has opened this slot
                Schedule schedule = scheduleList.stream()
                        .filter(s -> s.getDate().equals(date) && s.getSlot() == slot)
                        .findFirst()
                        .orElse(null);
                
                ScheduleDTO scheduleDTO;
                
                if (schedule != null) {
                    // Doctor has opened this slot
                    scheduleDTO = new ScheduleDTO(schedule);
                } else {
                    // Doctor has NOT opened this slot (empty)
                    scheduleDTO = new ScheduleDTO();
                    scheduleDTO.setDate(date);
                    scheduleDTO.setSlot(slot);
                    scheduleDTO.setStatus(ScheduleStatus.EMPTY);
                }
                
                // Check if there's an appointment for this slot
                Appointment appointment = appointmentList.stream()
                        .filter(a -> a.getDate().equals(date) && a.getSlot() == slot)
                        .filter(a -> {
                            // Only consider active appointments
                            String status = a.getStatus().name();
                            return !status.equals("CANCELLED") && !status.equals("DENIED");
                        })
                        .findFirst()
                        .orElse(null);
                
                if (appointment != null) {
                    // There's an appointment -> mark as BUSY
                    scheduleDTO.setStatus(ScheduleStatus.BUSY);
                    scheduleDTO.setAppointment(new AppointmentDTO(appointment));
                    System.out.println("  [BUSY] " + date + " " + slot + " -> Appointment #" + appointment.getAppointmentId());
                }
                
                fullWeek.add(scheduleDTO);
            }
        }
        
        System.out.println("[getWeeklySchedule] Total slots in grid: " + fullWeek.size());
        System.out.println("[getWeeklySchedule] ========== END ==========");
        
        return fullWeek;
    }

    /**
     * Update schedule status
     */
    public ScheduleDTO updateSchedule(Long scheduleId, ScheduleStatus status) throws Exception {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new Exception("Schedule not found"));
        
        if(status == ScheduleStatus.EMPTY) {
            // Delete schedule (doctor closes this slot)
            scheduleRepository.delete(schedule);
            return null;
        }

        schedule.setStatus(status);
        scheduleRepository.save(schedule);
        return new ScheduleDTO(schedule);
    }

    /**
     * Add new schedule (doctor opens a slot)
     */
    public ScheduleDTO addSchedule(ScheduleDTO dto, Long userId) throws Exception {
        System.out.println("[addSchedule] ========== START ==========");
        System.out.println("[addSchedule] Doctor UserID: " + userId);
        System.out.println("[addSchedule] Date: " + dto.getDate());
        System.out.println("[addSchedule] Slot: " + dto.getSlot());
        System.out.println("[addSchedule] Status: " + dto.getStatus());
        
        User user = userService.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Validate: không cho phép đặt lịch cho ngày đã qua
        if (dto.getDate().isBefore(LocalDate.now())) {
            System.out.println("[addSchedule] ❌ Cannot schedule for past date");
            throw new Exception("Không thể đặt lịch cho ngày đã qua");
        }

        // Check if schedule already exists
        if (scheduleRepository.findByUserUserIdAndDateAndSlot(userId, dto.getDate(), dto.getSlot()).isPresent()) {
            System.out.println("[addSchedule] ❌ Schedule already exists");
            throw new Exception("Schedule already exists");
        }

        // Create new schedule
        Schedule schedule = new Schedule();
        schedule.setDate(dto.getDate());
        schedule.setSlot(dto.getSlot());
        schedule.setStatus(dto.getStatus());
        schedule.setUser(user);
        
        scheduleRepository.save(schedule);
        
        System.out.println("[addSchedule] ✅ Schedule created with ID: " + schedule.getScheduleId());
        System.out.println("[addSchedule] ========== END ==========");

        return new ScheduleDTO(schedule);
    }
}
