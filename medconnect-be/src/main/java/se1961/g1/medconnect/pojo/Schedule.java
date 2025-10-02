package se1961.g1.medconnect.pojo;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.ScheduleStatus;

@Entity
@Table(name = "Schedule", uniqueConstraints = {@UniqueConstraint(
        columnNames = {"doctorId", "date", "slot"})})
@Getter
@Setter
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleId;

    @Enumerated(EnumType.STRING)
    private ScheduleStatus status;
    private String date;
    private String slot;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}

