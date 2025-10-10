package se1961.g1.medconnect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserInfo;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.enums.Services;

@Service
public class FirebaseService {
    @Autowired
    private ServiceIntegrationService siService;

    public FirebaseToken getDecodedToken(String token) throws Exception {
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

        siService.save(Services.FIREBASE, token, decodedToken.toString());

        return decodedToken;
    }

    public String getProvider(String uid) throws Exception {
        UserRecord userRecord = FirebaseAuth.getInstance().getUser(uid);
        for(UserInfo userInfo : userRecord.getProviderData()) {
            if(!"password".equals(userInfo.getProviderId())) {
                return userInfo.getProviderId();
            }
        }
        return "password";
    }
}
