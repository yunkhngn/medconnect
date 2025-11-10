package se1961.g1.medconnect.pojo;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.ScheduleStatus;
import se1961.g1.medconnect.enums.Slot;

import java.time.LocalDate;
import java.time.LocalTime;

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
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private Slot slot;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}

