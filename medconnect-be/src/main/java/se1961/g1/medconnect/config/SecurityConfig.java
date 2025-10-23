package se1961.g1.medconnect.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private FirebaseFilter firebaseFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // bật CORS
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        
                        // Avatar endpoints - authenticated users
                        .requestMatchers("/api/avatar/**").authenticated()
                        
                        // Medical photo endpoints - authenticated users
                        .requestMatchers("/api/medical-photo/**").authenticated()
                        
                        // Patient endpoints - authenticated users
                        .requestMatchers("/api/patient/profile/**").authenticated()
                        .requestMatchers("/api/patient/{userId}").permitAll() // For admin lookup
                        .requestMatchers("/api/patient/update").permitAll() // For admin update
                        
                        // Medical Records endpoints
                        .requestMatchers("/api/medical-records/my-profile").authenticated()
                        .requestMatchers("/api/medical-records").authenticated()
                        .requestMatchers("/api/medical-records/patient/**").authenticated() // TODO: Change back to hasAnyRole("DOCTOR", "ADMIN") after testing
                        .requestMatchers("/api/medical-records/all").hasRole("ADMIN")
                        
                        // EMR endpoints
                        .requestMatchers("/api/emr/my").authenticated() // Patient's own EMR
                        .requestMatchers("/api/emr/firebase/**").authenticated() // Doctor/Admin access patient EMR
                        .requestMatchers("/api/emr/**").authenticated() // Other EMR operations
                        
                        // User endpoints
                        .requestMatchers("/api/user/**").authenticated()
                        
                        // Email endpoints
                        .requestMatchers("/api/email/test").permitAll() // For testing
                        .requestMatchers("/api/email/**").authenticated()
                        
                        // Appointment endpoints
                        .requestMatchers("/api/appointments/my").authenticated() // Patient's appointments
                        .requestMatchers("/api/appointments/doctor").authenticated() // Doctor's appointments
                        .requestMatchers("/api/appointments/doctor/*/available-slots").permitAll() // Public - for booking
                        .requestMatchers("/api/appointments").authenticated() // Create/list appointments
                        .requestMatchers("/api/appointments/**").authenticated() // Other appointment operations
                        
                        // Payment endpoints
                        .requestMatchers("/api/payment/ipn").permitAll() // IPN webhook from SePay
                        .requestMatchers("/api/payment/init").authenticated() // Initialize payment
                        .requestMatchers("/api/payment/**").authenticated() // Other payment operations
                        
                        // Schedule endpoints (Doctor only)
                        .requestMatchers("/api/schedule/**").authenticated()
                        
                        // Doctor endpoints
                        .requestMatchers("/doctor/dashboard/all").permitAll() // Public - for patient booking
                        
                        // Role-based endpoints
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
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // FE port 3000
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
