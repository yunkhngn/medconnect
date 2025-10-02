package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "Patient")
@Getter
@Setter
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;

    private String firstName;
    private String lastName;
    private String phone;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Payment> payments;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Feedback> feedback;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL)
    private MR mr;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Notification> notification;
}
