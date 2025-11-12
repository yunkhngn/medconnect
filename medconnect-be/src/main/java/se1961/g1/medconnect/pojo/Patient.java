package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.PatientStatus;
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
    private Date insuranceValidTo;

    @Temporal(TemporalType.DATE)
    private Date dateOfBirth;

    private String gender;
    
    @Column(columnDefinition = "NVARCHAR(500)")
    private String address; // Keep old address field for backward compatibility
    
    // Structured address fields (for calculating distance)
    @Column(name = "province_code")
    private Integer provinceCode;
    
    @Column(name = "province_name", columnDefinition = "NVARCHAR(100)")
    private String provinceName;
    
    @Column(name = "district_code")
    private Integer districtCode;
    
    @Column(name = "ward_code")
    private Integer wardCode;
    
    @Column(name = "ward_name", columnDefinition = "NVARCHAR(100)")
    private String wardName;
    
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    private String bloodType;
    private String allergies;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PatientStatus status = PatientStatus.ACTIVE; // Default to ACTIVE

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
