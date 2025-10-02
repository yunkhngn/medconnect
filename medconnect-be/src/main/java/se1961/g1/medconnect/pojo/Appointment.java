package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import se1961.g1.medconnect.enums.AppointmentStatus;

@Entity
@Table(name = "Appointment")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    private String status;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private Schedule schedule;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    private VideoCallSession videoCallSession;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    private Payment payment;
}

