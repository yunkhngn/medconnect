package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.ScheduleDTO;
import se1961.g1.medconnect.enums.ScheduleStatus;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.repository.DoctorRepository;
import se1961.g1.medconnect.service.ScheduleService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {
    
    @Autowired
    private ScheduleService scheduleService;
    
    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Get weekly schedule for current doctor
     */
    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklySchedule(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            Doctor doctor = doctorRepository.findByFirebaseUid(firebaseUid)
                    .orElseThrow(() -> new Exception("Doctor not found"));
            
            List<ScheduleDTO> schedule = scheduleService.getWeeklySchedule(
                doctor.getUserId(), 
                startDate, 
                endDate
            );
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add new schedule slot
     */
    @PostMapping
    public ResponseEntity<?> addSchedule(
            Authentication authentication,
            @RequestBody ScheduleDTO scheduleDTO
    ) {
        try {
            System.out.println("[ADD SCHEDULE] ========== START ==========");
            System.out.println("[ADD SCHEDULE] Received ScheduleDTO:");
            System.out.println("[ADD SCHEDULE] - Date: " + scheduleDTO.getDate());
            System.out.println("[ADD SCHEDULE] - Slot: " + scheduleDTO.getSlot());
            System.out.println("[ADD SCHEDULE] - Status: " + scheduleDTO.getStatus());
            
            String firebaseUid = (String) authentication.getPrincipal();
            Doctor doctor = doctorRepository.findByFirebaseUid(firebaseUid)
                    .orElseThrow(() -> new Exception("Doctor not found"));
            
            System.out.println("[ADD SCHEDULE] Doctor ID: " + doctor.getUserId());
            
            ScheduleDTO created = scheduleService.addSchedule(scheduleDTO, doctor.getUserId());
            System.out.println("[ADD SCHEDULE] Created successfully: " + created.getId());
            System.out.println("[ADD SCHEDULE] ========== END ==========");
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            System.err.println("[ADD SCHEDULE] IllegalArgumentException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid slot or status: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("[ADD SCHEDULE] Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update schedule status
     */
    @PatchMapping("/{scheduleId}")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody Map<String, String> body
    ) {
        try {
            String statusStr = body.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            ScheduleStatus status = ScheduleStatus.valueOf(statusStr.toUpperCase());
            ScheduleDTO updated = scheduleService.updateSchedule(scheduleId, status);
            
            if (updated == null) {
                return ResponseEntity.ok(Map.of("message", "Schedule deleted"));
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete schedule (set to EMPTY)
     */
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long scheduleId) {
        try {
            scheduleService.updateSchedule(scheduleId, ScheduleStatus.EMPTY);
            return ResponseEntity.ok(Map.of("message", "Schedule deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

