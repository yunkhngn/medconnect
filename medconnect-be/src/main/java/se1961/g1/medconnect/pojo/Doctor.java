package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.Speciality;

import java.util.List;

@Entity
@Table(name = "Doctor")
@Getter
@Setter
public class Doctor extends User{
    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Speciality specialization;

    private String licenseId;
    private String phone;

    @OneToMany(mappedBy = "doctor")
    private List<Appointment> appointments;
}

