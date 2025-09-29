package se1961.g1.medconnect.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "se1961.g1.medconnect.pojo")
public class MedConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedConnectApplication.class, args);
    }

}
