package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import se1961.g1.medconnect.enums.Speciality;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Doctor")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long doctorId;

    private String firstName;
    private String lastName;
    private String specialization;
    private String licenseId;
    private String phone;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}

