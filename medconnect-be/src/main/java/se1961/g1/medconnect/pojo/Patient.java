package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Entity
@Table(name = "Patient")
@Getter
@Setter
public class Patient extends User{
    private String citizenship;
    private String socialInsurance;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Payment> payments;

    @OneToMany(mappedBy = "patient")
    private List<Feedback> feedbacks;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL)
    private MedicalRecord mr;
}
