package se1961.g1.medconnect.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {
    static {
        Dotenv dotenv = Dotenv.load();
        String path = dotenv.get("GOOGLE_APPLICATION_CREDENTIALS");
        if(path != null) {
            System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", path);
        }
    }
}
