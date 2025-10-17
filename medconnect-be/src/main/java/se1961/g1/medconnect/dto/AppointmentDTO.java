package se1961.g1.medconnect.dto;

import lombok.*;

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
}
