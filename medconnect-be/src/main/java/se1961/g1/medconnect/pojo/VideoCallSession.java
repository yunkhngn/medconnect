package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;

@Entity
@Table(name = "VideoCallSession")
public class VideoCallSession {
    @Id
    private Long appointmentId;

    private String connectionStatus;
    private String startTime;
    private String endTime;

    @OneToOne
    @MapsId
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
}

