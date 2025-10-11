package se1961.g1.medconnect.filter;

import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import se1961.g1.medconnect.enums.Role;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.service.FirebaseService;
import se1961.g1.medconnect.service.UserService;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class FirebaseFilter extends OncePerRequestFilter {
    @Autowired
    private FirebaseService firebaseService;
    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
        throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            try{
                String token = authHeader.substring(7);
                FirebaseToken decodedToken = firebaseService.getDecodedToken(token);
                String uid = decodedToken.getUid();
                String email = decodedToken.getEmail();

                Optional<User> userOpt = userService.getUser(uid);
                if(userOpt.isPresent()) {
                    Role role = userOpt.get().getRole();
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(uid, null,
                                    Collections.singletonList(
                                            new SimpleGrantedAuthority("ROLE_" + role)));
                    authentication.setDetails(email);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
