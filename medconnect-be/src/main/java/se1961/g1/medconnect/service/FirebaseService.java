package se1961.g1.medconnect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {
    public String verifyIdToken(String token) throws Exception {
        return FirebaseAuth.getInstance().verifyIdToken(token).getUid();
    }

    public FirebaseToken getDecodedToken(String token) throws Exception {
        return FirebaseAuth.getInstance().verifyIdToken(token);
    }
}
