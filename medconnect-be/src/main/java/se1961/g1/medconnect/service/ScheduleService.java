package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.dto.ScheduleDTO;
import se1961.g1.medconnect.enums.ScheduleStatus;
import se1961.g1.medconnect.enums.Slot;
import se1961.g1.medconnect.pojo.Schedule;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.ScheduleRepository;

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

    public List<ScheduleDTO> getWeeklySchedule(Long userId, LocalDate start, LocalDate end) throws Exception {
        if (!userService.findById(userId).isPresent()) {
            throw new Exception("User not found");
        }

        List<Schedule> scheduleList = scheduleRepository.findByUserUserIdAndDateBetween(userId, start, end);
        List<LocalDate> dates = start.datesUntil(end.plusDays(1)).toList();
        List<Slot> slots = Arrays.asList(Slot.values());

        List<ScheduleDTO> fullWeek = new ArrayList<>();
        for (LocalDate date : dates) {
            for (Slot slot : slots) {
                ScheduleDTO scheduleDTO = scheduleList.stream()
                        .filter(s -> s.getDate().equals(date) && s.getSlot() == slot)
                        .findFirst()
                        .map(ScheduleDTO::new)
                        .orElseGet(() -> {
                            ScheduleDTO empty = new ScheduleDTO();
                            empty.setDate(date);
                            empty.setSlot(slot);
                            empty.setStatus(ScheduleStatus.EMPTY);
                            return empty;
                        });
                fullWeek.add(scheduleDTO);
            }
        }
        return fullWeek;
    }

    public ScheduleDTO updateSchedule(Long scheduleId, ScheduleStatus status) throws Exception {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new Exception("Schedule not found"));
        schedule.setStatus(status);
        scheduleRepository.save(schedule);
        return new ScheduleDTO(schedule);
    }

    public ScheduleDTO addSchedule(ScheduleDTO dto, Long userId) throws Exception {
        User user = userService.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (scheduleRepository.findByUserUserIdAndDateAndSlot(userId, dto.getDate(), dto.getSlot()).isPresent()) {
            throw new Exception("Schedule already exists");
        }

        Schedule schedule = new Schedule();
        schedule.setDate(dto.getDate());
        schedule.setSlot(dto.getSlot());
        schedule.setStatus(dto.getStatus());
        schedule.setUser(user);
        scheduleRepository.save(schedule);

        return new ScheduleDTO(schedule);
    }
}
