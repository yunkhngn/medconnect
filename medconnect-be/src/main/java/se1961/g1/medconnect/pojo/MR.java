package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import se1961.g1.medconnect.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Prescription")
@Getter
@Setter
public class MR {
    @Id
    @OneToOne
    @MapsId
    @JoinColumn(name = "appointmentId", nullable = false)
    private Appointment appointment;

    @Column(columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String content;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
