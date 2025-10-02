package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;

@Entity
@Table(name = "ServiceIntegration")
public class ServiceIntegration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long serviceId;

    private String serviceType;
    private String requestData;
    private String responseData;
}

