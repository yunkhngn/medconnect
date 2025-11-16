package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import se1961.g1.medconnect.enums.PaymentStatus;
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
    
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private Double amount;
    
    // Payment gateway fields
    private String transactionId; // ID from payment gateway (SePay, VNPay, etc.)
    private String paymentMethod; // CARD, BANK_TRANSFER, WALLET, QR_CODE
    private String gatewayName; // SEPAY, VNPAY, MOMO, etc.
    
    @Column(length = 1000)
    private String gatewayResponse; // Raw response from gateway for debugging
    
    @Column(length = 500)
    private String description; // Payment description

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
}

