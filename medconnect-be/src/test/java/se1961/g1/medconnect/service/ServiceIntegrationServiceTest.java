package se1961.g1.medconnect.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import se1961.g1.medconnect.enums.Services;
import se1961.g1.medconnect.pojo.ServiceIntegration;
import se1961.g1.medconnect.repository.ServiceIntegrationRepository;

import static org.mockito.Mockito.when;

public class ServiceIntegrationServiceTest {
    @Mock
    private ServiceIntegrationRepository siRepository;

    @InjectMocks
    private ServiceIntegrationService siService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void saveTest() {
        ServiceIntegration si = new ServiceIntegration();
        si.setServiceType(Services.FIREBASE);

        when(siRepository.save(si)).thenReturn(si);


    }
}
