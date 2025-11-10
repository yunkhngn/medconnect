package se1961.g1.medconnect.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Feedback")
@Getter
@Setter
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    private String comment;

    @Column(nullable = false)
    private int rating;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "patient")
    @JsonIgnore
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor")
    @JsonIgnore
    private Doctor doctor;
}

