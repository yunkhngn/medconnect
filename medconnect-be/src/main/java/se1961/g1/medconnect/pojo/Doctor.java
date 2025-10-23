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

    @Enumerated(EnumType.STRING)
    private DoctorStatus status;
    
    @Column(name = "experience_years")
    private Integer experienceYears; // Số năm kinh nghiệm (nhập thủ công)

    // Relationships
    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Appointment> appointments;
    
    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<License> licenses; // Danh sách giấy phép hành nghề

    public Doctor() {}
    
    // Helper method to get speciality name (for backward compatibility)
    public String getSpecializationName() {
        return speciality != null ? speciality.getName() : null;
    }
    
    /**
     * Get active (valid) license
     */
    public License getActiveLicense() {
        if (licenses == null || licenses.isEmpty()) {
            return null;
        }
        return licenses.stream()
                .filter(License::isValid)
                .findFirst()
                .orElse(null);
    }
}

