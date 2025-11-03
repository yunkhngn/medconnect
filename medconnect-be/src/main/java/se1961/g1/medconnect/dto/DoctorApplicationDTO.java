package se1961.g1.medconnect.dto;

import lombok.Data;

@Data
public class DoctorApplicationDTO {
    private String fullName;
    private String email;
    private String phone;
    private Integer specialtyId;  // speciality_id
    private Integer experience;   // experience_years
    private String education;     // education_level
    private String certifications;
    private String bio;
    private String clinicAddress;
    private String workingHours;
}
