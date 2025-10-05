package se1961.g1.medconnect.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "se1961.g1.medconnect")
@EntityScan(basePackages = "se1961.g1.medconnect.pojo")
@EnableJpaRepositories("se1961.g1.medconnect.repository")
public class MedConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedConnectApplication.class, args);
    }

}
