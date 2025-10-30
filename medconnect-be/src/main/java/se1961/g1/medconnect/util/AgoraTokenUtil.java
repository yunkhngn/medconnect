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
}
