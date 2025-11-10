package se1961.g1.medconnect.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateAppointmentRequest {
    private Long doctorId;
    private LocalDate date;
    private String slot; // SLOT_1, SLOT_2, SLOT_3, SLOT_4
    private String type; // ONLINE or OFFLINE
    private String reason; // Optional: reason for appointment
}

