package se1961.g1.medconnect.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import se1961.g1.medconnect.pojo.User;
import se1961.g1.medconnect.repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

public class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetUserFound() {
        User user = new User();
        user.setFirebaseUid("uid123");
        user.setEmail("email123");

        when(userRepository.findByFirebaseUid("uid123"))
                .thenReturn(Optional.of(user));

        Optional<User> result = userService.getUser("uid123");

        assertTrue(result.isPresent());
        assertEquals("email123", result.get().getEmail());
    }

    @Test
    public void testGetUserNotFound() {
        when(userRepository.findByFirebaseUid("uid123"))
                .thenReturn(Optional.empty());

        Optional<User> result = userService.getUser("uid123");

        assertTrue(result.isEmpty());
    }
}

