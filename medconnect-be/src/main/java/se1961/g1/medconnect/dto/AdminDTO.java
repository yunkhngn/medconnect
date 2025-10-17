package se1961.g1.medconnect.dto;

import lombok.Data;
import se1961.g1.medconnect.enums.Role;

@Data
public class AdminDTO {
    private Long userId;
    private String email;
    private String firebaseUid;
    private Role role;
    private String status;
}
