package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import se1961.g1.medconnect.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Payment")
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private Double amount;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
}

