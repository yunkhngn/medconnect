package se1961.g1.medconnect.pojo;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ChatBot")
@Getter
@Setter
public class ChatBot {
    @Id
    @ManyToOne
    @MapsId
    @JoinColumn(name = "patientId", nullable = false)
    private Patient patient;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, updatable = false)
    private String prompt;

    @Column(nullable = false, updatable = false)
    private String result;
}
