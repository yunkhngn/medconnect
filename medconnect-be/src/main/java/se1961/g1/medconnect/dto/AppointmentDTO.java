package se1961.g1.medconnect.dto;

import lombok.*;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Patient;

import java.time.format.DateTimeFormatter;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {
    private String id;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String date;
    private String time;
    private String type;
    private String status;
    private String createdAt;

    public AppointmentDTO(Appointment app) {
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        this.id = "APT" + String.format("%03d", app.getAppointmentId());

        Patient patient = app.getPatient();
        if (patient != null) {
            this.patientName = patient.getName();
            this.patientEmail = patient.getEmail();
            this.patientPhone = patient.getPhone();
        }

        if (app.getDate() != null) {
            this.date = app.getDate().format(dateFmt);
        }

        if (app.getSlot() != null) {
            this.time = app.getSlot().getStart().format(timeFmt) + " - " +
                    app.getSlot().getEnd().format(timeFmt);
        }

        this.type = app.getType() != null ? app.getType().name() : null;
        this.status = app.getStatus() != null ? app.getStatus().name() : null;

        if (app.getCreatedAt() != null) {
            this.createdAt = app.getCreatedAt().format(dateFmt);
        }
    }
}

