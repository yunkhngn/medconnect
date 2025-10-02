package se1961.g1.medconnect.pojo;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.ScheduleStatus;

@Entity
@Table(name = "Schedule", uniqueConstraints = {@UniqueConstraint(
        columnNames = {"user_id", "date", "slot"})})
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
    @JoinColumn(name = "user_id")
    private User user;
}

