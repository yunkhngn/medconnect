package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.enums.Services;
import se1961.g1.medconnect.pojo.ServiceIntegration;
import se1961.g1.medconnect.repository.ServiceIntegrationRepository;

@Service
public class ServiceIntegrationService {
    @Autowired
    private ServiceIntegrationRepository siRepository;

    public ServiceIntegration save(Services serviceType, String requestData, String responseData) {
        ServiceIntegration si = new ServiceIntegration();
        si.setServiceType(serviceType);
        si.setRequestData(requestData);
        si.setResponseData(responseData);
        return siRepository.save(si);
    }

}
