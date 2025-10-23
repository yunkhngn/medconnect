package se1961.g1.medconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SePayCheckoutResponse {
    private String checkoutUrl;
    private String orderId;
    private String invoiceNumber;
}

