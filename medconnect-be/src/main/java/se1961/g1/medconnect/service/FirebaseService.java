package se1961.g1.medconnect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserInfo;
import com.google.firebase.auth.UserRecord;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {
    public FirebaseToken getDecodedToken(String token) throws Exception {
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

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

    public String  getUid(String token) throws Exception {
        FirebaseToken decodedToken = getDecodedToken(token);
        return decodedToken.getUid();
    }

    /**
     * Create Firebase user account (Admin creates for doctor)
     * @param email User email
     * @param password Initial password (typically phone number)
     * @param displayName User display name
     * @return Firebase UID
     */
    public String createFirebaseUser(String email, String password, String displayName) throws Exception {
        try {
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(password)
                    .setDisplayName(displayName)
                    .setEmailVerified(false);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
            return userRecord.getUid();
        } catch (Exception e) {
            throw new Exception("Không thể tạo tài khoản Firebase: " + e.getMessage());
        }
    }

    /**
     * Update Firebase user password
     */
    public void updateFirebaseUserPassword(String uid, String newPassword) throws Exception {
        try {
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(uid)
                    .setPassword(newPassword);
            FirebaseAuth.getInstance().updateUser(request);
        } catch (Exception e) {
            throw new Exception("Không thể cập nhật mật khẩu Firebase: " + e.getMessage());
        }
    }

    /**
     * Get Firebase user by email (if exists)
     * @param email User email
     * @return Firebase UID if user exists, null otherwise
     */
    public String getFirebaseUserByEmail(String email) {
        try {
            UserRecord userRecord = FirebaseAuth.getInstance().getUserByEmail(email);
            return userRecord.getUid();
        } catch (Exception e) {
            // User doesn't exist or other error
            return null;
        }
    }

    /**
     * Delete Firebase user account
     */
    public void deleteFirebaseUser(String uid) throws Exception {
        try {
            FirebaseAuth.getInstance().deleteUser(uid);
        } catch (Exception e) {
            throw new Exception("Không thể xóa tài khoản Firebase: " + e.getMessage());
        }
    }
}
