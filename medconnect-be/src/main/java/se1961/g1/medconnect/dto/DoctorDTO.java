package se1961.g1.medconnect.dto;

import lombok.Data;
import se1961.g1.medconnect.enums.DoctorStatus;

@Data
public class DoctorDTO {
    private String name;
    private String email;
    private String phone;
    private Integer specialityId;
    private DoctorStatus status;
    private Integer experienceYears;
    private String educationLevel;
    private String bio;
    private String clinicAddress;
    private Integer provinceCode;
    private String provinceName;
    private Integer districtCode;
    private String districtName;
    private Integer wardCode;
    private String wardName;
}
