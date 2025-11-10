package se1961.g1.medconnect.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateAdminRequest {
    @Email(message = "Email không hợp lệ")
    private String email;
}
