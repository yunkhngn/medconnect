package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import se1961.g1.medconnect.enums.Speciality;

@Entity
@Table(name = "Doctor")
public class Doctor {
    @Id
    private Long doctorId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "userId")
    private User user;

    @Column(nullable = false)
    @Size(min = 2, max = 50)
    private String firstName;

    @Column(nullable = false)
    @Size(min = 2, max = 50)
    private String lastName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Speciality specialty;

    @Column(nullable = false)
    private String licenseId;

    @Column(nullable = false)
    private String phone;
}
