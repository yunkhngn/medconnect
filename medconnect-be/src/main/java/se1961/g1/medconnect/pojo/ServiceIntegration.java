package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import se1961.g1.medconnect.enums.Service;

@Entity
@Table(name = "ServiceIntegration")
public class ServiceIntegration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long serviceId;

    @Enumerated(EnumType.STRING)
    private Service serviceType;

    private String requestData;
    private String responseData;
}

