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
    
    @Column(name = "education_level", columnDefinition = "NVARCHAR(255)")
    private String educationLevel; // Trình độ học vấn (VD: Tiến sĩ, Thạc sĩ, Bác sĩ...)
    
    @Column(name = "bio", columnDefinition = "NVARCHAR(MAX)")
    private String bio; // Giới thiệu bản thân
    
    @Column(name = "clinic_address", columnDefinition = "NVARCHAR(500)")
    private String clinicAddress; // Địa chỉ phòng khám

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

