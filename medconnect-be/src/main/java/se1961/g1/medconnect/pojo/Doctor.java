package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.DoctorStatus;

import java.util.List;

@Entity
@Table(name = "Doctor")
@Getter
@Setter
public class Doctor extends User{
    
    // Changed from Enum to Entity relationship
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "speciality_id", referencedColumnName = "speciality_id")
    private Speciality speciality;

    @Column(unique = true, nullable = false, name = "license_id")
    private String licenseId;

    @Enumerated(EnumType.STRING)
    private DoctorStatus status;
    
    @Column(name = "experience_years")
    private Integer experienceYears;

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Appointment> appointments;

    public Doctor() {}
    
    // Helper method to get speciality name (for backward compatibility)
    public String getSpecializationName() {
        return speciality != null ? speciality.getName() : null;
    }
}

