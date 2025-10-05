package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se1961.g1.medconnect.enums.Services;

@Entity
@Table(name = "ServiceIntegration")
@Getter
@Setter
public class ServiceIntegration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long serviceId;

    @Enumerated(EnumType.STRING)
    private Services serviceType;

    @Column(length = 4000)
    private String requestData;
    private String responseData;
}

