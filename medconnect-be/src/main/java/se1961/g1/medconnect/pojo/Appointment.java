package se1961.g1.medconnect.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import se1961.g1.medconnect.enums.AppointmentStatus;
import se1961.g1.medconnect.enums.AppointmentType;
import se1961.g1.medconnect.enums.Slot;

import java.time.LocalDate;

@Entity
@Table(
    name = "Appointment",
    uniqueConstraints = {
        // Prevent a patient from booking multiple doctors in the same date and slot
        @UniqueConstraint(name = "uk_patient_date_slot", columnNames = {"patient_id", "date", "slot"})
    }
)
@Getter
@Setter
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @CreationTimestamp
    private LocalDate createdAt;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private Slot slot;

    @Enumerated(EnumType.STRING)
    private AppointmentType type;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String reason; // Lý do khám bệnh

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonIgnore
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonIgnore
    private Patient patient;

    @OneToOne(mappedBy = "appointment")
    private Payment payment;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    private VideoCallSession videoCallSession;
}

