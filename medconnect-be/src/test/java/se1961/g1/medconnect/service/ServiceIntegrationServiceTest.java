package se1961.g1.medconnect.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import se1961.g1.medconnect.enums.Services;
import se1961.g1.medconnect.pojo.ServiceIntegration;
import se1961.g1.medconnect.repository.ServiceIntegrationRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
    public void testSave() {
        Services serviceType = Services.FIREBASE;
        String  requestData = "requestData";
        String  responseData = "responseData";

        when(siRepository.save(any(ServiceIntegration.class)))
                .thenAnswer(i -> i.getArgument(0));

        ServiceIntegration result = siService.save(serviceType, requestData, responseData);

        assertEquals(serviceType, result.getServiceType());
        assertEquals(requestData, result.getRequestData());
        assertEquals(responseData, result.getResponseData());
    }
}
