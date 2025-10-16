package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.DoctorStatus;
import se1961.g1.medconnect.enums.Speciality;

import java.util.List;

@Entity
@Table(name = "Doctor")
@Getter
@Setter
public class Doctor extends User{

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Speciality specialization;

    @Column(unique = true, nullable = false)
    private String licenseId;

    @Column(nullable = false)
    private String licenseUrl;

    @Enumerated(EnumType.STRING)
    private DoctorStatus status;

    @OneToMany(mappedBy = "doctor")
    private List<Appointment> appointments;

    public Doctor() {}
}

