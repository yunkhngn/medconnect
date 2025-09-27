package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import se1961.g1.medconnect.enums.AppointmentStatus;

@Entity
@Table(name = "Appointment")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int appointmentId;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus appointmentStatus;

    @ManyToOne
    @JoinColumn(name = "patientId", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctorId", nullable = false)
    private Doctor doctor;

    @OneToOne
    @JoinColumn(name = "scheduleId", nullable = false)
    private Schedule schedule;
}
