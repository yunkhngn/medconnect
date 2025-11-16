package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "VideoCallSession")
@Getter
@Setter
public class VideoCallSession {
    @Id
    private Long appointmentId;

    @CreationTimestamp
    @Column(name = "startTime")
    private LocalDateTime startTime;

    @Column(name = "endTime")
    private LocalDateTime endTime;

    @OneToOne
    @MapsId
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
}

