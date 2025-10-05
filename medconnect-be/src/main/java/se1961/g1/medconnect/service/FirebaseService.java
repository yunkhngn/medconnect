package se1961.g1.medconnect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.enums.Services;

@Service
public class FirebaseService {
    @Autowired
    private ServiceIntegrationService siService;

    public String verifyIdToken(String token) throws Exception {
        String uid = FirebaseAuth.getInstance().verifyIdToken(token).getUid();

        siService.save(Services.FIREBASE, token, uid);

        return uid;
    }

    public FirebaseToken getDecodedToken(String token) throws Exception {
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

        siService.save(Services.FIREBASE, token, decodedToken.toString());

        return decodedToken;
    }
}
