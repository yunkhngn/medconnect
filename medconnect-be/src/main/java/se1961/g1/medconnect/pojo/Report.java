package se1961.g1.medconnect.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Report")
@Getter
@Setter
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String reason; // Lý do báo xấu

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.PENDING; // PENDING, REVIEWED, RESOLVED, DISMISSED

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    @ManyToOne
    @JoinColumn(name = "patient")
    @JsonIgnore
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor")
    @JsonIgnore
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "appointment")
    @JsonIgnore
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    @JsonIgnore
    private Admin reviewedBy;

    public enum ReportStatus {
        PENDING,
        REVIEWED,
        RESOLVED,
        DISMISSED
    }
}

