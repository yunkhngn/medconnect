package se1961.g1.medconnect.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentInitRequest {
    private Long appointmentId;
    private String returnUrl; // Base URL for callbacks
}

