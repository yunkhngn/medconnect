package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Feedback")
@Getter
@Setter
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    @Column(nullable = true, length = 255)
    private String feedback;

    @Column(nullable = false)
    @Min(1)
    @Max(5)
    private int rating;

    @ManyToOne
    @JoinColumn(name = "patientId", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctorId", nullable = false)
    private Doctor doctor;
}
