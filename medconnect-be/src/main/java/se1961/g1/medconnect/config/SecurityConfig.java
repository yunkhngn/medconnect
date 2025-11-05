package se1961.g1.medconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import se1961.g1.medconnect.filter.FirebaseFilter;

import java.util.List;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final FirebaseFilter firebaseFilter;

    public SecurityConfig(FirebaseFilter firebaseFilter) {
        this.firebaseFilter = firebaseFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {}) // bật CORS
            .authorizeHttpRequests(auth -> auth
                // Health (public) - MUST BE FIRST!
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/appointments/doctor/*/available-slots").permitAll()
                .requestMatchers("/api/appointments/doctor/{doctorId}/available-slots").permitAll()
                .requestMatchers("/api/specialties/**").permitAll()
                .requestMatchers("/api/specialities/**").permitAll() // backward compatibility
                .requestMatchers("/api/payment/ipn").permitAll() // VNPay webhook
                .requestMatchers("/api/payment/confirm").permitAll() // VNPay callback  
                .requestMatchers("/doctor/dashboard/all").permitAll() // public list of doctors for booking

                // Avatar & media
                .requestMatchers("/api/avatar/**").authenticated()
                .requestMatchers("/api/medical-photo/**").authenticated()

                // Patient
                .requestMatchers("/api/patient/profile/**").authenticated()
                .requestMatchers("/api/patient/{userId}").permitAll() // admin lookup (xem xét khóa bằng ROLE_ADMIN khi lên prod)
                .requestMatchers("/api/patient/update").permitAll()

                // Medical Records / EMR
                .requestMatchers("/api/medical-records/my-profile").authenticated()
                .requestMatchers("/api/medical-records").authenticated()
                .requestMatchers("/api/medical-records/patient/**").authenticated()
                .requestMatchers("/api/medical-records/all").hasRole("ADMIN")
                .requestMatchers("/api/emr/my").authenticated()
                .requestMatchers("/api/emr/firebase/**").authenticated()
                .requestMatchers("/api/emr/**").authenticated()

                // User
                .requestMatchers("/api/user/**").authenticated()

                // Email
                .requestMatchers("/api/email/test").permitAll()
                .requestMatchers("/api/email/**").authenticated()

                // PERMIT VIDEO CALL TOKEN API!
                .requestMatchers("/api/agora/token").permitAll()

                // Appointments
                .requestMatchers("/api/appointments/my").authenticated()
                .requestMatchers("/api/appointments/doctor").authenticated()
                .requestMatchers("/api/appointments").authenticated()
                .requestMatchers("/api/appointments/**").authenticated()

                // Schedule, Licenses
                .requestMatchers("/api/schedule/**").authenticated()
                .requestMatchers("/api/licenses/**").authenticated()

                // Role-based
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/patient/**").hasRole("PATIENT")
                .requestMatchers("/admin/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(firebaseFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // FE domains
        cfg.setAllowedOrigins(List.of(
            "https://medconnects.app",
            "https://www.medconnects.app",
            "http://localhost:3000"
            // nếu deploy FE lên Vercel, thêm origin tại đây, ví dụ: "https://your-app.vercel.app"
        ));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));            // gồm Authorization
        cfg.setAllowCredentials(true);
        // (tuỳ chọn) expose header nếu FE cần đọc:
        // cfg.setExposedHeaders(List.of("Location","Content-Disposition"));

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}