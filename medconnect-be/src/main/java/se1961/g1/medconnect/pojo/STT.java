package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.STTStatus;

@Entity
@Table(name = "SpeechToText")
@Getter
@Setter
public class STT {
    @Id
    @OneToOne
    @MapsId
    @JoinColumn(name = "appointmentId", nullable = false)
    private Appointment appointment;

    @Column(nullable = true)
    private String content;

    @Enumerated(EnumType.STRING)
    private STTStatus status;
}
