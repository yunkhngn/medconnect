package se1961.g1.medconnect.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AgoraTokenUtil {
    private static String APP_ID;
    private static String APP_CERTIFICATE;

    @Value("${agora.app-id}")
    public void setAppId(String appId) {
        AgoraTokenUtil.APP_ID = appId;
    }

    @Value("${agora.app-certificate}")
    public void setAppCertificate(String cert) {
        AgoraTokenUtil.APP_CERTIFICATE = cert;
    }

    public static String buildToken(String channelName, int uid, int expireSeconds) {
        System.out.println("APP_ID=" + APP_ID + " | CERTIFICATE=" + APP_CERTIFICATE);
        RtcTokenBuilder2 tokenBuilder = new RtcTokenBuilder2();
        return tokenBuilder.buildTokenWithUid(
                APP_ID,
                APP_CERTIFICATE,
                channelName,
                uid,
                RtcTokenBuilder2.Role.ROLE_PUBLISHER,
                expireSeconds,
                0
        );
    }

    // Build token using userAccount (string) to avoid int overflow with large UIDs
    public static String buildTokenWithAccount(String channelName, String userAccount, int expireSeconds) {
        System.out.println("=== AgoraTokenUtil.buildTokenWithAccount ===");
        System.out.println("APP_ID=" + (APP_ID != null ? APP_ID : "NULL"));
        System.out.println("CERTIFICATE=" + (APP_CERTIFICATE != null && !APP_CERTIFICATE.isEmpty() ? "SET (length: " + APP_CERTIFICATE.length() + ")" : "NULL or EMPTY"));
        System.out.println("Channel: " + channelName);
        System.out.println("UserAccount: " + userAccount);
        System.out.println("Expire: " + expireSeconds);
        
        if (APP_ID == null || APP_ID.isEmpty()) {
            System.err.println("❌ ERROR: AGORA_APP_ID is not set!");
            throw new RuntimeException("AGORA_APP_ID chưa được cấu hình");
        }
        
        if (APP_CERTIFICATE == null || APP_CERTIFICATE.isEmpty()) {
            System.err.println("❌ ERROR: AGORA_CERTIFICATE is not set!");
            throw new RuntimeException("AGORA_CERTIFICATE chưa được cấu hình");
        }
        
        try {
            RtcTokenBuilder2 tokenBuilder = new RtcTokenBuilder2();
            String token = tokenBuilder.buildTokenWithUserAccount(
                    APP_ID,
                    APP_CERTIFICATE,
                    channelName,
                    userAccount,
                    RtcTokenBuilder2.Role.ROLE_PUBLISHER,
                    expireSeconds,
                    0
            );
            System.out.println("✅ Token built successfully, length: " + (token != null ? token.length() : 0));
            return token;
        } catch (Exception e) {
            System.err.println("❌ ERROR building token: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể tạo token: " + e.getMessage(), e);
        }
    }
}
