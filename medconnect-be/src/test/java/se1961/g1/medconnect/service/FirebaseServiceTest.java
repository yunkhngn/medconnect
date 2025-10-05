package se1961.g1.medconnect.service;


import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class FirebaseServiceTest {
    @Mock
    private ServiceIntegrationService siService;

    @InjectMocks
    private FirebaseService firebaseService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testVerifyIdToken() throws Exception {
        try(MockedStatic<FirebaseAuth> mockedFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth mockAuth = mock(FirebaseAuth.class);
            FirebaseToken mockToken = mock(FirebaseToken.class);

            when(mockToken.getUid()).thenReturn("uid123");
            when(mockAuth.verifyIdToken("valid-token")).thenReturn(mockToken);
            mockedFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            String uid = firebaseService.verifyIdToken("valid-token");

            assertEquals("uid123", uid);
        }
    }

    @Test
    public void testDecodedToken() throws Exception {
        try(MockedStatic<FirebaseAuth> mockedFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth mockAuth = mock(FirebaseAuth.class);
            FirebaseToken mockToken = mock(FirebaseToken.class);

            when(mockAuth.verifyIdToken("valid-token")).thenReturn(mockToken);
            mockedFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            FirebaseToken result = firebaseService.getDecodedToken("valid-token");

            assertEquals(mockToken, result);
        }
    }
}
