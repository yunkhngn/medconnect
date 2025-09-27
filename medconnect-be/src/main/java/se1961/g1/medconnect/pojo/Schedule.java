package se1961.g1.medconnect.pojo;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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
    private int scheduleId;

    @Enumerated(EnumType.STRING)
    private ScheduleStatus scheduleStatus;

    @NotNull
    @Column(nullable = false)
    private String date;

    @NotNull
    @Column(nullable = false, length = 20)
    private String slot;

    @ManyToOne
    @JoinColumn(name = "doctorId", nullable = false)
    private Doctor doctor;

    @OneToOne(mappedBy = "schedule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Appointment appointment;
}
