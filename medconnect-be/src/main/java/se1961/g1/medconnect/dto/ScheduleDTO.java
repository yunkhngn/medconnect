package se1961.g1.medconnect.dto;

import lombok.Data;
import se1961.g1.medconnect.enums.ScheduleStatus;
import se1961.g1.medconnect.enums.Slot;
import se1961.g1.medconnect.pojo.Schedule;

import java.time.LocalDate;

@Data
public class ScheduleDTO {
    private Long id;
    private LocalDate date;
    private Slot slot;
    private ScheduleStatus status;
    private AppointmentDTO appointment;

    public ScheduleDTO() {}

    public ScheduleDTO(Schedule s) {
        this.id = s.getScheduleId();
        this.date = s.getDate();
        this.slot = s.getSlot();
        this.status = s.getStatus();
    }
}
