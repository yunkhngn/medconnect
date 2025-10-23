package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "Patient")
@Getter
@Setter
public class Patient extends User {

    @Column(unique = true)
    private String citizenship;

    @Column(unique = true)
    private String socialInsurance;

    @Temporal(TemporalType.DATE)
    private Date dateOfBirth;

    private String gender;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bloodType;
    private String allergies;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Payment> payments;

    @OneToMany(mappedBy = "patient")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Feedback> feedbacks;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private MR mr;
}
