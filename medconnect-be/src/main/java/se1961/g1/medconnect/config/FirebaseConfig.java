package se1961.g1.medconnect.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.InputStream;


@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void init() throws Exception {
        String path = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if(path == null || path.isEmpty()) {
            throw new IllegalAccessException("GOOGLE_APPLICATION_CREDENTIALS is not set");
        }

        try(InputStream serviceAccount = new FileInputStream(path)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        }
    }
}
